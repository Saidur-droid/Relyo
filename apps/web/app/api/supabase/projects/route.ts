import { SupabaseReadClient } from "@relyo/adapter-supabase";
import { NextRequest } from "next/server";
import { credentialServices } from "@/lib/server-services";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const connectionId = request.cookies.get("relyo_supabase_connection")?.value;
  if (!connectionId) {
    return Response.json({ error: "Supabase is not connected." }, { status: 401 });
  }

  try {
    const services = credentialServices();
    const connection = await services.store.get(connectionId);
    if (!connection || connection.provider !== "supabase") {
      return Response.json({ error: "Supabase connection was not found." }, { status: 401 });
    }

    const tokens = services.cipher.decrypt(connection.credential);
    if (tokens.expiresAt && Date.parse(tokens.expiresAt) <= Date.now()) {
      return Response.json({ error: "Supabase connection expired. Reconnect Supabase." }, { status: 401 });
    }

    const projects = await new SupabaseReadClient({ token: tokens.accessToken }).listProjects();
    return Response.json(
      {
        projects: projects.map((project) => ({
          id: project.ref,
          name: project.name,
          region: project.region,
          status: project.status,
        })),
        boundProject: connection.boundProjectId
          ? { id: connection.boundProjectId, name: connection.boundProjectName ?? connection.boundProjectId }
          : null,
      },
      {
        headers: {
          "cache-control": "no-store",
          "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
          "x-content-type-options": "nosniff",
        },
      },
    );
  } catch {
    return Response.json(
      { error: "Relyo could not read Supabase projects for this connection." },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}
