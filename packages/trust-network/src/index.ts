import { createPublicKey, type KeyObject } from "node:crypto";
import type { AssuranceLevel } from "@relyo/kernel";
import { verifySignedPassport, type SignedPassport } from "@relyo/kernel/signing";

export interface VerifierRegistration {
  id: string;
  name: string;
  publicKeyPem: string;
  keyId: string;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED";
  validFrom: string;
  validUntil?: string;
}

export interface PassportRegistryEntry {
  passportId: string;
  passportSha256: string;
  subjectId: string;
  assurance: AssuranceLevel;
  issuedAt: string;
  visibility: "private" | "public";
  verifierId: string;
  releaseKey: string;
}

export interface CertifiedArtifact {
  id: string;
  kind: "contract-pack" | "adapter";
  name: string;
  version: string;
  issuer: string;
  conformanceSha256: string;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED";
}

export interface ProofConsumptionEvent {
  passportId: string;
  consumerId: string;
  consumerKind: "buyer" | "marketplace" | "procurement" | "builder" | "auditor" | "other";
  consumedAt: string;
  purpose?: string;
}

function activeAt(registration: VerifierRegistration, at: Date): boolean {
  if (registration.status !== "ACTIVE") return false;
  const from = Date.parse(registration.validFrom);
  const until = registration.validUntil ? Date.parse(registration.validUntil) : Number.POSITIVE_INFINITY;
  return Number.isFinite(from) && at.getTime() >= from && at.getTime() < until;
}

export function verifyNetworkPassport(input: {
  envelope: SignedPassport;
  verifier: VerifierRegistration;
  now?: Date;
}): { valid: boolean; reason: string } {
  const now = input.now ?? new Date();
  if (!activeAt(input.verifier, now)) return { valid: false, reason: "Verifier registration is not active." };
  if (input.envelope.signature.keyId !== input.verifier.keyId) return { valid: false, reason: "Passport key ID does not match verifier registration." };

  let publicKey: KeyObject;
  try {
    publicKey = createPublicKey(input.verifier.publicKeyPem);
  } catch {
    return { valid: false, reason: "Verifier public key is invalid." };
  }
  if (!verifySignedPassport({ envelope: input.envelope, publicKey })) return { valid: false, reason: "Passport signature or digest is invalid." };
  return { valid: true, reason: "Signature, digest, key identity and verifier registration are valid." };
}

export function createRegistryEntry(input: {
  envelope: SignedPassport;
  verifierId: string;
  visibility: "private" | "public";
}): PassportRegistryEntry {
  const release = input.envelope.passport.release;
  const releaseKey = release.kind === "git"
    ? `${release.repository}@${release.commitSha}`
    : `${release.url}@${release.observedAt}`;
  return {
    passportId: input.envelope.passport.id,
    passportSha256: input.envelope.passportSha256,
    subjectId: input.envelope.passport.subject.id,
    assurance: input.envelope.passport.assurance,
    issuedAt: input.envelope.passport.issuedAt,
    visibility: input.visibility,
    verifierId: input.verifierId,
    releaseKey,
  };
}

export function assertCertifiedArtifact(artifact: CertifiedArtifact): void {
  if (artifact.status !== "ACTIVE") throw new Error(`Certified ${artifact.kind} is not active.`);
  if (!/^[a-f0-9]{64}$/i.test(artifact.conformanceSha256)) throw new Error("Conformance digest must be SHA-256.");
}

export function recordProofConsumption(input: ProofConsumptionEvent): ProofConsumptionEvent {
  if (!input.passportId.trim() || !input.consumerId.trim()) throw new Error("Proof consumption requires passport and consumer identity.");
  if (!Number.isFinite(Date.parse(input.consumedAt))) throw new Error("Proof consumption timestamp is invalid.");
  return { ...input };
}

export function uniqueThirdPartyConsumers(events: ProofConsumptionEvent[], passportId: string): number {
  return new Set(events.filter((event) => event.passportId === passportId).map((event) => event.consumerId)).size;
}
