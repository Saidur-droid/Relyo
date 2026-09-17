import { SupabaseReadClient } from "@relyo/adapter-supabase";
import { VercelReadClient } from "@relyo/adapter-vercel";
import { discoverApplication } from "@relyo/discovery";
import { executeCombinedR1Proof, executeVercelR1Proof } from "@relyo/proof-engine";
import { NextRequest } from "next/server";
import {
  credentialServices,
  passportSigningPrivateKeyPem,
  proofStore,
} from "@/lib/server-services";

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
    const services = credentialServices();
    const vercelConnection = await services.store.get(vercelConnectionId);
    if (!vercelConnection || vercelConnection.provider !== "vercel") {
      return json({ error: "Vercel connection was not found. Reconnect Vercel." }, 401);
    }
    if (!vercelConnection.boundProjectId) {
      return json({ error: "Choose a Vercel project before running launch proof." }, 409);
    }

    const vercelTokens = services.cipher.decrypt(vercelConnection.credential);
    if (vercelTokens.expiresAt && Date.parse(vercelTokens.expiresAt) <= Date.now()) {
      return json({ error: "Vercel connection expired. Reconnect Vercel." }, 401);
    }

    const discovery = await discoverApplication({
      ...(url ? { url } : {}),
      ...(githubRepo ? { githubRepo } : {}),
    });
    const vercel = await new VercelReadClient({
      token: vercelTokens.accessToken,
      ...(vercelConnection.providerTeamId ? { teamId: vercelConnection.providerTeamId } : {}),
    }).inspectProduction({ projectIdOrName: vercelConnection.boundProjectId });
    if (vercel.projectId !== vercelConnection.boundProjectId) {
      throw new Error("Vercel project identity did not match the stored binding.");
    }

    let proof;
    let supabaseProject: { id: string; name: string } | null = null;
    if (supabaseConnectionId) {
      const supabaseConnection = await services.store.get(supabaseConnectionId);
      if (!supabaseConnection || supabaseConnection.provider !== "supabase") {
        return json({ error: "Supabase connection was not found. Reconnect Supabase." }, 401);
      }
      if (!supabaseConnection.boundProjectId) {
        return json({ error: "Choose a Supabase project before running combined launch proof." }, 409);
      }
      const supabaseTokens = services.cipher.decrypt(supabaseConnection.credential);
      if (supabaseTokens.expiresAt && Date.parse(supabaseTokens.expiresAt) <= Date.now()) {
        return json({ error: "Supabase connection expired. Reconnect Supabase." }, 401);
      }
      const supabase = await new SupabaseReadClient({ token: supabaseTokens.accessToken })
        .inspectProduction({ projectRef: supabaseConnection.boundProjectId });
      if (supabase.project.ref !== supabaseConnection.boundProjectId) {
        throw new Error("Supabase project identity did not match the stored binding.");
      }
      supabaseProject = { id: supabase.project.ref, name: supabase.project.name };
      proof = await executeCombinedR1Proof({
        discovery,
        vercel,
        supabase,
        store: proofStore(),
        signingPrivateKey: passportSigningPrivateKeyPem(),
      });
    } else {
      proof = await executeVercelR1Proof({
        discovery,
        provider: vercel,
        store: proofStore(),
        signingPrivateKey: passportSigningPrivateKeyPem(),
      });
    }

    emitProofEvent("proof_run_completed", {
      duration_ms: Date.now() - startedAt,
      proof_state: proof.run.state,
      assurance_achieved: proof.signedPassport.passport.assurance,
      blocker_count: proof.blockers.length,
      supabase_included: Boolean(supabaseProject),
    });
    emitProofEvent("passport_issued", {
      assurance_achieved: proof.signedPassport.passport.assurance,
      signed: true,
      supabase_included: Boolean(supabaseProject),
    });

    return json({
      project: { id: vercel.projectId, name: vercel.projectName },
      supabaseProject,
      run: proof.run,
      blockers: proof.blockers,
      signedPassport: proof.signedPassport,
    });
  } catch (reason) {
    const message = reason instanceof Error && /public|URL|repository|hostname|GitHub|Vercel project|Supabase project/i.test(reason.message)
      ? reason.message
      : "Relyo could not complete provider-backed launch proof.";
    return json({ error: message }, 422);
  }
}
