import {
  createPrivateKey,
  createPublicKey,
  createHash,
  sign as cryptoSign,
  verify as cryptoVerify,
  type KeyObject,
} from "node:crypto";
import { sha256Json, type Passport } from "./index.js";

export interface SignedPassport {
  envelopeVersion: "0.1";
  passport: Passport;
  passportSha256: string;
  signature: {
    algorithm: "Ed25519";
    keyId: string;
    valueBase64: string;
  };
}

function toPrivateKey(key: KeyObject | string | Buffer): KeyObject {
  return key instanceof Object && "type" in key && key.type === "private"
    ? key as KeyObject
    : createPrivateKey(key as string | Buffer);
}

function toPublicKey(key: KeyObject | string | Buffer): KeyObject {
  if (key instanceof Object && "type" in key) {
    const keyObject = key as KeyObject;
    return keyObject.type === "public" ? keyObject : createPublicKey(keyObject);
  }
  return createPublicKey(key as string | Buffer);
}

export function publicKeyFingerprint(key: KeyObject | string | Buffer): string {
  const publicKey = toPublicKey(key);
  const der = publicKey.export({ type: "spki", format: "der" });
  return createHash("sha256").update(der).digest("hex");
}

export function signPassport(input: {
  passport: Passport;
  privateKey: KeyObject | string | Buffer;
  keyId?: string;
}): SignedPassport {
  const privateKey = toPrivateKey(input.privateKey);
  if (privateKey.asymmetricKeyType !== "ed25519") {
    throw new Error("Production Passports must be signed with an Ed25519 key.");
  }

  const digest = sha256Json(input.passport);
  const signature = cryptoSign(null, Buffer.from(digest, "hex"), privateKey);
  const keyId = input.keyId ?? `ed25519:${publicKeyFingerprint(privateKey).slice(0, 24)}`;

  return {
    envelopeVersion: "0.1",
    passport: input.passport,
    passportSha256: digest,
    signature: {
      algorithm: "Ed25519",
      keyId,
      valueBase64: signature.toString("base64"),
    },
  };
}

export function verifySignedPassport(input: {
  envelope: SignedPassport;
  publicKey: KeyObject | string | Buffer;
}): boolean {
  if (input.envelope.signature.algorithm !== "Ed25519") return false;
  const publicKey = toPublicKey(input.publicKey);
  if (publicKey.asymmetricKeyType !== "ed25519") return false;

  const digest = sha256Json(input.envelope.passport);
  if (digest !== input.envelope.passportSha256) return false;

  return cryptoVerify(
    null,
    Buffer.from(digest, "hex"),
    publicKey,
    Buffer.from(input.envelope.signature.valueBase64, "base64"),
  );
}
