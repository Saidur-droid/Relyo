import { Buffer } from "node:buffer";
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
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
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

export function passportSigningPrivateKeyPem(): string {
  return Buffer.from(required("RELYO_PASSPORT_SIGNING_PRIVATE_KEY_B64"), "base64").toString("utf8");
}

export function vercelOAuthConfig() {
  return {
    clientId: required("VERCEL_APP_CLIENT_ID"),
    clientSecret: required("VERCEL_APP_CLIENT_SECRET"),
    scope: process.env.VERCEL_OAUTH_SCOPE?.trim() || "openid profile offline_access",
  };
}
