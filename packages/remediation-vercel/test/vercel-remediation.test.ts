import { describe, expect, it, vi } from "vitest";
import { createRemediationAction, createRemediationPlan, executeRemediation } from "@relyo/remediation";
import { VercelRemediationAdapter } from "../src/index.js";

function action() {
  return createRemediationAction({
    id: "act_deploy",
    kind: "vercel.redeploy",
    requiredCapabilities: ["deployment:write"],
    blastRadius: "One production deployment",
    rollbackMethod: "Rollback to previously active production deployment",
    verificationContracts: ["launch.provider-production", "launch.public-health"],
    target: "prj_1",
    desiredState: {
      currentDeploymentId: "dpl_previous",
      targetDeploymentId: "dpl_candidate",
    },
  });
}

describe("Vercel remediation adapter", () => {
  it("promotes candidate, independently verifies, and avoids rollback on PASS", async () => {
    const urls: string[] = [];
    const fetchImpl: typeof fetch = vi.fn(async (input) => {
      urls.push(String(input));
      return Response.json({});
    });
    const adapter = new VercelRemediationAdapter({
      token: "token",
      projectId: "prj_1",
      teamId: "team_1",
      fetchImpl,
      verifyProduction: async () => "PASS",
    });
    const a = action();
    const result = await executeRemediation({
      plan: createRemediationPlan({ failedContractId: "launch.provider-production", actions: [a] }),
      action: a,
      adapter,
    });
    expect(result.status).toBe("VERIFIED");
    expect(urls).toEqual([
      expect.stringContaining("/v10/projects/prj_1/promote/dpl_candidate?teamId=team_1"),
    ]);
  });

  it("rolls back to checkpoint when verification fails", async () => {
    const urls: string[] = [];
    const fetchImpl: typeof fetch = vi.fn(async (input) => {
      urls.push(String(input));
      return Response.json({});
    });
    const adapter = new VercelRemediationAdapter({
      token: "token",
      projectId: "prj_1",
      fetchImpl,
      verifyProduction: async () => "FAIL",
    });
    const a = action();
    const result = await executeRemediation({
      plan: createRemediationPlan({ failedContractId: "launch.public-health", actions: [a] }),
      action: a,
      adapter,
    });
    expect(result.status).toBe("ROLLED_BACK");
    expect(urls.some((url) => url.includes("/v1/projects/prj_1/rollback/dpl_previous"))).toBe(true);
  });
});
