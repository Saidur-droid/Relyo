import { Buffer } from "node:buffer";
import { createPrivateKey } from "node:crypto";
import { Pool } from "pg";
import {
  CredentialCipher,
  PostgresCredentialStore,
  type CredentialStore,
} from "@relyo/credentials";
import { PostgresProofStore, type ProofStore } from "@relyo/store";

let pool: Pool | undefined;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Server configuration ${name} is missing.`);
  return value;
}

function databasePool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: required("DATABASE_URL"),
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      allowExitOnIdle: true,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

export function credentialServices(): {
  store: CredentialStore;
  cipher: CredentialCipher;
} {
  return {
    store: new PostgresCredentialStore(databasePool()),
    cipher: new CredentialCipher(
      required("RELYO_CREDENTIAL_ENCRYPTION_KEY"),
      process.env.RELYO_CREDENTIAL_ENCRYPTION_KEY_ID?.trim() || "provider-credential-v1",
    ),
  };
}

export function proofStore(): ProofStore {
  return new PostgresProofStore(databasePool());
}

function normalizePem(value: string): string | null {
  const normalized = value
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    // Some generators label Ed25519 PKCS#8 material as "ED25519 PRIVATE KEY".
    // Node/OpenSSL expects the generic PKCS#8 "PRIVATE KEY" PEM label.
    .replace(/-----BEGIN ED25519 PRIVATE KEY-----/g, "-----BEGIN PRIVATE KEY-----")
    .replace(/-----END ED25519 PRIVATE KEY-----/g, "-----END PRIVATE KEY-----");

  return /-----BEGIN PRIVATE KEY-----/.test(normalized)
    ? normalized.endsWith("\n") ? normalized : `${normalized}\n`
    : null;
}

function pkcs8DerToPem(der: Buffer): string {
  const body = der.toString("base64").match(/.{1,64}/g)?.join("\n") ?? "";
  return `-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----\n`;
}

function looksLikeUtf16Le(buffer: Buffer): boolean {
  if (buffer.length < 4 || buffer.length % 2 !== 0) return false;
  let nulCount = 0;
  for (let index = 1; index < Math.min(buffer.length, 160); index += 2) {
    if (buffer[index] === 0) nulCount += 1;
  }
  return nulCount >= Math.min(8, Math.floor(Math.min(buffer.length, 160) / 8));
}

function validateEd25519PrivateKey(pem: string): string {
  try {
    const key = createPrivateKey(pem);
    if (key.asymmetricKeyType !== "ed25519") {
      throw new Error("wrong-key-type");
    }
    return pem;
  } catch {
    throw new Error("Server configuration RELYO_PASSPORT_SIGNING_PRIVATE_KEY_B64 is not a supported Ed25519 private-key encoding.");
  }
}

/**
 * Accept the production signing key in the common forms people paste into
 * deployment environment variables while keeping one canonical Ed25519 PKCS#8
 * representation for the Trust Kernel:
 * - base64-encoded PEM (documented/default)
 * - base64-encoded PKCS#8 DER
 * - base64-encoded 32-byte Ed25519 seed
 * - direct PEM, including values whose newlines were escaped as "\\n"
 * - UTF-16LE encoded PEM accidentally produced by some Windows shell flows
 */
export function passportSigningPrivateKeyPem(): string {
  const configured = required("RELYO_PASSPORT_SIGNING_PRIVATE_KEY_B64");

  const directPem = normalizePem(configured);
  if (directPem) return validateEd25519PrivateKey(directPem);

  const compactBase64 = configured.replace(/\s+/g, "");
  const decoded = Buffer.from(compactBase64, "base64");

  const decodedUtf8Pem = normalizePem(decoded.toString("utf8"));
  if (decodedUtf8Pem) return validateEd25519PrivateKey(decodedUtf8Pem);

  if (looksLikeUtf16Le(decoded)) {
    const decodedUtf16Pem = normalizePem(decoded.toString("utf16le"));
    if (decodedUtf16Pem) return validateEd25519PrivateKey(decodedUtf16Pem);
  }

  if (decoded.length === 32) {
    // RFC 8410 PKCS#8 wrapper around a raw 32-byte Ed25519 private seed.
    const pkcs8Prefix = Buffer.from("302e020100300506032b657004220420", "hex");
    return validateEd25519PrivateKey(pkcs8DerToPem(Buffer.concat([pkcs8Prefix, decoded])));
  }

  if (decoded.length > 0 && decoded[0] === 0x30) {
    try {
      return validateEd25519PrivateKey(pkcs8DerToPem(decoded));
    } catch {
      // Fall through to the safe configuration error below.
    }
  }

  throw new Error(
    "Server configuration RELYO_PASSPORT_SIGNING_PRIVATE_KEY_B64 is not a supported Ed25519 private-key encoding.",
  );
}

export function vercelOAuthConfig() {
  return {
    clientId: required("VERCEL_APP_CLIENT_ID"),
    clientSecret: required("VERCEL_APP_CLIENT_SECRET"),
    scope: process.env.VERCEL_OAUTH_SCOPE?.trim() || "openid profile offline_access",
  };
}

export function supabaseOAuthConfig() {
  return {
    clientId: required("SUPABASE_APP_CLIENT_ID"),
    clientSecret: required("SUPABASE_APP_CLIENT_SECRET"),
  };
}

/**
 * Optional production-only fallback for provider read APIs.
 * The value stays server-side and is never returned to the browser or proof evidence.
 * OAuth remains the connection/session bootstrap; this bridges Vercel App installations
 * that issue identity-only OAuth tokens without project API permissions.
 */
export function hasVercelProviderReadToken(): boolean {
  return Boolean(process.env.VERCEL_READ_TOKEN?.trim());
}

export function vercelProviderReadToken(oauthAccessToken: string): string {
  return process.env.VERCEL_READ_TOKEN?.trim() || oauthAccessToken;
}
