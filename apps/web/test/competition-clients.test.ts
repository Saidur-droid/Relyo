import { describe, expect, it, vi } from "vitest";
import { NebiusReasoningClient } from "../lib/competition/nebius";
import { PayPalSandboxClient, extractPayPalOrderId } from "../lib/competition/paypal";

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("competition provider clients", () => {
  it("uses Nebius for reasoning without allowing invented contract IDs", async () => {
    const fakeFetch = vi.fn<typeof fetch>(async (_input, init) => {
      expect(String(init?.headers && (init.headers as Record<string, string>).authorization)).toContain("secret-nebius");
      return json({
        choices: [{
          message: {
            content: JSON.stringify({
              selectedContractIds: ["paypal.payment_integrity", "invented.contract"],
              diagnosis: "The webhook completed but entitlement is missing.",
              remediationPlan: ["Replay the verified event idempotently."],
              riskNotes: ["Do not mark the payment verified until deterministic proof passes."],
              confidence: 0.84,
            }),
          },
        }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      });
    });

    const client = new NebiusReasoningClient({
      apiKey: "secret-nebius",
      model: "nvidia/test-nemotron",
      baseUrl: "https://token-factory.test/v1",
      fetchImpl: fakeFetch,
    });

    const observation = await client.reasonAboutProof({
      candidateContractIds: ["paypal.payment_integrity"],
      evidenceSummaries: [],
      question: "What should Relyo verify next?",
    });

    expect(observation.selectedContractIds).toEqual(["paypal.payment_integrity"]);
    expect(observation.diagnosis).toMatch(/entitlement/i);
    expect(JSON.stringify(observation)).not.toContain("secret-nebius");
    expect(observation.evidence[0]?.kind).toBe("nebius-nemotron-reasoning");
  });

  it("reads PayPal sandbox order state without retaining the client secret", async () => {
    const fakeFetch = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url.endsWith("/v1/oauth2/token")) return json({ access_token: "paypal-access-token" });
      if (url.includes("/v2/checkout/orders/ORDER12345")) {
        return json({
          id: "ORDER12345",
          status: "COMPLETED",
          intent: "CAPTURE",
          purchase_units: [{
            payments: {
              captures: [{
                id: "CAPTURE1",
                status: "COMPLETED",
                amount: { currency_code: "USD", value: "12.00" },
              }],
            },
          }],
        });
      }
      return json({}, 404);
    });

    const client = new PayPalSandboxClient({
      clientId: "client-id",
      clientSecret: "super-secret",
      baseUrl: "https://paypal.test",
      fetchImpl: fakeFetch,
    });

    const observation = await client.inspectOrder("ORDER12345");
    expect(observation.status).toBe("COMPLETED");
    expect(observation.captures[0]?.status).toBe("COMPLETED");
    expect(JSON.stringify(observation)).not.toContain("super-secret");
    expect(JSON.stringify(observation)).not.toContain("paypal-access-token");
  });

  it("verifies PayPal webhook signatures and extracts the related order", async () => {
    const fakeFetch = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url.endsWith("/v1/oauth2/token")) return json({ access_token: "token" });
      if (url.endsWith("/v1/notifications/verify-webhook-signature")) {
        return json({ verification_status: "SUCCESS" });
      }
      return json({}, 404);
    });
    const client = new PayPalSandboxClient({
      clientId: "client-id",
      clientSecret: "secret",
      baseUrl: "https://paypal.test",
      fetchImpl: fakeFetch,
    });
    const event = {
      id: "WH-EVENT-1",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        supplementary_data: {
          related_ids: { order_id: "ORDER12345" },
        },
      },
    };

    expect(extractPayPalOrderId(event)).toBe("ORDER12345");
    const verified = await client.verifyWebhook({
      transmissionId: "transmission",
      transmissionTime: "2026-10-05T00:00:00Z",
      certUrl: "https://api.paypal.com/cert.pem",
      authAlgo: "SHA256withRSA",
      transmissionSig: "signature",
      webhookId: "WEBHOOK-ID",
      event,
    });
    expect(verified.verificationStatus).toBe("SUCCESS");
  });
});
