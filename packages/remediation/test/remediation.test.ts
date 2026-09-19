import { describe, expect, it } from "vitest";
import { createRemediationAction, createRemediationPlan, executeRemediation, type RemediationAdapter } from "../src/index.js";

function adapter(verification: "PASS" | "FAIL" | "UNKNOWN", failApply = false) {
  const calls: string[] = [];
  const value: RemediationAdapter = {
    async capture() { calls.push("capture"); return { previous: true }; },
    async apply() { calls.push("apply"); if (failApply) throw new Error("apply failed"); },
    async verify() { calls.push("verify"); return verification; },
    async rollback() { calls.push("rollback"); },
  };
  return { value, calls };
}

function fixture() {
  const action = createRemediationAction({
    id: "act_test",
    kind: "vercel.redeploy",
    requiredCapabilities: ["deployment:write"],
    blastRadius: "One deployment",
    rollbackMethod: "Promote previous READY deployment",
    verificationContracts: ["launch.provider-production"],
    target: "project",
    desiredState: { redeploy: true },
  });
  return { action, plan: createRemediationPlan({ failedContractId: "launch.provider-production", actions: [action] }) };
}

describe("safe remediation", () => {
  it("independently verifies successful remediation", async () => {
    const { action, plan } = fixture();
    const fake = adapter("PASS");
    const result = await executeRemediation({ plan, action, adapter: fake.value });
    expect(result.status).toBe("VERIFIED");
    expect(fake.calls).toEqual(["capture", "apply", "verify"]);
  });

  it("rolls back when independent verification fails", async () => {
    const { action, plan } = fixture();
    const fake = adapter("FAIL");
    const result = await executeRemediation({ plan, action, adapter: fake.value });
    expect(result.status).toBe("ROLLED_BACK");
    expect(fake.calls).toEqual(["capture", "apply", "verify", "rollback"]);
  });

  it("requires explicit approval for approval-required actions", async () => {
    const action = createRemediationAction({
      id: "act_env",
      kind: "vercel.env.update",
      requiredCapabilities: ["env:write"],
      blastRadius: "One production environment variable",
      rollbackMethod: "Restore previous environment value",
      verificationContracts: ["launch.production-environment"],
      target: "project",
      desiredState: { KEY: "present" },
    });
    const plan = createRemediationPlan({ failedContractId: "launch.production-environment", actions: [action] });
    const fake = adapter("PASS");
    await expect(executeRemediation({ plan, action, adapter: fake.value })).rejects.toThrow("Explicit approval");
    expect(fake.calls).toEqual([]);
  });

  it("records a human checkpoint without mutating", async () => {
    const action = createRemediationAction({
      id: "act_dns",
      kind: "dns.guidance",
      requiredCapabilities: [],
      blastRadius: "DNS record",
      rollbackMethod: "",
      verificationContracts: ["launch.public-https"],
      target: "example.com",
      desiredState: { guidance: true },
    });
    const plan = createRemediationPlan({ failedContractId: "launch.public-https", actions: [action] });
    const fake = adapter("PASS");
    const result = await executeRemediation({ plan, action, adapter: fake.value });
    expect(result.status).toBe("SKIPPED");
    expect(fake.calls).toEqual([]);
  });
});
