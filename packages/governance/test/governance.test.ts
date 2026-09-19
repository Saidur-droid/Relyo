import { describe, expect, it } from "vitest";
import { approveRequest, authorizeAction, evaluateReleasePolicy, normalizeScimUser } from "../src/index.js";

describe("enterprise governance", () => {
  it("enforces organization-scoped RBAC", () => {
    expect(authorizeAction({ id: "u", organizationId: "org", roles: ["verifier"] }, "proof:run", "org")).toBe(true);
    expect(authorizeAction({ id: "u", organizationId: "org", roles: ["admin"] }, "policy:write", "other")).toBe(false);
  });

  it("denies releases below assurance, freshness, verifier, private runner or residency policy", () => {
    const policy = {
      id: "p", organizationId: "org", name: "Customer data",
      minimumAssurance: "R3" as const, requireFreshPassport: true,
      allowedVerifierIds: ["trusted"], requirePrivateRunner: true, dataResidency: ["eu"],
    };
    const denied = evaluateReleasePolicy(policy, {
      organizationId: "org", assurance: "R2", passportFresh: false, verifierId: "other", privateRunner: false, dataRegion: "us",
    });
    expect(denied.decision).toBe("DENY");
    expect(denied.reasons.length).toBe(5);
    expect(evaluateReleasePolicy(policy, {
      organizationId: "org", assurance: "R3", passportFresh: true, verifierId: "trusted", privateRunner: true, dataRegion: "eu",
    }).decision).toBe("ALLOW");
  });

  it("prevents self-approval and requires approver role", () => {
    const request = {
      id: "req", organizationId: "org", actionId: "act", risk: "APPROVAL_REQUIRED" as const,
      requestedBy: { id: "agent", kind: "coding-agent" as const, organizationId: "org", displayName: "Agent" },
      requiredRole: "approver" as const, status: "PENDING" as const,
    };
    expect(() => approveRequest({ request, principal: { id: "agent", organizationId: "org", roles: ["approver"] }, approve: true })).toThrow("self-approve");
    expect(approveRequest({ request, principal: { id: "human", organizationId: "org", roles: ["approver"] }, approve: true }).status).toBe("APPROVED");
  });

  it("normalizes SCIM users to least-privilege viewer when no role is supplied", () => {
    expect(normalizeScimUser({ externalId: "e", userName: "u", active: true, organizationId: "org", roles: [] }).roles).toEqual(["viewer"]);
  });
});
