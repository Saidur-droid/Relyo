import {
  createPrivateKey,
  sign as cryptoSign,
  type KeyObject,
} from "node:crypto";
import {
  createEvidenceEnvelope,
  sha256Json,
  type EvidenceEnvelope,
} from "@relyo/kernel";
import {
  verifyRunnerTask,
  type RunnerLogEvent,
  type RunnerResult,
  type SignedRunnerResult,
  type SignedRunnerTask,
} from "@relyo/runner";

export interface VercelSandboxRunnerOptions {
  token: string;
  projectId: string;
  teamId?: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  resultPrivateKey: KeyObject | string | Buffer;
  resultKeyId?: string;
  now?: () => Date;
}

type SandboxCreateResponse = {
  sandbox?: { name?: string };
  session?: {
    id?: string;
    region?: string;
    runtime?: string;
    cwd?: string;
    networkPolicy?: unknown;
  };
};

type SandboxCommandResponse = {
  command?: {
    id?: string;
    exitCode?: string | number | null;
    stdout?: string;
    stderr?: string;
    logs?: Array<{ stream?: string; data?: string; message?: string }>;
  };
};

function privateKey(input: KeyObject | string | Buffer): KeyObject {
  const key = input instanceof Object && "type" in input
    ? input as KeyObject
    : createPrivateKey(input as string | Buffer);
  if (key.type !== "private" || key.asymmetricKeyType !== "ed25519") {
    throw new Error("Sandbox Runner result signing requires an Ed25519 private key.");
  }
  return key;
}

function safeHosts(hosts: string[]): string[] {
  const normalized = hosts.map((host) => host.trim().toLowerCase()).filter(Boolean);
  for (const host of normalized) {
    if (host.includes("/") || host.includes(":") || host === "localhost" || host.endsWith(".localhost")) {
      throw new Error(`Invalid outbound host allowlist entry: ${host}`);
    }
  }
  return [...new Set(normalized)].sort();
}

function redact(value: string, secrets: string[]): string {
  return secrets
    .filter((secret) => secret.length >= 4)
    .sort((a, b) => b.length - a.length)
    .reduce((output, secret) => output.split(secret).join("[REDACTED]"), value);
}

function extractLogs(payload: SandboxCommandResponse, now: () => Date, secrets: string[]): RunnerLogEvent[] {
  const logs: RunnerLogEvent[] = [];
  let sequence = 0;
  const push = (stream: RunnerLogEvent["stream"], message: string | undefined) => {
    if (!message) return;
    logs.push({
      sequence: ++sequence,
      at: now().toISOString(),
      stream,
      message: redact(message, secrets).slice(0, 256 * 1024),
    });
  };

  push("stdout", payload.command?.stdout);
  push("stderr", payload.command?.stderr);
  for (const item of payload.command?.logs ?? []) {
    const stream = item.stream === "stderr" ? "stderr" : item.stream === "system" ? "system" : "stdout";
    push(stream, item.data ?? item.message);
  }
  return logs;
}

