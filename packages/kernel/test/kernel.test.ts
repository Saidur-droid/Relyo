import { describe, expect, it } from "vitest";
import {
  computeAssurance,
  createPassport,
  evaluateContract,
  type ProofContract,
} from "../src/index.js";

const r1Contract: ProofContract = {
  id: "launch.http",
  version: "1.0.0",
  title: "Production HTTP readiness",
  requiredFor: ["R1", "R2", "R3", "R4"],
  assertions: [
    {
      id: "https",
      description: "Production URL is reachable over HTTPS",
      status: "PASS",
      evidenceRefs: ["evidence:https"],
    },
  ],
};

const r2Contract: ProofContract = {
  id: "journey.signup",
  version: "1.0.0",
  title: "Signup journey",
  requiredFor: ["R2", "R3", "R4"],
  assertions: [
    {
      id: "signup",
      description: "Fresh user can complete signup",
      status: "PASS",
      evidenceRefs: ["evidence:signup"],
    },
  ],
};

describe("trust kernel", () => {
  it("evaluates passing contracts deterministically", () => {
    expect(evaluateContract(r1Contract).status).toBe("PASS");
  });

  it("stops assurance at the highest fully proven level", () => {
    const results = [r1Contract, r2Contract].map(evaluateContract);
    expect(computeAssurance([r1Contract, r2Contract], results)).toBe("R2");
  });

  it("does not turn unknown evidence into pass", () => {
    const unknown: ProofContract = {
      ...r1Contract,
      assertions: [
        {
          id: "https",
          description: "Production URL is reachable over HTTPS",
          status: "UNKNOWN",
          evidenceRefs: [],
        },
      ],
    };

    expect(evaluateContract(unknown).status).toBe("UNKNOWN");
    expect(computeAssurance([unknown], [evaluateContract(unknown)])).toBe("R0");
  });

  it("creates a passport bound to release and environment", () => {
    const passport = createPassport({
      release: { repository: "Saidur-droid/example", commitSha: "abc123" },
      environment: {
        provider: "vercel",
        projectId: "project-1",
        environment: "production",
        url: "https://example.com",
      },
      contracts: [r1Contract],
      verifier: { name: "relyo-test-verifier", version: "0.1.0" },
      issuedAt: "2026-09-15T00:00:00.000Z",
    });

    expect(passport.assurance).toBe("R1");
    expect(passport.release.commitSha).toBe("abc123");
    expect(passport.environment.environment).toBe("production");
  });
});
