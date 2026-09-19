import {
  createPrivateKey,
  createPublicKey,
  randomUUID,
  sign as cryptoSign,
  verify as cryptoVerify,
  type KeyObject,
} from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { spawn } from "node:child_process";
import { createEvidenceEnvelope, sha256Json, type EnvironmentIdentity, type EvidenceEnvelope, type ReleaseIdentity } from "@relyo/kernel";

export type RunnerCapability =
  | "process:execute"
  | "filesystem:read"
  | "filesystem:write"
  | "network:outbound"
  | "artifact:write";

export interface RunnerCommand {
  executable: string;
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
}

export interface RunnerTask {
  version: "0.1";
  id: string;
  issuedAt: string;
  expiresAt: string;
  release: ReleaseIdentity;
  environment: EnvironmentIdentity;
  capabilities: RunnerCapability[];
  command: RunnerCommand;
  timeoutMs: number;
  allowedHosts: string[];
  secretValues?: string[];
}

export interface SignedRunnerTask {
  task: RunnerTask;
  taskSha256: string;
  signature: {
    algorithm: "Ed25519";
    keyId: string;
    valueBase64: string;
  };
}

export interface RunnerLogEvent {
  sequence: number;
  at: string;
  stream: "system" | "stdout" | "stderr";
  message: string;
}

export interface RunnerResult {
  version: "0.1";
  taskId: string;
  taskSha256: string;
  startedAt: string;
  completedAt: string;
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  cancelled: boolean;
  workspaceId: string;
  capabilitiesUsed: RunnerCapability[];
  logs: RunnerLogEvent[];
  evidence: EvidenceEnvelope[];
  resultSha256: string;
}

export interface SignedRunnerResult {
  result: RunnerResult;
  signature: {
    algorithm: "Ed25519";
    keyId: string;
    valueBase64: string;
  };
}

export interface RunnerExecutionOptions {
  taskEnvelope: SignedRunnerTask;
  taskPublicKey: KeyObject | string | Buffer;
  resultPrivateKey: KeyObject | string | Buffer;
  resultKeyId?: string;
  signal?: AbortSignal;
  now?: () => Date;
  networkPolicy?: (task: RunnerTask) => Promise<void> | void;
}

const MAX_TIMEOUT_MS = 10 * 60_000;
const MAX_LOG_BYTES = 512 * 1024;

function asPrivateKey(key: KeyObject | string | Buffer): KeyObject {
  const value = key instanceof Object && "type" in key ? key as KeyObject : createPrivateKey(key as string | Buffer);
  if (value.type !== "private" || value.asymmetricKeyType !== "ed25519") {
    throw new Error("Runner signing requires an Ed25519 private key.");
  }
  return value;
}

function asPublicKey(key: KeyObject | string | Buffer): KeyObject {
  const value = key instanceof Object && "type" in key
    ? (key as KeyObject).type === "public" ? key as KeyObject : createPublicKey(key as KeyObject)
    : createPublicKey(key as string | Buffer);
  if (value.asymmetricKeyType !== "ed25519") {
    throw new Error("Runner verification requires an Ed25519 public key.");
  }
  return value;
}

function redactor(values: string[]): (value: string) => string {
  const secrets = values.filter((value) => value.length >= 4).sort((a, b) => b.length - a.length);
  return (input: string) => secrets.reduce((output, secret) => output.split(secret).join("[REDACTED]"), input);
}