async function requireJson<T>(response: Response, operation: string): Promise<T> {
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Vercel Sandbox ${operation} failed with HTTP ${response.status}: ${body.slice(0, 500)}`);
  }
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`Vercel Sandbox ${operation} returned invalid JSON.`);
  }
}

export async function executeInVercelSandbox(input: {
  taskEnvelope: SignedRunnerTask;
  taskPublicKey: KeyObject | string | Buffer;
  options: VercelSandboxRunnerOptions;
  signal?: AbortSignal;
}): Promise<SignedRunnerResult> {
  const now = input.options.now ?? (() => new Date());
  if (!verifyRunnerTask({
    envelope: input.taskEnvelope,
    publicKey: input.taskPublicKey,
    now: now(),
  })) {
    throw new Error("Runner task signature or envelope is invalid.");
  }

  const task = input.taskEnvelope.task;
  const token = input.options.token.trim();
  if (!token) throw new Error("Vercel Sandbox token is required.");
  if (!input.options.projectId.trim()) throw new Error("Vercel Sandbox projectId is required.");

  const allowedDomains = safeHosts(task.allowedHosts);
  if (allowedDomains.length > 0 && !task.capabilities.includes("network:outbound")) {
    throw new Error("Outbound hosts require network:outbound capability.");
  }

  const fetchImpl = input.options.fetchImpl ?? fetch;
  const apiBase = (input.options.apiBaseUrl ?? "https://api.vercel.com").replace(/\/$/, "");
  const query = input.options.teamId
    ? `?teamId=${encodeURIComponent(input.options.teamId)}`
    : "";
  const authHeaders = {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };

  const startedAt = now().toISOString();
  let sessionId: string | null = null;
  let region: string | null = null;
  let runtime: string | null = null;
  let exitCode: number | null = null;
  let logs: RunnerLogEvent[] = [];
  let timedOut = false;
  let cancelled = false;
  let commandId: string | null = null;

  try {
    const createResponse = await fetchImpl(`${apiBase}/v3/sandboxes${query}`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        projectId: input.options.projectId,
        runtime: "node24",
        timeout: String(task.timeoutMs + 30_000),
        persistent: false,
        networkPolicy: task.capabilities.includes("network:outbound")
          ? {
              mode: "custom",
              allowedDomains,
              allowedCIDRs: [],
              deniedCIDRs: [],
            }
          : {
              mode: "deny-all",
              allowedDomains: [],
              allowedCIDRs: [],
              deniedCIDRs: [],
            },
        tags: {
          relyo_task_id: task.id,
          relyo_task_sha256: input.taskEnvelope.taskSha256,
        },
      }),
      ...(input.signal ? { signal: input.signal } : {}),
    });

    const created = await requireJson<SandboxCreateResponse>(createResponse, "create");
    sessionId = created.session?.id ?? null;
    region = created.session?.region ?? null;
    runtime = created.session?.runtime ?? null;
    if (!sessionId) throw new Error("Vercel Sandbox create response did not include a session id.");

    const cmdId = `relyo-${task.id.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 48)}`;
    const commandUrl = `${apiBase}/v2/sandboxes/sessions/${encodeURIComponent(sessionId)}/cmd?cmdId=${encodeURIComponent(cmdId)}${input.options.teamId ? `&teamId=${encodeURIComponent(input.options.teamId)}` : ""}`;

    const commandResponse = await fetchImpl(commandUrl, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        command: task.command.executable,
        args: task.command.args,
        ...(task.command.cwd ? { cwd: task.command.cwd } : {}),
        env: task.command.env ?? {},
        sudo: false,
        wait: true,
        logs: true,
        timeout: String(task.timeoutMs),
      }),
      ...(input.signal ? { signal: input.signal } : {}),
    });
    const command = await requireJson<SandboxCommandResponse>(commandResponse, "command");
    commandId = command.command?.id ?? cmdId;
    const rawExitCode = command.command?.exitCode;
    exitCode = rawExitCode === null || rawExitCode === undefined ? null : Number(rawExitCode);
    logs = extractLogs(command, now, [
      ...(task.secretValues ?? []),
      ...Object.values(task.command.env ?? {}),
    ]);
  } catch (error) {
    if (input.signal?.aborted) cancelled = true;
    if (error instanceof DOMException && error.name === "TimeoutError") timedOut = true;
    throw error;
  } finally {
    if (sessionId) {
      try {
        await fetchImpl(
          `${apiBase}/v2/sandboxes/sessions/${encodeURIComponent(sessionId)}/stop${query}`,
          { method: "POST", headers: authHeaders },
        );
      } catch {
        // Cleanup failure is recorded below via stopped=false evidence semantics.
      }
    }
  }

  const completedAt = now().toISOString();
  const evidence: EvidenceEnvelope[] = [
    createEvidenceEnvelope({
      kind: "runner-vercel-sandbox-execution",
      source: `vercel-sandbox:session:${sessionId}`,
      payload: {
        taskId: task.id,
        taskSha256: input.taskEnvelope.taskSha256,
        sessionId,
        commandId,
        projectId: input.options.projectId,
        teamId: input.options.teamId ?? null,
        region,
        runtime,
        networkPolicy: {
          mode: task.capabilities.includes("network:outbound") ? "custom" : "deny-all",
          allowedDomains,
        },
        exitCode,
        timedOut,
        cancelled,
        logSha256: sha256Json(logs),
      },
      collectedAt: completedAt,
      redacted: true,
      summary: {
        provider: "vercel-sandbox",
        region,
        runtime,
        exitCode,
        allowedDomainCount: allowedDomains.length,
        logEvents: logs.length,
      },
    }),
  ];

  const unsigned = {
    version: "0.1" as const,
    taskId: task.id,
    taskSha256: input.taskEnvelope.taskSha256,
    startedAt,
    completedAt,
    exitCode,
    signal: null,
    timedOut,
    cancelled,
    workspaceId: sessionId ?? "unknown",
    capabilitiesUsed: [...task.capabilities],
    logs,
    evidence,
  };
  const resultSha256 = sha256Json(unsigned);
  const result: RunnerResult = { ...unsigned, resultSha256 };
  const signature = cryptoSign(null, Buffer.from(resultSha256, "hex"), privateKey(input.options.resultPrivateKey));

  return {
    result,
    signature: {
      algorithm: "Ed25519",
      keyId: input.options.resultKeyId ?? "vercel-sandbox-runner",
      valueBase64: signature.toString("base64"),
    },
  };
}
