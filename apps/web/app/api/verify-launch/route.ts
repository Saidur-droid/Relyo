import { VercelReadClient } from "@relyo/adapter-vercel";
import { listVercelProjects } from "@relyo/adapter-vercel/projects";
import { discoverApplication } from "@relyo/discovery";
import { executeVercelR1Proof } from "@relyo/proof-engine";
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

  const connectionId = request.cookies.get("relyo_vercel_connection")?.value;
  if (!connectionId) return json({ error: "Connect Vercel before running launch proof." }, 401);

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
  let stage = "connection";
  emitProofEvent("proof_run_started", {
    has_url: Boolean(url),
    has_repo: Boolean(githubRepo),
  });

  try {
    const services = credentialServices();
    const connection = await services.store.get(connectionId);
    if (!connection || connection.provider !== "vercel") {
      return json({ error: "Vercel connection was not found. Reconnect Vercel." }, 401);
    }
    if (!connection.boundProjectId) {
      return json({ error: "Choose a Vercel project before running launch proof." }, 409);
    }

    const tokens = services.cipher.decrypt(connection.credential);
    const oauthExpired = Boolean(tokens.expiresAt && Date.parse(tokens.expiresAt) <= Date.now());
    if (oauthExpired && !hasVercelProviderReadToken()) {
      return json({ error: "Vercel connection expired. Reconnect Vercel." }, 401);
    }

    const readToken = vercelProviderReadToken(tokens.accessToken);

    stage = "project-scope";
    const accessibleProjects = await listVercelProjects({ token: readToken });
    const boundProject = accessibleProjects.find((project) => project.id === connection.boundProjectId);
    if (!boundProject) {
      return json({ error: "The bound Vercel project is not accessible with the production read token." }, 422);
    }

    const providerTeamId = boundProject.accountId ?? connection.providerTeamId;
    if (providerTeamId && providerTeamId !== connection.providerTeamId) {
      await services.store.save({ ...connection, providerTeamId, updatedAt: new Date().toISOString() });
    }

    stage = "public-discovery";
    const discovery = await discoverApplication({
      ...(url ? { url } : {}),
      ...(githubRepo ? { githubRepo } : {}),
    });

    stage = "provider-observation";
    const provider = await new VercelReadClient({
      token: readToken,
      ...(providerTeamId ? { teamId: providerTeamId } : {}),
    }).inspectProduction({ projectIdOrName: connection.boundProjectId });

    if (provider.projectId !== connection.boundProjectId) {
      throw new Error("Provider project identity did not match the stored binding.");
    }

    stage = "proof-persistence";
    const proof = await executeVercelR1Proof({
      discovery,
      provider,
      store: proofStore(),
      signingPrivateKey: passportSigningPrivateKeyPem(),
    });

    emitProofEvent("proof_run_completed", {
      duration_ms: Date.now() - startedAt,
      proof_state: proof.run.state,
      assurance_achieved: proof.signedPassport.passport.assurance,
      blocker_count: proof.blockers.length,
    });
    emitProofEvent("passport_issued", {
      assurance_achieved: proof.signedPassport.passport.assurance,
      signed: true,
    });

    return json({
      project: {
        id: provider.projectId,
        name: provider.projectName,
      },
      run: proof.run,
      blockers: proof.blockers,
      signedPassport: proof.signedPassport,
    });
  } catch {
    // Provider/DB errors can contain credential values without recognizable words.
    // Log only the controlled stage; never serialize the underlying error.
    console.error(JSON.stringify({ type: "relyo_verify_launch_error", stage }));
    return json({ error: `Relyo could not complete R1 ${stage}.` }, 422);
  }
}
