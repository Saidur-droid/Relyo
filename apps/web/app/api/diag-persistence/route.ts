import { Pool } from "pg";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkCredentialKey(): "ok" | "missing" | "invalid" {
  const raw = process.env.RELYO_CREDENTIAL_ENCRYPTION_KEY?.trim();
  if (!raw) return "missing";
  try {
    return Buffer.from(raw, "base64url").length === 32 ? "ok" : "invalid";
  } catch {
    return "invalid";
  }
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const key = checkCredentialKey();
  let database: "ok" | "missing" | "invalid-url" | "connect-failed" = "missing";

  if (databaseUrl) {
    try {
      new URL(databaseUrl);
      const pool = new Pool({
        connectionString: databaseUrl,
        max: 1,
        connectionTimeoutMillis: 5000,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      });
      try {
        await pool.query("select 1");
        database = "ok";
      } catch {
        database = "connect-failed";
      } finally {
        await pool.end().catch(() => undefined);
      }
    } catch {
      database = "invalid-url";
    }
  }

  return NextResponse.json({ key, database }, { headers: { "cache-control": "no-store" } });
}
