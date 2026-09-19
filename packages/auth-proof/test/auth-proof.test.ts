import { describe, expect, it } from "vitest";
import { buildAuthProofContract, runAuthProof, type AuthJourneyDriver, type AuthStepObservation } from "../src/index.js";
import { evaluateContract } from "@relyo/kernel";

function step(success: boolean, at = "2026-09-19T00:00:00.000Z"): AuthStepObservation {
  return { attempted: true, success, observedAt: at };
}

class FakeDriver implements AuthJourneyDriver {
  constructor(private readonly authenticatedFlow = true, private readonly rejectUnauthenticated = true) {}
  async beginFreshSession() {}
  async initiateAuthorization() { return step(this.authenticatedFlow); }
  async completeCallback() { return step(this.authenticatedFlow); }
  async observeSession() { return { ...step(this.authenticatedFlow), sessionPresent: this.authenticatedFlow }; }
  async visitProtectedRoute() { return step(this.authenticatedFlow); }
  async logout() { return step(true); }
  async visitProtectedRouteUnauthenticated() { return step(this.rejectUnauthenticated); }
  async dispose() {}
}

describe("Auth Proof", () => {
  it("passes only when login, callback, session, logout, repeat login and unauthorized rejection all pass", async () => {
    const observation = await runAuthProof({
      provider: "github",
      source: "test",
      driverFactory: async () => new FakeDriver(),
      now: () => new Date("2026-09-19T00:00:00.000Z"),
    });
    const result = evaluateContract(buildAuthProofContract(observation));
    expect(result.status).toBe("PASS");
    expect(result.assertions).toHaveLength(9);
  });

  it("fails a superficially successful login when fresh unauthenticated access is accepted", async () => {
    const observation = await runAuthProof({
      provider: "google",
      source: "test",
      driverFactory: async () => new FakeDriver(true, false),
      now: () => new Date("2026-09-19T00:00:00.000Z"),
    });
    const result = evaluateContract(buildAuthProofContract(observation));
    expect(result.status).toBe("FAIL");
    expect(result.assertions.find((assertion) => assertion.id === "auth.unauthorized-fresh-session")?.status).toBe("FAIL");
  });

  it("keeps unavailable steps UNKNOWN instead of inflating trust", () => {
    const unknown = { attempted: false, success: null, observedAt: "2026-09-19T00:00:00.000Z" } as const;
    const result = evaluateContract(buildAuthProofContract({
      provider: "github",
      freshSession: true,
      authorizationInitiation: unknown,
      callback: unknown,
      sessionCreation: unknown,
      protectedRoute: unknown,
      logout: unknown,
      unauthorizedAfterLogout: unknown,
      repeatLogin: unknown,
      unauthorizedFreshSession: unknown,
      evidence: [],
    }));
    expect(result.status).toBe("UNKNOWN");
  });
});
