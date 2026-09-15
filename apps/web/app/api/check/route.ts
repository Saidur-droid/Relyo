import { buildLaunchCheckReport } from "@relyo/contracts";
import { discoverApplication } from "@relyo/discovery";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
const buckets = new Map<string, { count: number; resetAt: number }>();

type GrowthEvent =
  | "url_check_started"
  | "url_check_completed"
  | "url_check_failed"
  | "repo_scan_started"
  | "repo_scan_completed"
  | "meaningful_finding_shown";

function emitGrowthEvent(event: GrowthEvent, properties: Record<string, string | number | boolean | null>) {
  console.info(JSON.stringify({
    type: "growth_event",
    event,
    occurred_at: new Date().toISOString(),
    ...properties,
  }));
}

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

  const startedAt = Date.now();
  if (url) emitGrowthEvent("url_check_started", { has_repo: Boolean(githubRepo) });
  if (githubRepo) emitGrowthEvent("repo_scan_started", { has_url: Boolean(url) });

  try {
    const discovery = await discoverApplication({
      ...(url ? { url } : {}),
      ...(githubRepo ? { githubRepo } : {}),
    });
    const report = buildLaunchCheckReport(discovery);
    const durationMs = Date.now() - startedAt;

    if (url) {
      emitGrowthEvent("url_check_completed", {
        duration_ms: durationMs,
        finding_count: discovery.url?.findings.length ?? 0,
        achieved_assurance: report.achievedAssurance,
      });
    }
    if (githubRepo) {
      emitGrowthEvent("repo_scan_completed", {
        duration_ms: durationMs,
        technology_count: discovery.repo?.technologies.length ?? 0,
        finding_count: discovery.repo?.findings.length ?? 0,
      });
    }
    if (discovery.findings.length > 0) {
      emitGrowthEvent("meaningful_finding_shown", {
        finding_count: discovery.findings.length,
        highest_severity: discovery.findings[0]?.severity ?? null,
      });
    }

    return json({ discovery, report });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "The check failed unexpectedly.";
    if (url) {
      emitGrowthEvent("url_check_failed", {
        duration_ms: Date.now() - startedAt,
        failure_class: reason instanceof Error ? reason.name : "UnknownError",
      });
    }
    return json({ error: message }, 422);
  }
}
