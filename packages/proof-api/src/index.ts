import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { Pool } from "pg";

export type ProofApiScope = "proof:run" | "proof:read";

export interface ProofApiKeyRecord {
  id: string;
  keySha256: string;
  label: string;
  scopes: ProofApiScope[];
  vercelConnectionId: string;
  supabaseConnectionId?: string;
  createdAt: string;
  revokedAt?: string;
}

export interface GeneratedProofApiKey {
  token: string;
  record: ProofApiKeyRecord;
}

export interface ProofRunSubmission {
  url?: string;
  githubRepo?: string;
  webhook?: {
    url: string;
    secret: string;
  };
}

export interface ProofRunApiResult {
  runId: string;
  state: string;
  assurance: string;
  passportSha256?: string;
}

export function hashApiKey(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function generateProofApiKey(input: {
  label: string;
  vercelConnectionId: string;
  supabaseConnectionId?: string;
  scopes?: ProofApiScope[];
  now?: string;
}): GeneratedProofApiKey {
  const label = input.label.trim();
  if (!label || label.length > 120) throw new Error("API key label must be between 1 and 120 characters.");
  if (!input.vercelConnectionId.trim()) throw new Error("A Vercel connection binding is required.");
  const token = `rly_live_${randomBytes(32).toString("base64url")}`;
  const record: ProofApiKeyRecord = {
    id: `key_${randomUUID()}`,
    keySha256: hashApiKey(token),
    label,
    scopes: [...new Set(input.scopes ?? ["proof:run", "proof:read"])].sort() as ProofApiScope[],
    vercelConnectionId: input.vercelConnectionId,
    ...(input.supabaseConnectionId ? { supabaseConnectionId: input.supabaseConnectionId } : {}),
    createdAt: input.now ?? new Date().toISOString(),
  };
  return { token, record };
}

export function parseBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(rly_live_[A-Za-z0-9_-]{20,})$/i.exec(header.trim());
  return match?.[1] ?? null;
}

export function hasScope(record: ProofApiKeyRecord, scope: ProofApiScope): boolean {
  return !record.revokedAt && record.scopes.includes(scope);
}

export interface ProofApiKeyStore {
  save(record: ProofApiKeyRecord): Promise<void>;
  findByToken(token: string): Promise<ProofApiKeyRecord | null>;
  revoke(id: string, revokedAt?: string): Promise<void>;
  bindRun(apiKeyId: string, runId: string): Promise<void>;
  canReadRun(apiKeyId: string, runId: string): Promise<boolean>;
}

type KeyRow = {
  id: string; key_sha256: string; label: string; scopes: ProofApiScope[];
  vercel_connection_id: string; supabase_connection_id: string | null;
  created_at: string | Date; revoked_at: string | Date | null;
};

function iso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

function rowToRecord(row: KeyRow): ProofApiKeyRecord {
  return {
    id: row.id,
    keySha256: row.key_sha256,
    label: row.label,
    scopes: row.scopes,
    vercelConnectionId: row.vercel_connection_id,
    ...(row.supabase_connection_id ? { supabaseConnectionId: row.supabase_connection_id } : {}),
    createdAt: iso(row.created_at),
    ...(row.revoked_at ? { revokedAt: iso(row.revoked_at) } : {}),
  };
}

export class PostgresProofApiKeyStore implements ProofApiKeyStore {
  constructor(private readonly pool: Pool) {}

  async save(record: ProofApiKeyRecord): Promise<void> {
    await this.pool.query(
      `INSERT INTO proof_api_keys
       (id, key_sha256, label, scopes, vercel_connection_id, supabase_connection_id, created_at, revoked_at)
       VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8)`,
      [record.id, record.keySha256, record.label, JSON.stringify(record.scopes), record.vercelConnectionId, record.supabaseConnectionId ?? null, record.createdAt, record.revokedAt ?? null],
    );
  }

  async findByToken(token: string): Promise<ProofApiKeyRecord | null> {
    const digest = hashApiKey(token);
    const result = await this.pool.query<KeyRow>(
      `SELECT id,key_sha256,label,scopes,vercel_connection_id,supabase_connection_id,created_at,revoked_at
       FROM proof_api_keys WHERE key_sha256=$1 LIMIT 1`,
      [digest],
    );
    const row = result.rows[0];
    if (!row) return null;
    const stored = Buffer.from(row.key_sha256, "hex");
    const supplied = Buffer.from(digest, "hex");
    if (stored.length !== supplied.length || !timingSafeEqual(stored, supplied)) return null;
    return rowToRecord(row);
  }

  async revoke(id: string, revokedAt = new Date().toISOString()): Promise<void> {
    await this.pool.query("UPDATE proof_api_keys SET revoked_at=$2 WHERE id=$1 AND revoked_at IS NULL", [id, revokedAt]);
  }

  async bindRun(apiKeyId: string, runId: string): Promise<void> {
    await this.pool.query(
      "INSERT INTO proof_api_run_access (api_key_id, run_id, created_at) VALUES ($1,$2,now()) ON CONFLICT DO NOTHING",
      [apiKeyId, runId],
    );
  }

  async canReadRun(apiKeyId: string, runId: string): Promise<boolean> {
    const result = await this.pool.query("SELECT 1 FROM proof_api_run_access WHERE api_key_id=$1 AND run_id=$2 LIMIT 1", [apiKeyId, runId]);
    return (result.rowCount ?? 0) > 0;
  }
}

export function signWebhookBody(secret: string, body: string, timestamp: string): string {
  if (secret.length < 16) throw new Error("Webhook secret must contain at least 16 characters.");
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export function verifyWebhookSignature(input: {
  secret: string;
  body: string;
  timestamp: string;
  signature: string;
  now?: Date;
  toleranceMs?: number;
}): boolean {
  const parsed = Date.parse(input.timestamp);
  const now = input.now ?? new Date();
  const tolerance = input.toleranceMs ?? 5 * 60_000;
  if (!Number.isFinite(parsed) || Math.abs(now.getTime() - parsed) > tolerance) return false;
  const expected = signWebhookBody(input.secret, input.body, input.timestamp);
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(input.signature, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function validateWebhookUrl(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Webhook URLs must use HTTPS.");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1" || host === "::1") {
    throw new Error("Webhook URLs cannot target local hosts.");
  }
  if (url.username || url.password) throw new Error("Webhook URLs cannot contain credentials.");
  return url;
}
