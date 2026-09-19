import { NextRequest } from "next/server";
import { hasScope, parseBearerToken } from "@relyo/proof-api";
import { proofApiKeyStore, proofStore } from "@/lib/server-services";

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

export async function GET(request: NextRequest, context: { params: Promise<{ runId: string }> }) {
  const token = parseBearerToken(request.headers.get("authorization"));
  if (!token) return json({ error: "A valid Bearer API key is required." }, 401);
  const keyStore = proofApiKeyStore();
  const key = await keyStore.findByToken(token);
  if (!key || !hasScope(key, "proof:read")) return json({ error: "API key is invalid, revoked, or lacks proof:read." }, 403);

  const { runId } = await context.params;
  if (!/^run_[A-Za-z0-9-]+$/.test(runId)) return json({ error: "Invalid proof run ID." }, 400);
  if (!(await keyStore.canReadRun(key.id, runId))) return json({ error: "Proof run not found." }, 404);

  const record = await proofStore().get(runId);
  if (!record) return json({ error: "Proof run not found." }, 404);
  return json({
    run: record.run,
    assurance: record.passport.assurance,
    blockers: record.passport.results
      .filter((result) => result.status !== "PASS")
      .map((result) => result.contractId),
    signedPassport: record.signedPassport,
  });
}
