import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createPassport } from "@relyo/kernel";
import { signPassport } from "@relyo/kernel/signing";
import { assertCertifiedArtifact, createRegistryEntry, recordProofConsumption, uniqueThirdPartyConsumers, verifyNetworkPassport } from "../src/index.js";

function signed() {
  const keys = generateKeyPairSync("ed25519");
  const passport = createPassport({
    subject: { id: "app", displayName: "App", kind: "application" },
    release: { kind: "git", repository: "o/r", commitSha: "a".repeat(40) },
    environment: { provider: "vercel", projectId: "p", environment: "production" },
    targetAssurance: "R1",
    contracts: [{ id: "c", version: "1", title: "c", requiredFor: ["R1"], assertions: [{ id: "a", description: "a", status: "PASS", evidenceRefs: [] }] }],
    evidence: [], verifier: { name: "Relyo", version: "1" }, issuedAt: "2026-09-19T00:00:00Z",
  });
  const envelope = signPassport({ passport, privateKey: keys.privateKey, keyId: "key-1" });
  return { keys, envelope };
}

describe("Trust Network", () => {
  it("accepts only signatures from active matching verifier registrations", () => {
    const { keys, envelope } = signed();
    const publicKeyPem = keys.publicKey.export({ type: "spki", format: "pem" }).toString();
    expect(verifyNetworkPassport({
      envelope,
      verifier: { id: "v", name: "Relyo", publicKeyPem, keyId: "key-1", status: "ACTIVE", validFrom: "2026-09-01T00:00:00Z" },
      now: new Date("2026-09-19T00:00:00Z"),
    }).valid).toBe(true);
    expect(verifyNetworkPassport({
      envelope,
      verifier: { id: "v", name: "Relyo", publicKeyPem, keyId: "other", status: "ACTIVE", validFrom: "2026-09-01T00:00:00Z" },
      now: new Date("2026-09-19T00:00:00Z"),
    }).valid).toBe(false);
  });

  it("creates portable registry metadata without copying raw evidence payloads", () => {
    const { envelope } = signed();
    const entry = createRegistryEntry({ envelope, verifierId: "v", visibility: "public" });
    expect(entry.releaseKey).toContain("@");
    expect(entry.passportSha256).toHaveLength(64);
    expect(JSON.stringify(entry)).not.toContain("signature");
  });

  it("requires active certification digests and counts third-party consumers", () => {
    expect(() => assertCertifiedArtifact({ id: "a", kind: "adapter", name: "Vercel", version: "1", issuer: "Relyo", conformanceSha256: "x", status: "ACTIVE" })).toThrow();
    const events = [
      recordProofConsumption({ passportId: "p", consumerId: "buyer-1", consumerKind: "buyer", consumedAt: "2026-09-19T00:00:00Z" }),
      recordProofConsumption({ passportId: "p", consumerId: "buyer-1", consumerKind: "buyer", consumedAt: "2026-09-19T01:00:00Z" }),
      recordProofConsumption({ passportId: "p", consumerId: "market-1", consumerKind: "marketplace", consumedAt: "2026-09-19T02:00:00Z" }),
    ];
    expect(uniqueThirdPartyConsumers(events, "p")).toBe(2);
  });
});
