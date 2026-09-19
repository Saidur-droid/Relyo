import { createEvidenceEnvelope, type ContractResult, type EvidenceEnvelope, type Passport, type ProofContract } from "@relyo/kernel";

export type ContinuousProofTrigger =
  | "deployment"
  | "provider-config-change"
  | "contract-expiry"
  | "scheduled"
  | "dependency-security-event";

export interface ContractFreshnessPolicy {
  contractId: string;
  maxAgeMs: number;
  impactTags: string[];
}

export interface ChangeEvent {
  id: string;
  trigger: ContinuousProofTrigger;
  occurredAt: string;
  releaseSha?: string;
  impactTags: string[];
}

export interface ContinuousProofPlan {
  eventId: string;
  rerunContractIds: string[];
  reusedContractIds: string[];
  reasons: Record<string, string>;
}

export interface PassportFreshness {
  passportId: string;
  evaluatedAt: string;
  fresh: boolean;
  staleContractIds: string[];
  assuranceState: "CURRENT" | "DEGRADED" | "EXPIRED";
  evidence: EvidenceEnvelope[];
}

function resultTime(passport: Passport, result: ContractResult): number | null {
  const refs = new Set(result.evidenceRefs);
  const timestamps = passport.evidence
    .filter((item) => refs.has(item.id))
    .map((item) => Date.parse(item.collectedAt))
    .filter(Number.isFinite);
  if (timestamps.length === 0) return null;
  return Math.max(...timestamps);
}

export function planTargetedReverification(input: {
  event: ChangeEvent;
  passport: Passport;
  policies: ContractFreshnessPolicy[];
  now?: Date;
}): ContinuousProofPlan {
  const now = input.now ?? new Date();
  const policyById = new Map(input.policies.map((policy) => [policy.contractId, policy]));
  const rerun = new Set<string>();
  const reused = new Set<string>();
  const reasons: Record<string, string> = {};

  for (const result of input.passport.results) {
    const policy = policyById.get(result.contractId);
    if (!policy) {
      rerun.add(result.contractId);
      reasons[result.contractId] = "No freshness policy exists, so evidence cannot be reused safely.";
      continue;
    }
    const observedAt = resultTime(input.passport, result);
    const expired = observedAt === null || now.getTime() - observedAt > policy.maxAgeMs;
    const impacted = policy.impactTags.some((tag) => input.event.impactTags.includes(tag));
    const releaseChanged = input.event.trigger === "deployment" && Boolean(input.event.releaseSha)
      && input.passport.release.kind === "git"
      && input.passport.release.commitSha !== input.event.releaseSha;

    if (expired || impacted || releaseChanged || input.event.trigger === "contract-expiry") {
      rerun.add(result.contractId);
      reasons[result.contractId] = expired
        ? "Evidence freshness window expired."
        : releaseChanged
          ? "Deployment release identity changed."
          : "Change event impacts this contract.";
    } else {
      reused.add(result.contractId);
      reasons[result.contractId] = "Existing deterministic evidence remains within freshness and impact policy.";
    }
  }

  return {
    eventId: input.event.id,
    rerunContractIds: [...rerun].sort(),
    reusedContractIds: [...reused].sort(),
    reasons,
  };
}

export function evaluatePassportFreshness(input: {
  passport: Passport;
  policies: ContractFreshnessPolicy[];
  now?: Date;
}): PassportFreshness {
  const now = input.now ?? new Date();
  const policyById = new Map(input.policies.map((policy) => [policy.contractId, policy]));
  const stale: string[] = [];

  for (const result of input.passport.results) {
    const policy = policyById.get(result.contractId);
    const observedAt = resultTime(input.passport, result);
    if (!policy || observedAt === null || now.getTime() - observedAt > policy.maxAgeMs) {
      stale.push(result.contractId);
    }
  }

  const passportExpired = input.passport.expiresAt
    ? Date.parse(input.passport.expiresAt) <= now.getTime()
    : false;
  const assuranceState = passportExpired ? "EXPIRED" : stale.length > 0 ? "DEGRADED" : "CURRENT";
  const evidence = [createEvidenceEnvelope({
    kind: "continuous-proof-freshness",
    source: `passport:${input.passport.id}`,
    payload: {
      passportId: input.passport.id,
      evaluatedAt: now.toISOString(),
      staleContractIds: stale,
      passportExpired,
    },
    collectedAt: now.toISOString(),
    redacted: true,
    summary: {
      staleContractCount: stale.length,
      passportExpired,
      current: assuranceState === "CURRENT",
    },
  })];

  return {
    passportId: input.passport.id,
    evaluatedAt: now.toISOString(),
    fresh: assuranceState === "CURRENT",
    staleContractIds: stale.sort(),
    assuranceState,
    evidence,
  };
}

export function buildContinuousProofContract(freshness: PassportFreshness): ProofContract {
  return {
    id: "continuous.freshness",
    version: "1",
    title: "Continuous Proof freshness",
    requiredFor: ["R4"],
    assertions: [{
      id: "continuous.all-required-evidence-fresh",
      description: "All required proof evidence is inside its declared freshness window",
      status: freshness.assuranceState === "CURRENT" ? "PASS" : "FAIL",
      evidenceRefs: freshness.evidence.map((item) => item.id),
      message: freshness.assuranceState === "CURRENT"
        ? "Passport evidence is current."
        : `Passport is ${freshness.assuranceState.toLowerCase()}; stale contracts: ${freshness.staleContractIds.join(", ") || "none"}.`,
    }],
  };
}
