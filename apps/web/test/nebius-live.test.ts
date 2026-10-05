import { describe, expect, it } from "vitest";
import { NebiusReasoningClient } from "../lib/competition/nebius";

const apiKey = process.env.NEBIUS_API_KEY?.trim();
const liveIt = apiKey ? it : it.skip;

describe("live Nebius Token Factory / NVIDIA Nemotron", () => {
  liveIt("returns structured reasoning while Relyo keeps deterministic truth outside the model", async () => {
    const client = new NebiusReasoningClient({
      apiKey: apiKey!,
      ...(process.env.NEBIUS_MODEL?.trim()
        ? { model: process.env.NEBIUS_MODEL.trim() }
        : {}),
      ...(process.env.NEBIUS_BASE_URL?.trim()
        ? { baseUrl: process.env.NEBIUS_BASE_URL.trim() }
        : {}),
      timeoutMs: 30_000,
    });

    const observation = await client.reasonAboutProof({
      release: {
        repository: "Saidur-droid/Relyo",
        environment: "competition-live-smoke",
      },
      candidateContractIds: ["paypal.payment_integrity"],
      evidenceSummaries: [{
        kind: "paypal-payment-integrity",
        source: "competition-live-smoke",
        summary: {
          paypalStatus: "COMPLETED",
          entitlementGranted: false,
        },
      }],
      question:
        "A PayPal capture completed but the deterministic Relyo payment integrity contract found that the entitlement was not granted. Select the supplied proof contract, diagnose the likely boundary, and propose a safe re-verification plan. Do not claim PASS or VERIFIED.",
    });

    expect(observation.provider).toBe("nebius-token-factory");
    expect(observation.model.toLowerCase()).toContain("nemotron");
    expect(observation.selectedContractIds).toContain("paypal.payment_integrity");
    expect(observation.diagnosis.length).toBeGreaterThan(10);
    expect(observation.evidence[0]?.kind).toBe("nebius-nemotron-reasoning");
    expect(JSON.stringify(observation).toUpperCase()).not.toContain("NEBIUS_API_KEY");
  }, 45_000);
});
