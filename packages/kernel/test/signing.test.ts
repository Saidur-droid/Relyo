import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createPassport, type ProofContract } from "../src/index.js";
import { signPassport, verifySignedPassport } from "../src/signing.js";

const contract: ProofContract = {
  id: "launch.release-identity",
  version: "1",
  title: "Release identity",
  requiredFor: ["R1", "R2", "R3", "R4"],
  assertions: [
    {
      id: "release.commit-bound",
      description: "Release bound to commit",
      status: "PASS",
      evidenceRefs: ["ev_1"],
    },
  ],
};

function passport() {
  return createPassport({
    subject: { id: "app_1", displayName: "Example", kind: "application" },
    release: { kind: "git", repository: "owner/repo", commitSha: "abc123" },
    environment: {
      provider: "vercel",
      projectId: "prj_1",
      environment: "production",
      url: "https://example.com",
    },
    targetAssurance: "R1",
    contracts: [contract],
    evidence: [
      {
        id: "ev_1",
        kind: "release",
        sha256: "f".repeat(64),
        collectedAt: "2026-09-15T00:00:00.000Z",
        source: "test",
        redacted: true,
      },
    ],
    verifier: { name: "test-verifier", version: "0.1.0" },
    issuedAt: "2026-09-15T00:00:00.000Z",
  });
}

describe("Production Passport signatures", () => {
  it("verifies an untampered Ed25519 envelope", () => {
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const envelope = signPassport({ passport: passport(), privateKey });
    expect(verifySignedPassport({ envelope, publicKey })).toBe(true);
    expect(envelope.signature.keyId).toMatch(/^ed25519:/);
  });

  it("rejects a tampered Passport", () => {
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const envelope = signPassport({ passport: passport(), privateKey });
    envelope.passport.environment.projectId = "tampered-project";
    expect(verifySignedPassport({ envelope, publicKey })).toBe(false);
  });

  it("rejects the wrong verification key", () => {
    const signer = generateKeyPairSync("ed25519");
    const stranger = generateKeyPairSync("ed25519");
    const envelope = signPassport({ passport: passport(), privateKey: signer.privateKey });
    expect(verifySignedPassport({ envelope, publicKey: stranger.publicKey })).toBe(false);
  });
});
