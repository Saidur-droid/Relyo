import { describe, expect, it } from "vitest";
import {
  computeAssurance,
  createEvidenceEnvelope,
  createPassport,
  evaluateContract,
  sha256Json,
  type ProofContract,
} from "../src/index.js";

const r1Contract: ProofContract = {
  id: "launch.https",
  version: "1",
  title: "HTTPS",
  requiredFor: ["R1", "R2", "R3", "R4"],
  assertions: [
    {
      id: "https",
      description: "HTTPS is enabled",
      status: "PASS",
      evidenceRefs: ["ev_https"],
    },
  ],
};

const r2Contract: ProofContract = {
  id: "business.journey",
  version: "1",
  title: "Business journey",
  requiredFor: ["R2", "R3", "R4"],
  assertions: [
    {
      id: "journey",
      description: "Core journey passes",
      status: "PASS",
      evidenceRefs: ["ev_journey"],
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
    const contract: ProofContract = {
      ...r1Contract,
      assertions: [{ ...r1Contract.assertions[0]!, status: "UNKNOWN" }],
    };
    expect(evaluateContract(contract).status).toBe("UNKNOWN");
  });

  it("creates a passport bound to subject and release", () => {
    const evidence = createEvidenceEnvelope({
      kind: "http",
      source: "https://example.com",
      payload: { status: 200 },
    });
    const passport = createPassport({
      subject: { id: "app_1", displayName: "Example", kind: "application" },
      release: { kind: "git", repository: "owner/repo", commitSha: "abc123" },
      environment: {
        provider: "public-web",
        projectId: "example.com",
        environment: "production",
        url: "https://example.com",
      },
      targetAssurance: "R1",
      contracts: [r1Contract],
      evidence: [evidence],
      verifier: { name: "relyo-kernel", version: "0.1.0" },
    });

    expect(passport.assurance).toBe("R1");
    expect(passport.release.kind).toBe("git");
    expect(passport.evidence).toHaveLength(1);
  });

  it("hashes canonical JSON independent of key order", () => {
    expect(sha256Json({ a: 1, b: 2 })).toBe(sha256Json({ b: 2, a: 1 }));
  });
});
