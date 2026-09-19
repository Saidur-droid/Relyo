import { NextRequest } from "next/server";
import { executeLaunchProof, LaunchProofPublicError } from "@/lib/execute-launch-proof";

export const runtime = "nodejs";

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
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

function emitProofEvent(event: "proof_run_started" | "proof_run_completed" | "passport_issued", properties: Record<string, string | number | boolean | null>) {
  console.info(JSON.stringify({
    type: "growth_event",
    event,
    occurred_at: new Date().toISOString(),
    initiating_surface: "verify_my_launch",
    proof_pack: "vercel-r1-launch",
    assurance_target: "R1",
    ...properties,
  }));
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "Cross-origin proof requests are not allowed." }, 403);

  const vercelConnectionId = request.cookies.get("relyo_vercel_connection")?.value;
  if (!vercelConnectionId) return json({ error: "Connect Vercel before running launch proof." }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Request body must be a JSON object." }, 400);
  }

  const input = body as { url?: unknown; githubRepo?: unknown };
  const url = typeof input.url === "string" ? input.url.trim() : "";
  const githubRepo = typeof input.githubRepo === "string" ? input.githubRepo.trim() : "";
  if (!url && !githubRepo) return json({ error: "Provide a production URL, a public GitHub repository, or both." }, 400);
  if (url.length > 2048 || githubRepo.length > 256) return json({ error: "Input is too long." }, 400);

  const startedAt = Date.now();
  const supabaseConnectionId = request.cookies.get("relyo_supabase_connection")?.value;
  emitProofEvent("proof_run_started", {
    has_url: Boolean(url),
    has_repo: Boolean(githubRepo),
    supabase_connected: Boolean(supabaseConnectionId),
  });

  try {
    const result = await executeLaunchProof({
      ...(url ? { url } : {}),
      ...(githubRepo ? { githubRepo } : {}),
      vercelConnectionId,
      ...(supabaseConnectionId ? { supabaseConnectionId } : {}),
    });
    const proof = result.proof;
    emitProofEvent("proof_run_completed", {
      duration_ms: Date.now() - startedAt,
      proof_state: proof.run.state,
      assurance_achieved: proof.signedPassport.passport.assurance,
      blocker_count: proof.blockers.length,
      supabase_included: Boolean(result.supabaseProject),
    });
    emitProofEvent("passport_issued", {
      assurance_achieved: proof.signedPassport.passport.assurance,
      signed: true,
      supabase_included: Boolean(result.supabaseProject),
    });
    return json({
      project: result.project,
      supabaseProject: result.supabaseProject,
      run: proof.run,
      blockers: proof.blockers,
      signedPassport: proof.signedPassport,
    });
  } catch (error) {
    const safe = error instanceof LaunchProofPublicError
      ? error
      : new LaunchProofPublicError(422, "unknown", "Relyo could not complete R1 proof.");
    console.error(JSON.stringify({ type: "relyo_verify_launch_error", stage: safe.stage }));
    return json({ error: safe.message }, safe.status);
  }
}