function assertTask(task: RunnerTask, now: Date): void {
  if (task.version !== "0.1") throw new Error("Unsupported runner task version.");
  if (!task.id.startsWith("task_")) throw new Error("Invalid runner task identity.");
  if (!Number.isInteger(task.timeoutMs) || task.timeoutMs <= 0 || task.timeoutMs > MAX_TIMEOUT_MS) {
    throw new Error("Runner timeout is outside the allowed range.");
  }
  const expiry = Date.parse(task.expiresAt);
  const issued = Date.parse(task.issuedAt);
  if (!Number.isFinite(expiry) || !Number.isFinite(issued) || expiry <= issued) {
    throw new Error("Runner task timestamps are invalid.");
  }
  if (now.getTime() > expiry) throw new Error("Runner task envelope has expired.");
  if (!task.capabilities.includes("process:execute")) throw new Error("Runner task lacks process:execute capability.");
  if (task.command.cwd?.includes("..")) throw new Error("Runner task cwd must stay inside its isolated workspace.");
  if (task.allowedHosts.length > 0 && !task.capabilities.includes("network:outbound")) {
    throw new Error("Network allowlist requires network:outbound capability.");
  }
}

export function createRunnerTask(input: Omit<RunnerTask, "version" | "id"> & { id?: string }): RunnerTask {
  return {
    version: "0.1",
    id: input.id ?? `task_${randomUUID()}`,
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt,
    release: input.release,
    environment: input.environment,
    capabilities: [...new Set(input.capabilities)],
    command: {
      executable: input.command.executable,
      args: [...input.command.args],
      ...(input.command.cwd ? { cwd: input.command.cwd } : {}),
      ...(input.command.env ? { env: { ...input.command.env } } : {}),
    },
    timeoutMs: input.timeoutMs,
    allowedHosts: [...new Set(input.allowedHosts)],
    ...(input.secretValues ? { secretValues: [...input.secretValues] } : {}),
  };
}

export function signRunnerTask(input: {
  task: RunnerTask;
  privateKey: KeyObject | string | Buffer;
  keyId: string;
}): SignedRunnerTask {
  const privateKey = asPrivateKey(input.privateKey);
  const taskSha256 = sha256Json(input.task);
  const signature = cryptoSign(null, Buffer.from(taskSha256, "hex"), privateKey);
  return {
    task: input.task,
    taskSha256,
    signature: {
      algorithm: "Ed25519",
      keyId: input.keyId,
      valueBase64: signature.toString("base64"),
    },
  };
}

export function verifyRunnerTask(input: {
  envelope: SignedRunnerTask;
  publicKey: KeyObject | string | Buffer;
  now?: Date;
}): boolean {
  if (input.envelope.signature.algorithm !== "Ed25519") return false;
  const digest = sha256Json(input.envelope.task);
  if (digest !== input.envelope.taskSha256) return false;
  try {
    assertTask(input.envelope.task, input.now ?? new Date());
    return cryptoVerify(
      null,
      Buffer.from(digest, "hex"),
      asPublicKey(input.publicKey),
      Buffer.from(input.envelope.signature.valueBase64, "base64"),
    );
  } catch {
    return false;
  }
}

function safeWorkspaceCwd(root: string, cwd?: string): string {
  if (!cwd) return root;
  const target = resolve(root, cwd);
  if (target !== root && !target.startsWith(root + sep)) {
    throw new Error("Runner task cwd escapes isolated workspace.");
  }
  return target;
}

