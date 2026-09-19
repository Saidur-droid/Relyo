import { NextRequest } from "next/server";
import { hasScope, parseBearerToken, signWebhookBody, validateWebhookUrl } from "@relyo/proof-api";
import { assertSafePublicUrl } from "@relyo/discovery";
import { executeLaunchProof, LaunchProofPublicError } from "@/lib/execute-launch-proof";
import { proofApiKeyStore } from "@/lib/server-services";

export const runtime = "nodejs";

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

async function deliverWebhook(input: {
  url: string;
  secret: string;
  payload: unknown;
  runId: string;
}): Promise<"delivered" | "failed"> {
  try {
    const url = validateWebhookUrl(input.url);
    await assertSafePublicUrl(url);
    const body = JSON.stringify(input.payload);
    const timestamp = new Date().toISOString();
    const signature = signWebhookBody(input.secret, body, timestamp);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Relyo-Webhook/0.1",
        "x-relyo-event": "proof.run.completed",
        "x-relyo-run-id": input.runId,
        "x-relyo-timestamp": timestamp,
        "x-relyo-signature-sha256": signature,
      },
      body,
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok ? "delivered" : "failed";
  } catch {
    return "failed";
  }
}

export async function POST(request: NextRequest) {
  const token = parseBearerToken(request.headers.get("authorization"));
  if (!token) return json({ error: "A valid Bearer API key is required." }, 401);

  const keyStore = proofApiKeyStore();
  const key = await keyStore.findByToken(token);
  if (!key || !hasScope(key, "proof:run")) return json({ error: "API key is invalid, revoked, or lacks proof:run." }, 403);

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Request body must be a JSON object." }, 400);
  const raw = body as { url?: unknown; githubRepo?: unknown; webhook?: unknown };
  const url = typeof raw.url === "string" ? raw.url.trim() : "";
  const githubRepo = typeof raw.githubRepo === "string" ? raw.githubRepo.trim() : "";
  if (!url && !githubRepo) return json({ error: "Provide a production URL, a public GitHub repository, or both." }, 400);
  if (url.length > 2048 || githubRepo.length > 256) return json({ error: "Input is too long." }, 400);

  let webhook: { url: string; secret: string } | undefined;
  if (raw.webhook !== undefined) {
    if (!raw.webhook || typeof raw.webhook !== "object" || Array.isArray(raw.webhook)) return json({ error: "webhook must be an object." }, 400);
    const value = raw.webhook as { url?: unknown; secret?: unknown };
    if (typeof value.url !== "string" || typeof value.secret !== "string" || value.secret.length < 16) {
      return json({ error: "webhook requires an HTTPS URL and a secret of at least 16 characters." }, 400);
    }
    try { validateWebhookUrl(value.url); } catch { return json({ error: "Webhook URL is not allowed." }, 400); }
    webhook = { url: value.url, secret: value.secret };
  }

  try {
    const result = await executeLaunchProof({
      ...(url ? { url } : {}),
      ...(githubRepo ? { githubRepo } : {}),
      vercelConnectionId: key.vercelConnectionId,
      ...(key.supabaseConnectionId ? { supabaseConnectionId: key.supabaseConnectionId } : {}),
    });
    await keyStore.bindRun(key.id, result.proof.run.id);
    const responsePayload = {
      project: result.project,
      supabaseProject: result.supabaseProject,
      run: result.proof.run,
      blockers: result.proof.blockers,
      signedPassport: result.proof.signedPassport,
    };
    const webhookDelivery = webhook
      ? await deliverWebhook({
          ...webhook,
          runId: result.proof.run.id,
          payload: {
            event: "proof.run.completed",
            run: result.proof.run,
            assurance: result.proof.signedPassport.passport.assurance,
            passportSha256: result.proof.signedPassport.passportSha256,
          },
        })
      : undefined;
    return json({ ...responsePayload, ...(webhookDelivery ? { webhookDelivery } : {}) }, 201);
  } catch (error) {
    const safe = error instanceof LaunchProofPublicError
      ? error
      : new LaunchProofPublicError(422, "unknown", "Relyo could not complete the proof run.");
    console.error(JSON.stringify({ type: "relyo_proof_api_error", stage: safe.stage, api_key_id: key.id }));
    return json({ error: safe.message }, safe.status);
  }
}
