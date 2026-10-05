import { NebiusReasoningClient, type NebiusReasoningInput } from "@/lib/competition/nebius";

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

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Server configuration ${name} is missing.`);
  return value;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-origin reasoning requests are not allowed." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Request body must be a JSON object." }, 400);
  }

  const input = body as Partial<NebiusReasoningInput>;
  if (
    typeof input.question !== "string" ||
    !Array.isArray(input.candidateContractIds) ||
    !Array.isArray(input.evidenceSummaries)
  ) {
    return json({ error: "Reasoning input is incomplete." }, 400);
  }

  try {
    const client = new NebiusReasoningClient({
      apiKey: required("NEBIUS_API_KEY"),
      ...(process.env.NEBIUS_MODEL?.trim()
        ? { model: process.env.NEBIUS_MODEL.trim() }
        : {}),
      ...(process.env.NEBIUS_BASE_URL?.trim()
        ? { baseUrl: process.env.NEBIUS_BASE_URL.trim() }
        : {}),
    });

    const reasoning = await client.reasonAboutProof({
      question: input.question,
      candidateContractIds: input.candidateContractIds.filter(
        (item): item is string => typeof item === "string",
      ),
      evidenceSummaries: input.evidenceSummaries.filter(
        (item): item is NebiusReasoningInput["evidenceSummaries"][number] =>
          Boolean(item && typeof item === "object" && !Array.isArray(item)),
      ),
      ...(input.release && typeof input.release === "object"
        ? { release: input.release }
        : {}),
    });

    return json({ reasoning });
  } catch {
    console.error(JSON.stringify({
      type: "relyo_nebius_reasoning_error",
      stage: "token-factory-reasoning",
    }));
    return json({ error: "Relyo could not complete Nebius reasoning." }, 422);
  }
}
