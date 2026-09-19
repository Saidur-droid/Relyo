import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createRunnerTask, signRunnerTask, verifyRunnerResult } from "@relyo/runner";
import { executeInVercelSandbox } from "../src/index.js";

function fixture() {
  const control = generateKeyPairSync("ed25519");
  const runner = generateKeyPairSync("ed25519");
  const task = createRunnerTask({
    id: "task_remote",
    issuedAt: "2026-09-19T00:00:00.000Z",
    expiresAt: "2026-09-19T00:10:00.000Z",
    release: { kind: "git", repository: "owner/repo", commitSha: "a".repeat(40) },
    environment: { provider: "vercel", projectId: "proj", environment: "production" },
    capabilities: ["process:execute", "network:outbound"],
    command: {
      executable: "node",
      args: ["-e", "console.log(process.env.SECRET)"],
      env: { SECRET: "top-secret-value" },
    },
    timeoutMs: 30_000,
    allowedHosts: ["api.github.com"],
    secretValues: ["top-secret-value"],
  });
  return {
    control,
    runner,
    envelope: signRunnerTask({ task, privateKey: control.privateKey, keyId: "control" }),
  };
}

describe("Vercel Sandbox Runner", () => {
  it("creates an ephemeral deny-by-default/custom-network sandbox, runs the signed task, redacts logs, signs result, and stops the session", async () => {
    const { control, runner, envelope } = fixture();
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      const url = String(input);
      requests.push({ url, init });
      if (url.includes("/v3/sandboxes")) {
        return Response.json({ session: { id: "sbx_123", region: "iad1", runtime: "node24" } });
      }
      if (url.includes("/cmd?")) {
        return Response.json({
          command: {
            id: "cmd_123",
            exitCode: "0",
            stdout: "top-secret-value\nok\n",
          },
        });
      }
      if (url.endsWith("/stop?teamId=team_1")) {
        return Response.json({ session: { id: "sbx_123", status: "stopped" } });
      }
      return new Response("not found", { status: 404 });
    });

    let tick = Date.parse("2026-09-19T00:01:00.000Z");
    const result = await executeInVercelSandbox({
      taskEnvelope: envelope,
      taskPublicKey: control.publicKey,
      options: {
        token: "test-token",
        projectId: "prj_1",
        teamId: "team_1",
        fetchImpl,
        resultPrivateKey: runner.privateKey,
        now: () => new Date(tick++),
      },
    });

    expect(result.result.workspaceId).toBe("sbx_123");
    expect(result.result.exitCode).toBe(0);
    expect(result.result.logs.map((item) => item.message).join("\n")).toContain("[REDACTED]");
    expect(result.result.logs.map((item) => item.message).join("\n")).not.toContain("top-secret-value");
    expect(verifyRunnerResult({ envelope: result, publicKey: runner.publicKey })).toBe(true);

    const createBody = JSON.parse(String(requests[0]?.init?.body));
    expect(createBody.persistent).toBe(false);
    expect(createBody.networkPolicy).toEqual(expect.objectContaining({
      mode: "custom",
      allowedDomains: ["api.github.com"],
    }));
    expect(requests.some((request) => request.url.includes("/cmd?"))).toBe(true);
    expect(requests.at(-1)?.url).toContain("/stop?teamId=team_1");
  });

  it("rejects invalid outbound allowlist entries before allocating a sandbox", async () => {
    const { control, runner, envelope } = fixture();
    envelope.task.allowedHosts = ["localhost"];
    const fetchImpl = vi.fn<typeof fetch>();
    await expect(executeInVercelSandbox({
      taskEnvelope: envelope,
      taskPublicKey: control.publicKey,
      options: {
        token: "test-token",
        projectId: "prj_1",
        fetchImpl,
        resultPrivateKey: runner.privateKey,
      },
    })).rejects.toThrow();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("always requests session stop after command failure", async () => {
    const { control, runner, envelope } = fixture();
    const urls: string[] = [];
    const fetchImpl: typeof fetch = vi.fn(async (input) => {
      const url = String(input);
      urls.push(url);
      if (url.includes("/v3/sandboxes")) return Response.json({ session: { id: "sbx_fail" } });
      if (url.includes("/cmd?")) return new Response("boom", { status: 500 });
      if (url.includes("/stop")) return Response.json({ session: { id: "sbx_fail", status: "stopped" } });
      return new Response("not found", { status: 404 });
    });

    await expect(executeInVercelSandbox({
      taskEnvelope: envelope,
      taskPublicKey: control.publicKey,
      options: {
        token: "test-token",
        projectId: "prj_1",
        fetchImpl,
        resultPrivateKey: runner.privateKey,
      },
    })).rejects.toThrow("command failed");
    expect(urls.some((url) => url.includes("/stop"))).toBe(true);
  });
});