export async function executeRunnerTask(options: RunnerExecutionOptions): Promise<SignedRunnerResult> {
  const now = options.now ?? (() => new Date());
  if (!verifyRunnerTask({ envelope: options.taskEnvelope, publicKey: options.taskPublicKey, now: now() })) {
    throw new Error("Runner task signature or envelope is invalid.");
  }

  const task = options.taskEnvelope.task;
  await options.networkPolicy?.(task);

  const startedAt = now().toISOString();
  const workspace = await mkdtemp(join(tmpdir(), "relyo-runner-"));
  const workspaceId = workspace.split(sep).pop() ?? "unknown";
  const redact = redactor([
    ...(task.secretValues ?? []),
    ...Object.values(task.command.env ?? {}),
  ]);
  const logs: RunnerLogEvent[] = [];
  let logBytes = 0;
  let sequence = 0;
  const append = (stream: RunnerLogEvent["stream"], chunk: string) => {
    if (logBytes >= MAX_LOG_BYTES) return;
    const sanitized = redact(chunk);
    const remaining = MAX_LOG_BYTES - logBytes;
    const bounded = Buffer.from(sanitized).subarray(0, remaining).toString();
    logBytes += Buffer.byteLength(bounded);
    logs.push({ sequence: ++sequence, at: now().toISOString(), stream, message: bounded });
  };

  let exitCode: number | null = null;
  let exitSignal: string | null = null;
  let timedOut = false;
  let cancelled = false;

  try {
    const cwd = safeWorkspaceCwd(workspace, task.command.cwd);
    const child = spawn(task.command.executable, task.command.args, {
      cwd,
      env: {
        PATH: process.env.PATH ?? "",
        LANG: "C.UTF-8",
        LC_ALL: "C.UTF-8",
        ...task.command.env,
      },
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      windowsHide: true,
    });

    child.stdout.on("data", (chunk: Buffer) => append("stdout", chunk.toString("utf8")));
    child.stderr.on("data", (chunk: Buffer) => append("stderr", chunk.toString("utf8")));

    const terminate = (reason: "timeout" | "cancel") => {
      if (reason === "timeout") timedOut = true;
      if (reason === "cancel") cancelled = true;
      append("system", `Task terminated: ${reason}.`);
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!child.killed) child.kill("SIGKILL");
      }, 1_000).unref();
    };

    const timer = setTimeout(() => terminate("timeout"), task.timeoutMs);
    const onAbort = () => terminate("cancel");
    options.signal?.addEventListener("abort", onAbort, { once: true });

    const outcome = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolvePromise, reject) => {
      child.once("error", reject);
      child.once("close", (code, signal) => resolvePromise({ code, signal }));
    }).finally(() => {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
    });

    exitCode = outcome.code;
    exitSignal = outcome.signal;
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }

  const completedAt = now().toISOString();
  const evidence = [
    createEvidenceEnvelope({
      kind: "runner-execution",
      source: `runner:task:${task.id}`,
      payload: {
        taskId: task.id,
        taskSha256: options.taskEnvelope.taskSha256,
        exitCode,
        signal: exitSignal,
        timedOut,
        cancelled,
        workspaceId,
        logSha256: sha256Json(logs),
      },
      collectedAt: completedAt,
      redacted: true,
      summary: {
        exitCode,
        timedOut,
        cancelled,
        logEvents: logs.length,
      },
    }),
  ];

  const unsigned = {
    version: "0.1" as const,
    taskId: task.id,
    taskSha256: options.taskEnvelope.taskSha256,
    startedAt,
    completedAt,
    exitCode,
    signal: exitSignal,
    timedOut,
    cancelled,
    workspaceId,
    capabilitiesUsed: [...task.capabilities],
    logs,
    evidence,
  };
  const resultSha256 = sha256Json(unsigned);
  const result: RunnerResult = { ...unsigned, resultSha256 };
  const privateKey = asPrivateKey(options.resultPrivateKey);
  const signature = cryptoSign(null, Buffer.from(resultSha256, "hex"), privateKey);

  return {
    result,
    signature: {
      algorithm: "Ed25519",
      keyId: options.resultKeyId ?? "runner-default",
      valueBase64: signature.toString("base64"),
    },
  };
}

export function verifyRunnerResult(input: {
  envelope: SignedRunnerResult;
  publicKey: KeyObject | string | Buffer;
}): boolean {
  if (input.envelope.signature.algorithm !== "Ed25519") return false;
  const { resultSha256, ...unsigned } = input.envelope.result;
  const digest = sha256Json(unsigned);
  if (digest !== resultSha256) return false;
  return cryptoVerify(
    null,
    Buffer.from(digest, "hex"),
    asPublicKey(input.publicKey),
    Buffer.from(input.envelope.signature.valueBase64, "base64"),
  );
}
