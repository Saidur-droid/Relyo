export type ContractStatus = "PASS" | "FAIL" | "PARTIAL" | "UNKNOWN";
export type AssuranceLevel = "R0" | "R1" | "R2" | "R3" | "R4";
export type ActionRiskClass =
  | "OBSERVE"
  | "SAFE_REVERSIBLE"
  | "APPROVAL_REQUIRED"
  | "HUMAN_ONLY"
  | "FORBIDDEN";

export interface ReleaseIdentity {
  repository: string;
  commitSha: string;
  buildId?: string;
}

export interface EnvironmentIdentity {
  provider: string;
  projectId: string;
  environment: string;
  url?: string;
}

export interface Assertion {
  id: string;
  description: string;
  status: ContractStatus;
  evidenceRefs: string[];
  message?: string;
}

export interface ProofContract {
  id: string;
  version: string;
  title: string;
  requiredFor: AssuranceLevel[];
  assertions: Assertion[];
  expiresAt?: string;
}

export interface EvidenceEnvelope {
  id: string;
  kind: string;
  sha256: string;
  collectedAt: string;
  source: string;
  redacted: boolean;
}

export interface ContractResult {
  contractId: string;
  contractVersion: string;
  status: ContractStatus;
  assertions: Assertion[];
  unknowns: string[];
  evidenceRefs: string[];
}

export interface Passport {
  passportVersion: "0.1";
  release: ReleaseIdentity;
  environment: EnvironmentIdentity;
  assurance: AssuranceLevel;
  issuedAt: string;
  expiresAt?: string;
  results: ContractResult[];
  exclusions: string[];
  verifier: VerifierIdentity;
}

export interface VerifierIdentity {
  name: string;
  version: string;
}

const STATUS_ORDER: Record<ContractStatus, number> = {
  FAIL: 0,
  UNKNOWN: 1,
  PARTIAL: 2,
  PASS: 3,
};

export function evaluateContract(contract: ProofContract): ContractResult {
  const statuses = contract.assertions.map((assertion) => assertion.status);
  const status = statuses.length === 0
    ? "UNKNOWN"
    : statuses.includes("FAIL")
      ? "FAIL"
      : statuses.includes("UNKNOWN")
        ? "UNKNOWN"
        : statuses.includes("PARTIAL")
          ? "PARTIAL"
          : "PASS";

  const unknowns = contract.assertions
    .filter((assertion) => assertion.status === "UNKNOWN")
    .map((assertion) => assertion.description);

  const evidenceRefs = Array.from(
    new Set(contract.assertions.flatMap((assertion) => assertion.evidenceRefs)),
  );

  return {
    contractId: contract.id,
    contractVersion: contract.version,
    status,
    assertions: contract.assertions,
    unknowns,
    evidenceRefs,
  };
}

export function computeAssurance(
  contracts: ProofContract[],
  results: ContractResult[],
): AssuranceLevel {
  const resultMap = new Map(results.map((result) => [result.contractId, result]));
  const orderedLevels: AssuranceLevel[] = ["R1", "R2", "R3", "R4"];
  let achieved: AssuranceLevel = "R0";

  for (const level of orderedLevels) {
    const required = contracts.filter((contract) => contract.requiredFor.includes(level));
    if (required.length === 0) break;

    const allPass = required.every(
      (contract) => resultMap.get(contract.id)?.status === "PASS",
    );

    if (!allPass) break;
    achieved = level;
  }

  return achieved;
}

export function createPassport(input: {
  release: ReleaseIdentity;
  environment: EnvironmentIdentity;
  contracts: ProofContract[];
  verifier: VerifierIdentity;
  exclusions?: string[];
  issuedAt?: string;
  expiresAt?: string;
}): Passport {
  const results = input.contracts.map(evaluateContract);
  const assurance = computeAssurance(input.contracts, results);

  return {
    passportVersion: "0.1",
    release: input.release,
    environment: input.environment,
    assurance,
    issuedAt: input.issuedAt ?? new Date().toISOString(),
    ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
    results,
    exclusions: input.exclusions ?? [],
    verifier: input.verifier,
  };
}

export function worstStatus(statuses: ContractStatus[]): ContractStatus {
  if (statuses.length === 0) return "UNKNOWN";
  return [...statuses].sort((a, b) => STATUS_ORDER[a] - STATUS_ORDER[b])[0]!;
}
