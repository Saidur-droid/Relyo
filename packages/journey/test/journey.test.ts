import { describe, expect, it } from "vitest";
import { evaluateContract } from "@relyo/kernel";
import { buildR2JourneyContract, executeJourney, type JourneyDriver, type JourneyStepResult } from "../src/index.js";

function ok(title: string): JourneyStepResult {
  return {
    id: "driver-id",
    title,
    status: "PASS",
    startedAt: "2026-09-19T00:00:00.000Z",
    completedAt: "2026-09-19T00:00:01.000Z",
  };
}

class FakeDriver implements JourneyDriver {
  cleanupCalls = 0;
  async signup() { return ok("Sign up"); }
  async verifyIdentity() { return ok("Verify identity"); }
  async assertAuthenticated() { return ok("Authenticated session"); }
  async createPrimaryResource() { return ok("Create primary resource"); }
  async executeCoreAction() { return ok("Execute core action"); }
  async logout() { return ok("Logout"); }
  async loginAgain() { return ok("Repeat login"); }
  async cleanup() { this.cleanupCalls++; return ok("Cleanup"); }
  async checkout() { return ok("Checkout"); }
  async awaitWebhook() { return ok("Webhook"); }
  async assertEntitlementActive() { return ok("Entitlement active"); }
  async cancelSubscription() { return ok("Cancel"); }
  async assertEntitlementRevoked() { return ok("Entitlement revoked"); }
  async dispose() {}
}

describe("R2 journey engine", () => {
  it("runs a reproducible SaaS journey with cleanup and payment lifecycle", async () => {
    const driver = new FakeDriver();
    const run = await executeJourney({
      definition: { id: "saas-customer", version: "1", title: "Synthetic SaaS customer", includePaymentLifecycle: true },
      driver,
      source: "runner:test",
      now: () => new Date("2026-09-19T00:00:00.000Z"),
    });
    expect(driver.cleanupCalls).toBe(1);
    expect(run.steps).toHaveLength(13);
    expect(evaluateContract(buildR2JourneyContract(run)).status).toBe("PASS");
  });

  it("keeps missing optional payment driver operations UNKNOWN", async () => {
    const driver = new FakeDriver();
    driver.checkout = undefined as never;
    const run = await executeJourney({
      definition: { id: "saas-customer", version: "1", title: "Synthetic SaaS customer", includePaymentLifecycle: true },
      driver,
      source: "runner:test",
    });
    expect(run.steps.find((step) => step.id === "journey.checkout")?.status).toBe("UNKNOWN");
    expect(evaluateContract(buildR2JourneyContract(run)).status).toBe("UNKNOWN");
  });

  it("attempts cleanup even when a core step throws", async () => {
    const driver = new FakeDriver();
    driver.executeCoreAction = async () => { throw new Error("core failed"); };
    const run = await executeJourney({
      definition: { id: "saas-customer", version: "1", title: "Synthetic SaaS customer" },
      driver,
      source: "runner:test",
    });
    expect(driver.cleanupCalls).toBe(1);
    expect(run.steps.find((step) => step.id === "journey.core-action")?.status).toBe("FAIL");
  });
});
