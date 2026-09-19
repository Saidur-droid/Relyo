import type { ActionRiskClass, AssuranceLevel } from "@relyo/kernel";

export type GovernanceRole = "viewer" | "verifier" | "operator" | "approver" | "admin";
export type GovernanceAction =
  | "proof:read"
  | "proof:run"
  | "remediation:execute"
  | "approval:grant"
  | "policy:write"
  | "release:authorize"
  | "runner:manage";

const ROLE_PERMISSIONS: Record<GovernanceRole, Set<GovernanceAction>> = {
  viewer: new Set(["proof:read"]),
  verifier: new Set(["proof:read", "proof:run"]),
  operator: new Set(["proof:read", "proof:run", "remediation:execute"]),
  approver: new Set(["proof:read", "proof:run", "approval:grant", "release:authorize"]),
  admin: new Set(["proof:read", "proof:run", "remediation:execute", "approval:grant", "policy:write", "release:authorize", "runner:manage"]),
};

export interface AgentIdentity {
  id: string;
  kind: "human" | "coding-agent" | "ci" | "builder";
  organizationId: string;
  displayName: string;
}

export interface GovernancePrincipal {
  id: string;
  organizationId: string;
  roles: GovernanceRole[];
  agent?: AgentIdentity;
}

export interface ReleasePolicy {
  id: string;
  organizationId: string;
  name: string;
  minimumAssurance: AssuranceLevel;
  requireFreshPassport: boolean;
  allowedVerifierIds?: string[];
  requirePrivateRunner?: boolean;
  dataResidency?: string[];
  approvalForRisk?: ActionRiskClass[];
}

export interface ReleaseContext {
  organizationId: string;
  assurance: AssuranceLevel;
  passportFresh: boolean;
  verifierId: string;
  privateRunner: boolean;
  dataRegion?: string;
}

export interface PolicyDecision {
  decision: "ALLOW" | "DENY";
  reasons: string[];
  policyId: string;
}

const ASSURANCE_ORDER: AssuranceLevel[] = ["R0", "R1", "R2", "R3", "R4"];

export function authorizeAction(principal: GovernancePrincipal, action: GovernanceAction, organizationId: string): boolean {
  if (principal.organizationId !== organizationId) return false;
  return principal.roles.some((role) => ROLE_PERMISSIONS[role].has(action));
}

export function evaluateReleasePolicy(policy: ReleasePolicy, context: ReleaseContext): PolicyDecision {
  if (policy.organizationId !== context.organizationId) return { decision: "DENY", policyId: policy.id, reasons: ["Policy organization does not match release organization."] };
  const reasons: string[] = [];
  if (ASSURANCE_ORDER.indexOf(context.assurance) < ASSURANCE_ORDER.indexOf(policy.minimumAssurance)) {
    reasons.push(`Assurance ${context.assurance} is below required ${policy.minimumAssurance}.`);
  }
  if (policy.requireFreshPassport && !context.passportFresh) reasons.push("Production Passport is stale or degraded.");
  if (policy.allowedVerifierIds?.length && !policy.allowedVerifierIds.includes(context.verifierId)) reasons.push("Verifier is not trusted by policy.");
  if (policy.requirePrivateRunner && !context.privateRunner) reasons.push("Policy requires a private runner.");
  if (policy.dataResidency?.length && (!context.dataRegion || !policy.dataResidency.includes(context.dataRegion))) {
    reasons.push("Execution/evidence region is outside allowed data residency.");
  }
  return { decision: reasons.length === 0 ? "ALLOW" : "DENY", reasons, policyId: policy.id };
}

export interface ApprovalRequest {
  id: string;
  organizationId: string;
  actionId: string;
  risk: ActionRiskClass;
  requestedBy: AgentIdentity;
  requiredRole: GovernanceRole;
  status: "PENDING" | "APPROVED" | "DENIED";
  approvedBy?: string;
}

export function approveRequest(input: {
  request: ApprovalRequest;
  principal: GovernancePrincipal;
  approve: boolean;
}): ApprovalRequest {
  if (input.request.organizationId !== input.principal.organizationId) throw new Error("Cross-organization approval denied.");
  if (!input.principal.roles.includes(input.request.requiredRole) && !input.principal.roles.includes("admin")) {
    throw new Error("Principal does not hold the required approval role.");
  }
  if (input.request.requestedBy.id === input.principal.id) {
    throw new Error("Creator/fixer cannot self-approve this action.");
  }
  return {
    ...input.request,
    status: input.approve ? "APPROVED" : "DENIED",
    approvedBy: input.principal.id,
  };
}

export interface ScimUser {
  externalId: string;
  userName: string;
  active: boolean;
  organizationId: string;
  roles: GovernanceRole[];
}

export function normalizeScimUser(input: ScimUser): ScimUser {
  if (!input.externalId.trim() || !input.userName.trim()) throw new Error("SCIM identity requires externalId and userName.");
  if (input.roles.length === 0) return { ...input, roles: ["viewer"] };
  return { ...input, roles: [...new Set(input.roles)] };
}
