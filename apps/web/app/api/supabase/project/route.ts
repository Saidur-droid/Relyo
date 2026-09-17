import { SupabaseReadClient } from "@relyo/adapter-supabase";
import { bindProviderProject } from "@relyo/credentials";
import { NextRequest } from "next/server";
import { credentialServices } from "@/lib/server-services";

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

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "Cross-origin project binding is not allowed." }, 403);

  const connectionId = request.cookies.get("relyo_supabase_connection")?.value;
  if (!connectionId) return json({ error: "Supabase is not connected." }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const projectId = typeof (body as { projectId?: unknown }).projectId === "string"
    ? (body as { projectId: string }).projectId.trim()
    : "";
  if (!projectId || projectId.length > 256) return json({ error: "Choose a valid Supabase project." }, 400);

  try {
    const services = credentialServices();
    const connection = await services.store.get(connectionId);
    if (!connection || connection.provider !== "supabase") {
      return json({ error: "Supabase connection was not found. Reconnect Supabase." }, 401);
    }

    const tokens = services.cipher.decrypt(connection.credential);
    if (tokens.expiresAt && Date.parse(tokens.expiresAt) <= Date.now()) {
      return json({ error: "Supabase connection expired. Reconnect Supabase." }, 401);
    }

    const projects = await new SupabaseReadClient({ token: tokens.accessToken }).listProjects();
    const project = projects.find((candidate) => candidate.ref === projectId || candidate.id === projectId);
    if (!project) return json({ error: "That Supabase project is not accessible through this connection." }, 404);

    const bound = bindProviderProject(connection, {
      projectId: project.ref,
      projectName: project.name,
    });
    await services.store.save(bound);

    return json({ project: { id: project.ref, name: project.name, region: project.region, status: project.status } });
  } catch {
    return json({ error: "Relyo could not bind that Supabase project." }, 502);
  }
}
