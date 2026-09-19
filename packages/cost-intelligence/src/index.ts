import { createEvidenceEnvelope, type EvidenceEnvelope } from "@relyo/kernel";

export type CostResourceKind =
  | "llm"
  | "database"
  | "image-generation"
  | "external-api"
  | "serverless"
  | "bandwidth"
  | "storage"
  | "other";

export interface CostEvent {
  id: string;
  journeyId?: string;
  provider: string;
  resourceKind: CostResourceKind;
  operation: string;
  quantity: number;
  unit: string;
  occurredAt: string;
  unitPriceUsd?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface CostBudget {
  maxJourneyCostUsd?: number;
  maxReleaseCostUsd?: number;
  maxOperationCostUsd?: number;
}

export interface CostContributor {
  key: string;
  provider: string;
  resourceKind: CostResourceKind;
  operation: string;
  knownCostUsd: number;
  unknownEventCount: number;
  eventCount: number;
}

export interface CostReport {
  knownCostUsd: number;
  unknownEventCount: number;
  contributors: CostContributor[];
  warnings: string[];
  evidence: EvidenceEnvelope[];
}

function validEvent(event: CostEvent): boolean {
  return Number.isFinite(event.quantity) && event.quantity >= 0
    && (event.unitPriceUsd === undefined || (Number.isFinite(event.unitPriceUsd) && event.unitPriceUsd >= 0));
}

export function analyzeCosts(input: {
  events: CostEvent[];
  budget?: CostBudget;
  scope: "journey" | "release";
  source: string;
  collectedAt?: string;
}): CostReport {
  if (input.events.some((event) => !validEvent(event))) {
    throw new Error("Cost events must contain finite non-negative quantity and price values.");
  }
  const grouped = new Map<string, CostContributor>();
  let knownCostUsd = 0;
  let unknownEventCount = 0;
  const warnings: string[] = [];

  for (const event of input.events) {
    const key = `${event.provider}:${event.resourceKind}:${event.operation}`;
    const current = grouped.get(key) ?? {
      key,
      provider: event.provider,
      resourceKind: event.resourceKind,
      operation: event.operation,
      knownCostUsd: 0,
      unknownEventCount: 0,
      eventCount: 0,
    };
    current.eventCount += 1;
    if (event.unitPriceUsd === undefined) {
      current.unknownEventCount += 1;
      unknownEventCount += 1;
    } else {
      const cost = event.quantity * event.unitPriceUsd;
      current.knownCostUsd += cost;
      knownCostUsd += cost;
      if (input.budget?.maxOperationCostUsd !== undefined && cost > input.budget.maxOperationCostUsd) {
        warnings.push(`Operation ${key} cost $${cost.toFixed(6)} exceeds operation budget $${input.budget.maxOperationCostUsd.toFixed(6)}.`);
      }
    }
    grouped.set(key, current);
  }

  const totalBudget = input.scope === "journey"
    ? input.budget?.maxJourneyCostUsd
    : input.budget?.maxReleaseCostUsd;
  if (totalBudget !== undefined && knownCostUsd > totalBudget) {
    warnings.push(`Known ${input.scope} cost $${knownCostUsd.toFixed(6)} exceeds budget $${totalBudget.toFixed(6)}.`);
  }
  if (unknownEventCount > 0) {
    warnings.push(`${unknownEventCount} cost event(s) have unknown pricing; total cost is a lower bound, not a complete estimate.`);
  }

  const contributors = [...grouped.values()].sort((a, b) => b.knownCostUsd - a.knownCostUsd);
  const collectedAt = input.collectedAt ?? new Date().toISOString();
  const evidence = [createEvidenceEnvelope({
    kind: "cost-intelligence-report",
    source: input.source,
    payload: {
      scope: input.scope,
      knownCostUsd,
      unknownEventCount,
      contributors,
      warnings,
    },
    collectedAt,
    redacted: true,
    summary: {
      knownCostUsd,
      unknownEventCount,
      warningCount: warnings.length,
      contributorCount: contributors.length,
    },
  })];

  return { knownCostUsd, unknownEventCount, contributors, warnings, evidence };
}

export function dominantCostContributors(report: CostReport, limit = 5): CostContributor[] {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Cost contributor limit must be between 1 and 100.");
  return report.contributors.slice(0, limit);
}
