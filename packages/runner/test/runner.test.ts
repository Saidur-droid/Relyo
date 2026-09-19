import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createRunnerTask, executeRunnerTask, signRunnerTask, verifyRunnerResult, verifyRunnerTask } from "../src/index.js";

function fixture() {
  const control = generateKeyPairSync("ed25519");
  const runner = generateKeyPairSync("ed25519");
  const now = new Date("2026-09-19T00:00:00.000Z");
  const task = createRunnerTask({
    id: "task_test",
    issuedAt: "2026-09-18T23:59:00.000Z",
    expiresAt: "2026-09-19T00:05:00.000Z",
    release: { kind: "git", repository: "owner/repo", commitSha: "a".repeat(40) },
    environment: { provider: "test", projectId: "proj", environment: "test" },
    capabilities: ["process:execute"],
    command: { executable: process.execPath, args: ["-e", "console.log('ok')"] },
    timeoutMs: 5_000,
    allowedHosts: [],
  });
  return { control, runner, now, task };
}

describe("Relyo Runner v0", () => {
  it("rejects a tampered task envelope", () => {
    const { control, now, task } = fixture();
    const signed = signRunnerTask({ task, privateKey: control.privateKey, keyId: "control" });
    signed.task.command.args = ["-e", "console.log('tampered')"];
    expect(verifyRunnerTask({ envelope: signed, publicKey: control.publicKey, now })).toBe(false);
  });

  it("executes a signed task in a disposable workspace and signs the result", async () => {
    const { control, runner, now, task } = fixture();
    const signed = signRunnerTask({ task, privateKey: control.privateKey, keyId: "control" });
    let tick = now.getTime();
    const result = await executeRunnerTask({
      taskEnvelope: signed,
      taskPublicKey: control.publicKey,
      resultPrivateKey: runner.privateKey,
      resultKeyId: "runner-1",
      now: () => new Date(tick++),
    });
    expect(result.result.exitCode).toBe(0);
    expect(result.result.logs.some((event) => event.message.includes("ok"))).toBe(true);
    expect(result.result.evidence).toHaveLength(1);
    expect(verifyRunnerResult({ envelope: result, publicKey: runner.publicKey })).toBe(true);
  });

  it("redacts secret values from structured logs", async () => {
    const { control, runner, now, task } = fixture();
    task.command = {
      executable: process.execPath,
      args: ["-e", "console.log(process.env.TEST_SECRET)"],
      env: { TEST_SECRET: "top-secret-value" },
    };
    task.secretValues = ["top-secret-value"];
    const signed = signRunnerTask({ task, privateKey: control.privateKey, keyId: "control" });
    let tick = now.getTime();
    const result = await executeRunnerTask({
      taskEnvelope: signed,
      taskPublicKey: control.publicKey,
      resultPrivateKey: runner.privateKey,
      now: () => new Date(tick++),
    });
    const joined = result.result.logs.map((event) => event.message).join("\n");
    expect(joined).toContain("[REDACTED]");
    expect(joined).not.toContain("top-secret-value");
  });

  it("enforces hard timeouts", async () => {
    const { control, runner, now, task } = fixture();
    task.command = { executable: process.execPath, args: ["-e", "setTimeout(() => {}, 10000)"] };
    task.timeoutMs = 20;
    const signed = signRunnerTask({ task, privateKey: control.privateKey, keyId: "control" });
    let tick = now.getTime();
    const result = await executeRunnerTask({
      taskEnvelope: signed,
      taskPublicKey: control.publicKey,
      resultPrivateKey: runner.privateKey,
      now: () => new Date(tick++),
    });
    expect(result.result.timedOut).toBe(true);
    expect(result.result.exitCode === null || result.result.exitCode !== 0).toBe(true);
  });
});
