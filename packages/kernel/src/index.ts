import { createHash, randomUUID } from "node:crypto";

export type ContractStatus = "PASS" | "FAIL" | "PARTIAL" | "UNKNOWN";
export type AssuranceLevel = "R0" | "R1" | "R2" | "R3" | "R4";
export type ActionRiskClass =
  | "OBSERVE"
  | "SAFE_REVERSIBLE"
  | "APPROVAL_REQUIRED"
  | "HUMAN_ONLY"
  | "FORBIDDEN";

export interface Subject {
  id: string;
  displayName: string;
  kind: "application" | "repository" | "public-url";
}

export type ReleaseIdentity =
  | {
      kind: "git";
      repository: string;
      commitSha: string;
      buildId?: string;
    }
  | {
      kind: "url-observation";
      url: string;
      observedAt: string;
    };

export interface EnvironmentIdentity {
  provider: string;
  projectId: string;
  environment: string;
  url?: string;
}

export interface ProductionGraphNode {
  id: string;
  type:
    | "repository"
    | "framework"
    | "deployment"
    | "database"
    | "auth"
    | "payment"
    | "email"
    | "dns"
    | "external-api"
    | "unknown";
  label: string;
  provider?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface ProductionGraphEdge {
  from: string;
  to: string;
  relation: string;
}

export interface ProductionGraph {
  nodes: ProductionGraphNode[];
  edges: ProductionGraphEdge[];
  unknowns: string[];
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
  summary?: Record<string, string | number | boolean | null>;
}

export interface ContractResult {
  contractId: string;
  contractVersion: string;
  status: ContractStatus;
  assertions: Assertion[];
  unknowns: string[];
  evidenceRefs: string[];
}

export type ProofRunState =
  | "DISCOVERING"
  | "VERIFYING"
  | "VERIFIED"
  | "FAILED"
  | "PARTIAL";

export interface ProofRun {
  id: string;
  subject: Subject;
  state: ProofRunState;
  targetAssurance: AssuranceLevel;
  startedAt: string;
  completedAt?: string;
}

export interface Passport {
  passportVersion: "0.2";
  id: string;
  subject: Subject;
  release: ReleaseIdentity;
  environment: EnvironmentIdentity;
  targetAssurance: AssuranceLevel;
  assurance: AssuranceLevel;
  issuedAt: string;
  expiresAt?: string;
  results: ContractResult[];
  evidence: EvidenceEnvelope[];
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

const ASSURANCE_ORDER: AssuranceLevel[] = ["R0", "R1", "R2", "R3", "R4"];

function minimumRequiredLevel(contract: ProofContract): AssuranceLevel | null {
  const levels = contract.requiredFor
    .map((level) => ASSURANCE_ORDER.indexOf(level))
    .filter((index) => index > 0)
    .sort((a, b) => a - b);

  return levels.length === 0 ? null : ASSURANCE_ORDER[levels[0]!]!;
}

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
    const targetIndex = ASSURANCE_ORDER.indexOf(level);
    const introducedAtLevel = contracts.filter(
      (contract) => minimumRequiredLevel(contract) === level,
    );

    if (introducedAtLevel.length === 0) break;

    const requiredThroughLevel = contracts.filter((contract) => {
      const minimum = minimumRequiredLevel(contract);
      if (!minimum) return false;
      return ASSURANCE_ORDER.indexOf(minimum) <= targetIndex;
    });

    const allPass = requiredThroughLevel.every(
      (contract) => resultMap.get(contract.id)?.status === "PASS",
    );

    if (!allPass) break;
    achieved = level;
  }

  return achieved;
}

export function createPassport(input: {
  subject: Subject;
  release: ReleaseIdentity;
  environment: EnvironmentIdentity;
  targetAssurance: AssuranceLevel;
  contracts: ProofContract[];
  evidence: EvidenceEnvelope[];
  verifier: VerifierIdentity;
  exclusions?: string[];
  issuedAt?: string;
  expiresAt?: string;
}): Passport {
  const results = input.contracts.map(evaluateContract);
  const assurance = computeAssurance(input.contracts, results);

  return {
    passportVersion: "0.2",
    id: `pass_${randomUUID()}`,
    subject: input.subject,
    release: input.release,
    environment: input.environment,
    targetAssurance: input.targetAssurance,
    assurance,
    issuedAt: input.issuedAt ?? new Date().toISOString(),
    ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
    results,
    evidence: input.evidence,
    exclusions: input.exclusions ?? [],
    verifier: input.verifier,
  };
}

export function worstStatus(statuses: ContractStatus[]): ContractStatus {
  if (statuses.length === 0) return "UNKNOWN";
  return [...statuses].sort((a, b) => STATUS_ORDER[a] - STATUS_ORDER[b])[0]!;
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;

  const object = value as Record<string, unknown>;
  const keys = Object.keys(object).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize(object[key])}`).join(",")}}`;
}

export function sha256Json(value: unknown): string {
  return createHash("sha256").update(canonicalize(value)).digest("hex");
}

export function createEvidenceEnvelope(input: {
  kind: string;
  source: string;
  payload: unknown;
  collectedAt?: string;
  redacted?: boolean;
  summary?: Record<string, string | number | boolean | null>;
}): EvidenceEnvelope {
  return {
    id: `ev_${randomUUID()}`,
    kind: input.kind,
    sha256: sha256Json(input.payload),
    collectedAt: input.collectedAt ?? new Date().toISOString(),
    source: input.source,
    redacted: input.redacted ?? true,
    ...(input.summary ? { summary: input.summary } : {}),
  };
}
