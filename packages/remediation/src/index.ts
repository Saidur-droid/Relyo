import { randomUUID } from "node:crypto";
import { createEvidenceEnvelope, type ActionRiskClass, type EvidenceEnvelope } from "@relyo/kernel";

export type RemediationActionKind =
  | "vercel.env.update"
  | "vercel.redeploy"
  | "supabase.auth.redirect.update"
  | "supabase.rls.policy.add"
  | "dns.guidance"
  | "email.guidance";

export interface RemediationAction {
  id: string;
  kind: RemediationActionKind;
  risk: ActionRiskClass;
  requiredCapabilities: string[];
  blastRadius: string;
  rollbackMethod: string;
  verificationContracts: string[];
  target: string;
  desiredState: Record<string, string | number | boolean | null>;
}

export interface RemediationPlan {
  id: string;
  failedContractId: string;
  createdAt: string;
  actions: RemediationAction[];
}

export interface ApprovalRecord {
  actionId: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface RollbackCheckpoint {
  actionId: string;
  capturedAt: string;
  opaqueState: unknown;
}

export interface RemediationAdapter {
  capture(action: RemediationAction): Promise<unknown>;
  apply(action: RemediationAction): Promise<void>;
  verify(action: RemediationAction): Promise<"PASS" | "FAIL" | "UNKNOWN">;
  rollback(action: RemediationAction, checkpoint: unknown): Promise<void>;
}

export interface RemediationExecution {
  planId: string;
  actionId: string;
  status: "SKIPPED" | "APPLIED" | "VERIFIED" | "ROLLED_BACK" | "FAILED";
  evidence: EvidenceEnvelope[];
  verification: "PASS" | "FAIL" | "UNKNOWN" | null;
  error?: string;
}

const DEFAULT_RISK: Record<RemediationActionKind, ActionRiskClass> = {
  "vercel.env.update": "APPROVAL_REQUIRED",
  "vercel.redeploy": "SAFE_REVERSIBLE",
  "supabase.auth.redirect.update": "APPROVAL_REQUIRED",
  "supabase.rls.policy.add": "APPROVAL_REQUIRED",
  "dns.guidance": "HUMAN_ONLY",
  "email.guidance": "HUMAN_ONLY",
};

export function createRemediationAction(input: Omit<RemediationAction, "id" | "risk"> & {
  id?: string;
  risk?: ActionRiskClass;
}): RemediationAction {
  const risk = input.risk ?? DEFAULT_RISK[input.kind];
  if (risk === "FORBIDDEN") throw new Error("Forbidden remediation cannot be scheduled.");
  if (input.verificationContracts.length === 0) throw new Error("Remediation must declare contracts to re-verify.");
  if (!input.rollbackMethod.trim() && risk !== "HUMAN_ONLY") {
    throw new Error("Automated remediation must declare a rollback method.");
  }
  return {
    id: input.id ?? `act_${randomUUID()}`,
    kind: input.kind,
    risk,
    requiredCapabilities: [...new Set(input.requiredCapabilities)],
    blastRadius: input.blastRadius,
    rollbackMethod: input.rollbackMethod,
    verificationContracts: [...new Set(input.verificationContracts)],
    target: input.target,
    desiredState: { ...input.desiredState },
  };
}

export function createRemediationPlan(input: {
  failedContractId: string;
  actions: RemediationAction[];
  createdAt?: string;
}): RemediationPlan {
  return {
    id: `rem_${randomUUID()}`,
    failedContractId: input.failedContractId,
    createdAt: input.createdAt ?? new Date().toISOString(),
    actions: input.actions,
  };
}

function requiresApproval(action: RemediationAction): boolean {
  return action.risk === "APPROVAL_REQUIRED";
}

export async function executeRemediation(input: {
  plan: RemediationPlan;
  action: RemediationAction;
  adapter: RemediationAdapter;
  approval?: ApprovalRecord;
  now?: () => Date;
}): Promise<RemediationExecution> {
  const now = input.now ?? (() => new Date());
  if (!input.plan.actions.some((action) => action.id === input.action.id)) {
    throw new Error("Action is not part of remediation plan.");
  }
  if (input.action.risk === "HUMAN_ONLY") {
    return {
      planId: input.plan.id,
      actionId: input.action.id,
      status: "SKIPPED",
      verification: null,
      evidence: [createEvidenceEnvelope({
        kind: "remediation-human-checkpoint",
        source: `remediation:${input.action.id}`,
        payload: { risk: input.action.risk, target: input.action.target },
        collectedAt: now().toISOString(),
        redacted: true,
      })],
    };
  }
  if (requiresApproval(input.action) && (!input.approval?.approved || input.approval.actionId !== input.action.id)) {
    throw new Error("Explicit approval is required for this remediation.");
  }

  const checkpoint = await input.adapter.capture(input.action);
  const evidence: EvidenceEnvelope[] = [createEvidenceEnvelope({
    kind: "remediation-checkpoint",
    source: `remediation:${input.action.id}`,
    payload: { actionId: input.action.id, target: input.action.target, captured: true },
    collectedAt: now().toISOString(),
    redacted: true,
  })];

  try {
    await input.adapter.apply(input.action);
    const verification = await input.adapter.verify(input.action);
    evidence.push(createEvidenceEnvelope({
      kind: "remediation-verification",
      source: `remediation:${input.action.id}`,
      payload: {
        actionId: input.action.id,
        verification,
        contracts: input.action.verificationContracts,
      },
      collectedAt: now().toISOString(),
      redacted: true,
    }));

    if (verification === "PASS") {
      return { planId: input.plan.id, actionId: input.action.id, status: "VERIFIED", verification, evidence };
    }

    await input.adapter.rollback(input.action, checkpoint);
    evidence.push(createEvidenceEnvelope({
      kind: "remediation-rollback",
      source: `remediation:${input.action.id}`,
      payload: { actionId: input.action.id, reason: `verification:${verification}` },
      collectedAt: now().toISOString(),
      redacted: true,
    }));
    return { planId: input.plan.id, actionId: input.action.id, status: "ROLLED_BACK", verification, evidence };
  } catch (error) {
    try {
      await input.adapter.rollback(input.action, checkpoint);
      evidence.push(createEvidenceEnvelope({
        kind: "remediation-rollback",
        source: `remediation:${input.action.id}`,
        payload: { actionId: input.action.id, reason: "execution-error" },
        collectedAt: now().toISOString(),
        redacted: true,
      }));
    } catch {
      evidence.push(createEvidenceEnvelope({
        kind: "remediation-rollback-failed",
        source: `remediation:${input.action.id}`,
        payload: { actionId: input.action.id },
        collectedAt: now().toISOString(),
        redacted: true,
      }));
    }
    return {
      planId: input.plan.id,
      actionId: input.action.id,
      status: "FAILED",
      verification: null,
      evidence,
      error: error instanceof Error ? error.message : "Unknown remediation error.",
    };
  }
}
