import { buildLaunchCheckReport } from "@relyo/contracts";
import { discoverApplication } from "@relyo/discovery";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "anonymous";
}

function allowRequest(key: string): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

function json(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  if (!allowRequest(clientKey(request))) {
    return json({ error: "Too many checks from this client. Try again shortly." }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const input = body as { url?: unknown; githubRepo?: unknown };
  const url = typeof input.url === "string" ? input.url.trim() : "";
  const githubRepo = typeof input.githubRepo === "string" ? input.githubRepo.trim() : "";

  if (!url && !githubRepo) return json({ error: "Provide a public URL, a public GitHub repository, or both." }, 400);
  if (url.length > 2048 || githubRepo.length > 256) return json({ error: "Input is too long." }, 400);

  try {
    const discovery = await discoverApplication({
      ...(url ? { url } : {}),
      ...(githubRepo ? { githubRepo } : {}),
    });
    const report = buildLaunchCheckReport(discovery);
    return json({ discovery, report });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "The check failed unexpectedly.";
    return json({ error: message }, 422);
  }
}
