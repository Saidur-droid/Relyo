import { describe, expect, it } from "vitest";
import { evaluateContract } from "@relyo/kernel";
import { assertSafeResilienceScenario, buildR3ResilienceContract, runResilienceScenario, type RecoveryStepResult, type ResilienceDriver, type ResilienceScenario } from "../src/index.js";

const pass = (): RecoveryStepResult => ({
  status: "PASS",
  startedAt: "2026-09-19T00:00:00.000Z",
  completedAt: "2026-09-19T00:00:01.000Z",
});

function scenario(kind: ResilienceScenario["kind"] = "deployment-rollback"): ResilienceScenario {
  return { id: "scenario", kind, title: "Recovery proof", environment: "isolated", destructivePotential: false, timeoutMs: 60_000 };
}

function driver(verify: "PASS" | "FAIL" = "PASS") {
  const calls: string[] = [];
  const value: ResilienceDriver = {
    async createCheckpoint() { calls.push("checkpoint"); return { id: "cp" }; },
    async injectFailure() { calls.push("inject"); return pass(); },
    async recover() { calls.push("recover"); return pass(); },
    async verifyRecoveredOutcome() { calls.push("verify"); return { ...pass(), status: verify }; },
    async restoreCheckpoint() { calls.push("restore"); },
  };
  return { value, calls };
}

describe("R3 resilience", () => {
  it("requires actual failure, recovery and independent re-verification", async () => {
    const fake = driver();
    const run = await runResilienceScenario({ scenario: scenario(), driver: fake.value, source: "test" });
    expect(evaluateContract(buildR3ResilienceContract(run)).status).toBe("PASS");
    expect(fake.calls).toEqual(["checkpoint", "inject", "recover", "verify", "restore"]);
  });

  it("fails when recovered outcome cannot be reproduced", async () => {
    const fake = driver("FAIL");
    const run = await runResilienceScenario({ scenario: scenario(), driver: fake.value, source: "test" });
    expect(evaluateContract(buildR3ResilienceContract(run)).status).toBe("FAIL");
  });

  it("forbids destructive or database-restore experiments in production", () => {
    expect(() => assertSafeResilienceScenario({ ...scenario("database-restore"), environment: "production" })).toThrow();
    expect(() => assertSafeResilienceScenario({ ...scenario(), environment: "production", destructivePotential: true })).toThrow();
  });
});
