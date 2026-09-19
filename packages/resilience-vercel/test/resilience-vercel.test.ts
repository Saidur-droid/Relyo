import { describe, expect, it, vi } from "vitest";
import { buildR3ResilienceContract, runResilienceScenario } from "@relyo/resilience";
import { evaluateContract } from "@relyo/kernel";
import { VercelRollbackResilienceDriver } from "../src/index.js";

const scenario = {
  id: "rollback-test",
  kind: "deployment-rollback" as const,
  title: "Deployment rollback recovery",
  environment: "staging" as const,
  destructivePotential: false,
  timeoutMs: 60_000,
};

describe("Vercel R3 recovery driver", () => {
  it("proves candidate observation, rollback and independent stable verification", async () => {
    const urls: string[] = [];
    const fetchImpl: typeof fetch = vi.fn(async (input) => {
      urls.push(String(input));
      return Response.json({});
    });
    const seen: string[] = [];
    const driver = new VercelRollbackResilienceDriver({
      token: "token",
      projectId: "prj_123",
      candidateDeploymentId: "dpl_candidate",
      stableDeploymentId: "dpl_stable",
      fetchImpl,
      verifyDeployment: async (id) => { seen.push(id); return "PASS"; },
      now: () => new Date("2026-09-19T00:00:00Z"),
    });
    const run = await runResilienceScenario({ scenario, driver, source: "test", now: () => new Date("2026-09-19T00:00:00Z") });
    expect(evaluateContract(buildR3ResilienceContract(run)).status).toBe("PASS");
    expect(urls[0]).toContain("/promote/dpl_candidate");
    expect(urls[1]).toContain("/rollback/dpl_stable");
    expect(seen).toContain("dpl_candidate");
    expect(seen.filter((id) => id === "dpl_stable").length).toBeGreaterThanOrEqual(2);
  });

  it("hard-refuses production testing", async () => {
    const driver = new VercelRollbackResilienceDriver({
      token: "token",
      projectId: "prj_123",
      candidateDeploymentId: "dpl_candidate",
      stableDeploymentId: "dpl_stable",
      fetchImpl: vi.fn(),
      verifyDeployment: async () => "PASS",
    });
    await expect(driver.createCheckpoint({ ...scenario, environment: "production" })).rejects.toThrow("refuses production");
  });
});
