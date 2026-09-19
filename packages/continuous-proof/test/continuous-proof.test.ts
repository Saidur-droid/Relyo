import { describe, expect, it } from "vitest";
import type { Passport } from "@relyo/kernel";
import { buildContinuousProofContract, evaluatePassportFreshness, planTargetedReverification } from "../src/index.js";
import { evaluateContract } from "@relyo/kernel";

function fixture(): Passport {
  return {
    passportVersion: "0.2",
    id: "pass",
    subject: { id: "app", displayName: "App", kind: "application" },
    release: { kind: "git", repository: "o/r", commitSha: "a".repeat(40) },
    environment: { provider: "vercel", projectId: "p", environment: "production" },
    targetAssurance: "R1",
    assurance: "R1",
    issuedAt: "2026-09-19T00:00:00.000Z",
    results: [
      { contractId: "launch.http", contractVersion: "1", status: "PASS", assertions: [], unknowns: [], evidenceRefs: ["ev_http"] },
      { contractId: "launch.repo", contractVersion: "1", status: "PASS", assertions: [], unknowns: [], evidenceRefs: ["ev_repo"] },
    ],
    evidence: [
      { id: "ev_http", kind: "http", sha256: "a".repeat(64), collectedAt: "2026-09-19T00:00:00.000Z", source: "http", redacted: true },
      { id: "ev_repo", kind: "repo", sha256: "b".repeat(64), collectedAt: "2026-09-19T00:00:00.000Z", source: "github", redacted: true },
    ],
    exclusions: [],
    verifier: { name: "Relyo", version: "1" },
  };
}

const policies = [
  { contractId: "launch.http", maxAgeMs: 60_000, impactTags: ["runtime"] },
  { contractId: "launch.repo", maxAgeMs: 86_400_000, impactTags: ["source"] },
];

describe("Continuous Proof", () => {
  it("reruns only impacted or stale contracts", () => {
    const plan = planTargetedReverification({
      event: { id: "evt", trigger: "provider-config-change", occurredAt: "2026-09-19T00:00:30.000Z", impactTags: ["runtime"] },
      passport: fixture(),
      policies,
      now: new Date("2026-09-19T00:00:30.000Z"),
    });
    expect(plan.rerunContractIds).toEqual(["launch.http"]);
    expect(plan.reusedContractIds).toEqual(["launch.repo"]);
  });

  it("forces exact-release contracts to rerun on deployment changes", () => {
    const plan = planTargetedReverification({
      event: { id: "evt", trigger: "deployment", occurredAt: "2026-09-19T00:00:10.000Z", releaseSha: "b".repeat(40), impactTags: [] },
      passport: fixture(),
      policies,
      now: new Date("2026-09-19T00:00:10.000Z"),
    });
    expect(plan.rerunContractIds).toEqual(["launch.http", "launch.repo"]);
  });

  it("degrades stale passports instead of silently preserving assurance", () => {
    const freshness = evaluatePassportFreshness({
      passport: fixture(),
      policies,
      now: new Date("2026-09-19T00:02:00.000Z"),
    });
    expect(freshness.assuranceState).toBe("DEGRADED");
    expect(freshness.staleContractIds).toEqual(["launch.http"]);
    expect(evaluateContract(buildContinuousProofContract(freshness)).status).toBe("FAIL");
  });
});
