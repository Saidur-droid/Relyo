import { Pool } from "pg";

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

function safeErrorCode(error: unknown): string {
  if (!error || typeof error !== "object") return "unknown";
  const value = error as { code?: unknown; errno?: unknown; syscall?: unknown };
  const code = typeof value.code === "string" ? value.code : undefined;
  const errno = typeof value.errno === "string" || typeof value.errno === "number" ? String(value.errno) : undefined;
  const syscall = typeof value.syscall === "string" ? value.syscall : undefined;
  return [code, errno, syscall].filter(Boolean).join(":") || "unknown";
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const key = checkCredentialKey();
  let database: "ok" | "missing" | "invalid-url" | "connect-failed" = "missing";
  let host = "none";
  let port = "none";
  let user = "none";
  let errorCode = "none";

  if (databaseUrl) {
    try {
      const parsed = new URL(databaseUrl);
      host = parsed.hostname || "none";
      port = parsed.port || "default";
      user = decodeURIComponent(parsed.username || "none");
      const pool = new Pool({
        connectionString: databaseUrl,
        max: 1,
        connectionTimeoutMillis: 5000,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      });
      try {
        await pool.query("select 1");
        database = "ok";
      } catch (error) {
        database = "connect-failed";
        errorCode = safeErrorCode(error);
      } finally {
        await pool.end().catch(() => undefined);
      }
    } catch {
      database = "invalid-url";
    }
  }

  const title = `Relyo diag key-${key} db-${database}`;
  const html = `<!doctype html><html><head><title>${title}</title></head><body><h1>${title}</h1><p>host=${host}</p><p>port=${port}</p><p>user=${user}</p><p>error=${errorCode}</p></body></html>`;
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
