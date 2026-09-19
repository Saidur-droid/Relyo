import { NextRequest } from "next/server";
import { generateProofApiKey } from "@relyo/proof-api";
import { credentialServices, proofApiKeyStore } from "@/lib/server-services";

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

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "Cross-origin API key creation is not allowed." }, 403);
  const vercelConnectionId = request.cookies.get("relyo_vercel_connection")?.value;
  if (!vercelConnectionId) return json({ error: "Connect Vercel before creating an API key." }, 401);
  const supabaseConnectionId = request.cookies.get("relyo_supabase_connection")?.value;

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Request body must be a JSON object." }, 400);
  const label = typeof (body as { label?: unknown }).label === "string" ? (body as { label: string }).label.trim() : "";
  if (!label) return json({ error: "API key label is required." }, 400);

  try {
    const services = credentialServices();
    const vercel = await services.store.get(vercelConnectionId);
    if (!vercel || vercel.provider !== "vercel" || !vercel.boundProjectId) return json({ error: "A bound Vercel connection is required." }, 409);
    if (supabaseConnectionId) {
      const supabase = await services.store.get(supabaseConnectionId);
      if (!supabase || supabase.provider !== "supabase" || !supabase.boundProjectId) return json({ error: "The selected Supabase connection is not valid." }, 409);
    }

    const generated = generateProofApiKey({
      label,
      vercelConnectionId,
      ...(supabaseConnectionId ? { supabaseConnectionId } : {}),
    });
    await proofApiKeyStore().save(generated.record);
    return json({
      id: generated.record.id,
      label: generated.record.label,
      scopes: generated.record.scopes,
      createdAt: generated.record.createdAt,
      token: generated.token,
      warning: "This token is shown once. Store it securely; Relyo persists only its SHA-256 digest.",
    }, 201);
  } catch {
    return json({ error: "Relyo could not create the API key." }, 422);
  }
}
