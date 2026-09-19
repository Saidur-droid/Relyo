import { describe, expect, it } from "vitest";
import type { Passport } from "@relyo/kernel";
import {
  buildContinuousProofContract,
  evaluatePassportFreshness,
  planTargetedReverification,
} from "../src/index.js";
import { evaluateContract } from "@relyo/kernel";

const base = process.env.RELYO_LIVE_QUALIFICATION_URL;

function livePassport(collectedAt: string): Passport {
  return {
    passportVersion: "0.2",
    id: "pass_live_continuous",
    subject: { id: "relyo-qualification-fixture", displayName: "Relyo Qualification Fixture", kind: "application" },
    release: { kind: "git", repository: "Saidur-droid/Relyo", commitSha: "9".repeat(40) },
    environment: { provider: "render-free", projectId: "relyo-qualification-free", environment: "production" },
    targetAssurance: "R1",
    assurance: "R1",
    issuedAt: collectedAt,
    results: [{
      contractId: "qualification.health",
      contractVersion: "1",
      status: "PASS",
      assertions: [],
      unknowns: [],
      evidenceRefs: ["ev_live_health"],
    }],
    evidence: [{
      id: "ev_live_health",
      kind: "public-http-observation",
      sha256: "a".repeat(64),
      collectedAt,
      source: base ?? "unconfigured",
      redacted: true,
    }],
    exclusions: [],
    verifier: { name: "Relyo", version: "live-qualification" },
  };
}

const policy = [{
  contractId: "qualification.health",
  maxAgeMs: 120_000,
  impactTags: ["runtime", "availability"],
}];

describe.skipIf(!base)("live Continuous Proof qualification", () => {
  it("detects a controlled runtime break, targets only impacted proof, and returns to current after recovery", async () => {
    const healthResponse = await fetch(`${base}/health`);
    expect(healthResponse.ok).toBe(true);
    const health = await healthResponse.json() as { ok?: boolean };
    expect(health.ok).toBe(true);

    const observedAt = new Date().toISOString();
    const current = evaluatePassportFreshness({
      passport: livePassport(observedAt),
      policies: policy,
      now: new Date(observedAt),
    });
    expect(current.assuranceState).toBe("CURRENT");
    expect(evaluateContract(buildContinuousProofContract(current)).status).toBe("PASS");

    const start = await fetch(`${base}/api/resilience/start`, { method: "POST" });
    expect(start.ok).toBe(true);
    const created = await start.json() as { id: string };
    const id = created.id;

    try {
      const inject = await fetch(`${base}/api/resilience/${encodeURIComponent(id)}/inject`, { method: "POST" });
      expect(inject.ok).toBe(true);

      const failed = await fetch(`${base}/api/resilience/${encodeURIComponent(id)}/verify`);
      expect(failed.ok).toBe(true);
      const failedState = await failed.json() as { healthy?: boolean };
      expect(failedState.healthy).toBe(false);

      const eventAt = new Date().toISOString();
      const plan = planTargetedReverification({
        event: {
          id: `evt_${id}`,
          trigger: "provider-config-change",
          occurredAt: eventAt,
          impactTags: ["runtime"],
        },
        passport: livePassport(observedAt),
        policies: policy,
        now: new Date(eventAt),
      });
      expect(plan.rerunContractIds).toEqual(["qualification.health"]);
      expect(plan.reusedContractIds).toEqual([]);

      const recover = await fetch(`${base}/api/resilience/${encodeURIComponent(id)}/recover`, { method: "POST" });
      expect(recover.ok).toBe(true);

      const recovered = await fetch(`${base}/api/resilience/${encodeURIComponent(id)}/verify`);
      expect(recovered.ok).toBe(true);
      const recoveredState = await recovered.json() as { healthy?: boolean; recoveryCount?: number };
      expect(recoveredState.healthy).toBe(true);
      expect(recoveredState.recoveryCount).toBeGreaterThanOrEqual(1);

      const refreshedAt = new Date().toISOString();
      const refreshed = evaluatePassportFreshness({
        passport: livePassport(refreshedAt),
        policies: policy,
        now: new Date(refreshedAt),
      });
      expect(refreshed.assuranceState).toBe("CURRENT");
      expect(evaluateContract(buildContinuousProofContract(refreshed)).status).toBe("PASS");
    } finally {
      await fetch(`${base}/api/resilience/${encodeURIComponent(id)}`, { method: "DELETE" });
    }
  }, 30_000);
});
