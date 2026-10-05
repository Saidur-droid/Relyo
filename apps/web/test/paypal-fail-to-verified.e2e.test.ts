import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { createEvidenceEnvelope } from "@relyo/kernel";
import { buildPayPalPaymentIntegrityReport } from "@relyo/contracts/paypal-payment-integrity";
import { ApplicationPaymentOutcomeClient } from "../lib/competition/paypal";

const PORT = 43137;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CONTROL_TOKEN = "fixture-control-token";
const READ_TOKEN = "fixture-read-token";
const ORDER_ID = "ORDER12345";
const EVENT_ID = "WH-EVENT-1";

let fixture: ChildProcess;

async function waitForFixture(): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error("Qualification fixture did not start.");
}

async function seedBroken(): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/api/payment-outcomes/${ORDER_ID}/seed`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-relyo-fixture-control": CONTROL_TOKEN,
      },
      body: JSON.stringify({ mode: "broken", eventId: EVENT_ID }),
    },
  );
  if (!response.ok) throw new Error(`Failed to seed broken payment outcome: ${response.status}`);
}

function providerEvidence() {
  const orderEvidence = createEvidenceEnvelope({
    kind: "paypal-order-observation",
    source: `paypal:sandbox:order:${ORDER_ID}`,
    payload: { id: ORDER_ID, status: "COMPLETED" },
  });
  const webhookEvidence = createEvidenceEnvelope({
    kind: "paypal-webhook-verification",
    source: `paypal:webhook:${EVENT_ID}`,
    payload: { eventId: EVENT_ID, verificationStatus: "SUCCESS" },
  });
  return { orderEvidence, webhookEvidence };
}

describe("PayPal competition FAIL -> VERIFIED journey", () => {
  beforeAll(async () => {
    fixture = spawn(
      process.execPath,
      [resolve(process.cwd(), "../qualification-fixture/server.mjs")],
      {
        env: {
          ...process.env,
          PORT: String(PORT),
          FIXTURE_CONTROL_TOKEN: CONTROL_TOKEN,
          PAYMENT_OUTCOME_READ_TOKEN: READ_TOKEN,
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    await waitForFixture();
  }, 15_000);

  afterAll(() => {
    fixture?.kill("SIGTERM");
  });

  it("proves PayPal success can FAIL, applies the isolated fix, then independently verifies PASS", async () => {
    await seedBroken();

    const application = new ApplicationPaymentOutcomeClient({
      baseUrl: `${BASE_URL}/api/payment-outcomes`,
      bearerToken: READ_TOKEN,
    });
    const { orderEvidence, webhookEvidence } = providerEvidence();

    const brokenOutcome = await application.inspect(ORDER_ID);
    const before = buildPayPalPaymentIntegrityReport({
      order: {
        id: ORDER_ID,
        status: "COMPLETED",
        captures: [{ id: "CAPTURE1", status: "COMPLETED" }],
        evidence: [orderEvidence],
      },
      webhook: {
        eventId: EVENT_ID,
        eventType: "PAYMENT.CAPTURE.COMPLETED",
        verificationStatus: "SUCCESS",
        orderId: ORDER_ID,
        evidence: [webhookEvidence],
      },
      application: brokenOutcome,
    });

    expect(before.result.status).toBe("FAIL");
    expect(before.blockers.join(" ")).toMatch(/entitlement was not granted/i);

    const remediate = await fetch(
      `${BASE_URL}/api/payment-outcomes/${ORDER_ID}/remediate`,
      {
        method: "POST",
        headers: {
          "x-relyo-fixture-control": CONTROL_TOKEN,
        },
      },
    );
    expect(remediate.status).toBe(200);

    const fixedOutcome = await application.inspect(ORDER_ID);
    const after = buildPayPalPaymentIntegrityReport({
      order: {
        id: ORDER_ID,
        status: "COMPLETED",
        captures: [{ id: "CAPTURE1", status: "COMPLETED" }],
        evidence: [orderEvidence],
      },
      webhook: {
        eventId: EVENT_ID,
        eventType: "PAYMENT.CAPTURE.COMPLETED",
        verificationStatus: "SUCCESS",
        orderId: ORDER_ID,
        evidence: [webhookEvidence],
      },
      application: fixedOutcome,
    });

    expect(after.result.status).toBe("PASS");
    expect(after.blockers).toEqual([]);
    expect(fixedOutcome.processedWebhookEventId).toBe(EVENT_ID);
    expect(fixedOutcome.entitlementGranted).toBe(true);
    expect(fixedOutcome.customerVisibleOutcome).toBe(true);
  });
});
