import { listVercelProjects } from "@relyo/adapter-vercel/projects";
import { NextRequest } from "next/server";
import { credentialServices, vercelProviderReadToken } from "@/lib/server-services";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const connectionId = request.cookies.get("relyo_vercel_connection")?.value;
  if (!connectionId) {
    return Response.json({ error: "Vercel is not connected." }, { status: 401 });
  }

  try {
    const services = credentialServices();
    const connection = await services.store.get(connectionId);
    if (!connection || connection.provider !== "vercel") {
      return Response.json({ error: "Vercel connection was not found." }, { status: 401 });
    }

    const tokens = services.cipher.decrypt(connection.credential);
    if (tokens.expiresAt && Date.parse(tokens.expiresAt) <= Date.now()) {
      return Response.json({ error: "Vercel connection expired. Reconnect Vercel." }, { status: 401 });
    }

    const projects = await listVercelProjects({
      token: vercelProviderReadToken(tokens.accessToken),
      ...(connection.providerTeamId ? { teamId: connection.providerTeamId } : {}),
    });

    return Response.json(
      {
        projects: projects.map((project) => ({
          id: project.id,
          name: project.name,
          framework: project.framework,
        })),
        boundProject: connection.boundProjectId
          ? {
              id: connection.boundProjectId,
              name: connection.boundProjectName ?? connection.boundProjectId,
            }
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
      { error: "Relyo could not read Vercel projects for this connection." },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}
