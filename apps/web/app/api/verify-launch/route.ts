import { SupabaseReadClient } from "@relyo/adapter-supabase";
import { VercelReadClient } from "@relyo/adapter-vercel";
import { listVercelProjects } from "@relyo/adapter-vercel/projects";
import { discoverApplication } from "@relyo/discovery";
import {
  executeCombinedR1Proof,
  executePublicR1Proof,
  executeSupabaseAugmentedR1Proof,
  executeVercelR1Proof,
} from "@relyo/proof-engine";
import { NextRequest } from "next/server";
import {
  credentialServices,
  hasVercelProviderReadToken,
  passportSigningPrivateKeyPem,
  proofStore,
  vercelProviderReadToken,
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

function emitProofEvent(
  event: "proof_run_started" | "proof_run_completed" | "passport_issued",
  properties: Record<string, string | number | boolean | null>,
) {
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

  const vercelConnectionId = request.cookies.get("relyo_vercel_connection")?.value;
  const supabaseConnectionId = request.cookies.get("relyo_supabase_connection")?.value;
  const startedAt = Date.now();
  let stage = "public-discovery";

  emitProofEvent("proof_run_started", {
    has_url: Boolean(url),
    has_repo: Boolean(githubRepo),
    vercel_connected: Boolean(vercelConnectionId),
    supabase_connected: Boolean(supabaseConnectionId),
  });

  try {
    const discovery = await discoverApplication({
      ...(url ? { url } : {}),
      ...(githubRepo ? { githubRepo } : {}),
    });

    const store = proofStore();
    const signingPrivateKey = passportSigningPrivateKeyPem();
    let proof: Awaited<ReturnType<typeof executePublicR1Proof>>;
    let project: { id: string; name: string } | null = null;
    let supabaseProject: { id: string; name: string } | null = null;
    let providerMode = "public";

    if (vercelConnectionId) {
      stage = "vercel-connection";
      const services = credentialServices();
      const connection = await services.store.get(vercelConnectionId);
      if (!connection || connection.provider !== "vercel") {
        return json({ error: "The saved Vercel connection is no longer valid. Reconnect Vercel or clear it to continue without Vercel." }, 401);
      }
      if (!connection.boundProjectId) {
        return json({ error: "Choose a Vercel project, or continue without Vercel." }, 409);
      }

      const tokens = services.cipher.decrypt(connection.credential);
      const oauthExpired = Boolean(tokens.expiresAt && Date.parse(tokens.expiresAt) <= Date.now());
      if (oauthExpired && !hasVercelProviderReadToken()) {
        return json({ error: "Vercel connection expired. Reconnect Vercel or continue without Vercel." }, 401);
      }

      const readToken = vercelProviderReadToken(tokens.accessToken);
      stage = "vercel-project-scope";
      const accessibleProjects = await listVercelProjects({ token: readToken });
      const boundProject = accessibleProjects.find((candidate) => candidate.id === connection.boundProjectId);
      if (!boundProject) {
        return json({ error: "The bound Vercel project is not accessible. Re-bind it or continue without Vercel." }, 422);
      }

      const providerTeamId = boundProject.accountId ?? connection.providerTeamId;
      if (providerTeamId && providerTeamId !== connection.providerTeamId) {
        await services.store.save({ ...connection, providerTeamId, updatedAt: new Date().toISOString() });
      }

      stage = "vercel-observation";
      const vercel = await new VercelReadClient({
        token: readToken,
        ...(providerTeamId ? { teamId: providerTeamId } : {}),
      }).inspectProduction({ projectIdOrName: connection.boundProjectId });

      if (vercel.projectId !== connection.boundProjectId) {
        throw new Error("Provider project identity did not match the stored binding.");
      }
      project = { id: vercel.projectId, name: vercel.projectName };

      if (supabaseConnectionId) {
        stage = "supabase-connection";
        const supabaseConnection = await services.store.get(supabaseConnectionId);
        if (!supabaseConnection || supabaseConnection.provider !== "supabase") {
          return json({ error: "The saved Supabase connection is no longer valid. Reconnect Supabase or clear it to continue without Supabase." }, 401);
        }
        if (!supabaseConnection.boundProjectId) {
          return json({ error: "Choose a Supabase project, or continue without Supabase." }, 409);
        }

        const supabaseTokens = services.cipher.decrypt(supabaseConnection.credential);
        if (supabaseTokens.expiresAt && Date.parse(supabaseTokens.expiresAt) <= Date.now()) {
          return json({ error: "Supabase connection expired. Reconnect Supabase or continue without Supabase." }, 401);
        }

        stage = "supabase-observation";
        const supabase = await new SupabaseReadClient({ token: supabaseTokens.accessToken })
          .inspectProduction({ projectRef: supabaseConnection.boundProjectId });
        if (supabase.project.ref !== supabaseConnection.boundProjectId) {
          throw new Error("Supabase project identity did not match the stored binding.");
        }
        supabaseProject = { id: supabase.project.ref, name: supabase.project.name };

        stage = "proof-persistence";
        providerMode = "vercel+supabase";
        proof = await executeCombinedR1Proof({
          discovery,
          vercel,
          supabase,
          store,
          signingPrivateKey,
        });
      } else {
        stage = "proof-persistence";
        providerMode = "vercel";
        proof = await executeVercelR1Proof({
          discovery,
          provider: vercel,
          store,
          signingPrivateKey,
        });
      }
    } else if (supabaseConnectionId) {
      stage = "supabase-connection";
      const services = credentialServices();
      const supabaseConnection = await services.store.get(supabaseConnectionId);
      if (!supabaseConnection || supabaseConnection.provider !== "supabase") {
        return json({ error: "The saved Supabase connection is no longer valid. Reconnect Supabase or clear it to continue without Supabase." }, 401);
      }
      if (!supabaseConnection.boundProjectId) {
        return json({ error: "Choose a Supabase project, or continue without Supabase." }, 409);
      }

      const supabaseTokens = services.cipher.decrypt(supabaseConnection.credential);
      if (supabaseTokens.expiresAt && Date.parse(supabaseTokens.expiresAt) <= Date.now()) {
        return json({ error: "Supabase connection expired. Reconnect Supabase or continue without Supabase." }, 401);
      }

      stage = "supabase-observation";
      const supabase = await new SupabaseReadClient({ token: supabaseTokens.accessToken })
        .inspectProduction({ projectRef: supabaseConnection.boundProjectId });
      if (supabase.project.ref !== supabaseConnection.boundProjectId) {
        throw new Error("Supabase project identity did not match the stored binding.");
      }
      supabaseProject = { id: supabase.project.ref, name: supabase.project.name };

      stage = "proof-persistence";
      providerMode = "supabase";
      proof = await executeSupabaseAugmentedR1Proof({
        discovery,
        supabase,
        store,
        signingPrivateKey,
      });
    } else {
      stage = "proof-persistence";
      proof = await executePublicR1Proof({
        discovery,
        store,
        signingPrivateKey,
      });
    }

    emitProofEvent("proof_run_completed", {
      duration_ms: Date.now() - startedAt,
      proof_state: proof.run.state,
      assurance_achieved: proof.signedPassport.passport.assurance,
      blocker_count: proof.blockers.length,
      provider_mode: providerMode,
    });
    emitProofEvent("passport_issued", {
      assurance_achieved: proof.signedPassport.passport.assurance,
      signed: true,
      provider_mode: providerMode,
    });

    return json({
      providerMode,
      project,
      supabaseProject,
      run: proof.run,
      blockers: proof.blockers,
      signedPassport: proof.signedPassport,
    });
  } catch {
    console.error(JSON.stringify({ type: "relyo_verify_launch_error", stage }));
    return json({ error: `Relyo could not complete R1 ${stage}.` }, 422);
  }
}
