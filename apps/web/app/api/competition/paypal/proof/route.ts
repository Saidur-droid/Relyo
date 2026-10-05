import { buildPayPalPaymentIntegrityReport } from "@relyo/contracts/paypal-payment-integrity";
import {
  ApplicationPaymentOutcomeClient,
  PayPalSandboxClient,
  extractPayPalOrderId,
} from "@/lib/competition/paypal";
import { reasonAboutProofResult } from "@/lib/competition/reason-about-proof";

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

type PayPalProofRequest = {
  orderId?: unknown;
  transmissionId?: unknown;
  transmissionTime?: unknown;
  certUrl?: unknown;
  authAlgo?: unknown;
  transmissionSig?: unknown;
  event?: unknown;
};

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-origin payment proof requests are not allowed." }, 403);
  }

  let body: PayPalProofRequest;
  try {
    body = (await request.json()) as PayPalProofRequest;
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const transmissionId =
    typeof body.transmissionId === "string" ? body.transmissionId.trim() : "";
  const transmissionTime =
    typeof body.transmissionTime === "string" ? body.transmissionTime.trim() : "";
  const certUrl = typeof body.certUrl === "string" ? body.certUrl.trim() : "";
  const authAlgo = typeof body.authAlgo === "string" ? body.authAlgo.trim() : "";
  const transmissionSig =
    typeof body.transmissionSig === "string" ? body.transmissionSig.trim() : "";

  if (
    !orderId ||
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig ||
    !body.event
  ) {
    return json({ error: "PayPal proof input is incomplete." }, 400);
  }

  try {
    const paypal = new PayPalSandboxClient({
      clientId: required("PAYPAL_CLIENT_ID"),
      clientSecret: required("PAYPAL_CLIENT_SECRET"),
    });
    const application = new ApplicationPaymentOutcomeClient({
      baseUrl: required("RELYO_PAYMENT_OUTCOME_URL"),
      ...(process.env.RELYO_PAYMENT_OUTCOME_TOKEN?.trim()
        ? { bearerToken: process.env.RELYO_PAYMENT_OUTCOME_TOKEN.trim() }
        : {}),
    });

    const [order, webhook, applicationOutcome] = await Promise.all([
      paypal.inspectOrder(orderId),
      paypal.verifyWebhook({
        transmissionId,
        transmissionTime,
        certUrl,
        authAlgo,
        transmissionSig,
        webhookId: required("PAYPAL_WEBHOOK_ID"),
        event: body.event,
      }),
      application.inspect(orderId),
    ]);

    const report = buildPayPalPaymentIntegrityReport({
      order,
      webhook: {
        ...webhook,
        orderId: extractPayPalOrderId(body.event),
      },
      application: applicationOutcome,
    });

    const reasoning = await reasonAboutProofResult({
      result: report.result,
      evidence: report.evidence,
    });

    return json({
      result: report.result,
      blockers: report.blockers,
      evidence: report.evidence,
      reasoning,
      trustBoundary:
        "Nemotron reasons about the deterministic result; Relyo evidence decides the final status.",
    });
  } catch {
    console.error(JSON.stringify({
      type: "relyo_paypal_proof_error",
      stage: "payment-integrity",
    }));
    return json({ error: "Relyo could not complete PayPal payment integrity proof." }, 422);
  }
}
