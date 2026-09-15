import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import type { Pool } from "pg";

export interface PkceTransaction {
  state: string;
  nonce: string;
  codeVerifier: string;
  codeChallenge: string;
}

export interface ProviderTokenSet {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  scope: string[];
  expiresAt?: string;
}

export interface EncryptedCredentialEnvelope {
  envelopeVersion: "0.1";
  algorithm: "A256GCM";
  keyId: string;
  ivBase64Url: string;
  ciphertextBase64Url: string;
  authTagBase64Url: string;
}

export interface ProviderConnection {
  id: string;
  provider: "vercel";
  providerAccountId?: string;
  providerTeamId?: string;
  scopes: string[];
  credential: EncryptedCredentialEnvelope;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialStore {
  save(connection: ProviderConnection): Promise<void>;
  get(connectionId: string): Promise<ProviderConnection | null>;
}

function base64url(input: Buffer): string {
  return input.toString("base64url");
}

function fromBase64url(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

export function createPkceTransaction(): PkceTransaction {
  const state = base64url(randomBytes(32));
  const nonce = base64url(randomBytes(32));
  const codeVerifier = base64url(randomBytes(64));
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return { state, nonce, codeVerifier, codeChallenge };
}

export function secureEqual(left: string | null | undefined, right: string | null | undefined): boolean {
  if (!left || !right) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export class CredentialCipher {
  private readonly key: Buffer;

  constructor(
    keyBase64Url: string,
    private readonly keyId = "provider-credential-v1",
  ) {
    const key = fromBase64url(keyBase64Url);
    if (key.length !== 32) throw new Error("Credential encryption key must decode to exactly 32 bytes.");
    this.key = key;
  }

  encrypt(tokens: ProviderTokenSet): EncryptedCredentialEnvelope {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const plaintext = Buffer.from(JSON.stringify(tokens), "utf8");
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      envelopeVersion: "0.1",
      algorithm: "A256GCM",
      keyId: this.keyId,
      ivBase64Url: base64url(iv),
      ciphertextBase64Url: base64url(ciphertext),
      authTagBase64Url: base64url(authTag),
    };
  }

  decrypt(envelope: EncryptedCredentialEnvelope): ProviderTokenSet {
    if (envelope.envelopeVersion !== "0.1" || envelope.algorithm !== "A256GCM") {
      throw new Error("Unsupported provider credential envelope.");
    }
    if (envelope.keyId !== this.keyId) throw new Error("Credential envelope key ID does not match active key.");

    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.key,
      fromBase64url(envelope.ivBase64Url),
    );
    decipher.setAuthTag(fromBase64url(envelope.authTagBase64Url));
    const plaintext = Buffer.concat([
      decipher.update(fromBase64url(envelope.ciphertextBase64Url)),
      decipher.final(),
    ]);
    const parsed = JSON.parse(plaintext.toString("utf8")) as ProviderTokenSet;
    if (!parsed.accessToken || !parsed.tokenType || !Array.isArray(parsed.scope)) {
      throw new Error("Decrypted provider credential payload is invalid.");
    }
    return parsed;
  }
}

function cloneConnection(connection: ProviderConnection): ProviderConnection {
  return structuredClone(connection);
}

export class MemoryCredentialStore implements CredentialStore {
  private readonly connections = new Map<string, ProviderConnection>();

  async save(connection: ProviderConnection): Promise<void> {
    this.connections.set(connection.id, cloneConnection(connection));
  }

  async get(connectionId: string): Promise<ProviderConnection | null> {
    const connection = this.connections.get(connectionId);
    return connection ? cloneConnection(connection) : null;
  }
}

export class PostgresCredentialStore implements CredentialStore {
  constructor(private readonly pool: Pool) {}

  async save(connection: ProviderConnection): Promise<void> {
    await this.pool.query(
      `INSERT INTO provider_connections
       (id, provider, provider_account_id, provider_team_id, scopes, credential_envelope, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         provider_account_id = EXCLUDED.provider_account_id,
         provider_team_id = EXCLUDED.provider_team_id,
         scopes = EXCLUDED.scopes,
         credential_envelope = EXCLUDED.credential_envelope,
         updated_at = EXCLUDED.updated_at`,
      [
        connection.id,
        connection.provider,
        connection.providerAccountId ?? null,
        connection.providerTeamId ?? null,
        JSON.stringify(connection.scopes),
        JSON.stringify(connection.credential),
        connection.createdAt,
        connection.updatedAt,
      ],
    );
  }

  async get(connectionId: string): Promise<ProviderConnection | null> {
    const result = await this.pool.query<{
      id: string;
      provider: "vercel";
      provider_account_id: string | null;
      provider_team_id: string | null;
      scopes: string[];
      credential_envelope: EncryptedCredentialEnvelope;
      created_at: string | Date;
      updated_at: string | Date;
    }>(
      `SELECT id, provider, provider_account_id, provider_team_id, scopes,
              credential_envelope, created_at, updated_at
       FROM provider_connections WHERE id = $1`,
      [connectionId],
    );

    const row = result.rows[0];
    if (!row) return null;
    const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at;
    const updatedAt = row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at;

    return {
      id: row.id,
      provider: row.provider,
      ...(row.provider_account_id ? { providerAccountId: row.provider_account_id } : {}),
      ...(row.provider_team_id ? { providerTeamId: row.provider_team_id } : {}),
      scopes: row.scopes,
      credential: row.credential_envelope,
      createdAt,
      updatedAt,
    };
  }
}

export function createProviderConnection(input: {
  provider: "vercel";
  scopes: string[];
  credential: EncryptedCredentialEnvelope;
  providerAccountId?: string;
  providerTeamId?: string;
  now?: string;
}): ProviderConnection {
  const now = input.now ?? new Date().toISOString();
  return {
    id: `conn_${randomUUID()}`,
    provider: input.provider,
    ...(input.providerAccountId ? { providerAccountId: input.providerAccountId } : {}),
    ...(input.providerTeamId ? { providerTeamId: input.providerTeamId } : {}),
    scopes: [...input.scopes].sort(),
    credential: input.credential,
    createdAt: now,
    updatedAt: now,
  };
}
