import { describe, expect, it } from "vitest";
import { createEvidenceEnvelope } from "@relyo/kernel";
import { buildPayPalPaymentIntegrityReport } from "../src/paypal-payment-integrity.js";

const orderEvidence = createEvidenceEnvelope({
  kind: "paypal-order-observation",
  source: "paypal:sandbox:order:ORDER12345",
  payload: { id: "ORDER12345", status: "COMPLETED" },
});
const webhookEvidence = createEvidenceEnvelope({
  kind: "paypal-webhook-verification",
  source: "paypal:webhook:WH-EVENT-1",
  payload: { verificationStatus: "SUCCESS" },
});
const applicationEvidence = createEvidenceEnvelope({
  kind: "application-payment-outcome",
  source: "fixture:ORDER12345",
  payload: { orderPersisted: true },
});

describe("PayPal Payment Integrity Proof Contract", () => {
  it("passes only when PayPal and the full application outcome agree", () => {
    const report = buildPayPalPaymentIntegrityReport({
      order: {
        id: "ORDER12345",
        status: "COMPLETED",
        captures: [{ id: "CAPTURE1", status: "COMPLETED" }],
        evidence: [orderEvidence],
      },
      webhook: {
        eventId: "WH-EVENT-1",
        eventType: "PAYMENT.CAPTURE.COMPLETED",
        verificationStatus: "SUCCESS",
        orderId: "ORDER12345",
        evidence: [webhookEvidence],
      },
      application: {
        orderId: "ORDER12345",
        orderPersisted: true,
        processedWebhookEventId: "WH-EVENT-1",
        entitlementGranted: true,
        customerVisibleOutcome: true,
        evidence: [applicationEvidence],
      },
    });

    expect(report.result.status).toBe("PASS");
    expect(report.blockers).toEqual([]);
  });

  it("fails when PayPal succeeds but entitlement is missing", () => {
    const report = buildPayPalPaymentIntegrityReport({
      order: {
        id: "ORDER12345",
        status: "COMPLETED",
        captures: [{ id: "CAPTURE1", status: "COMPLETED" }],
        evidence: [orderEvidence],
      },
      webhook: {
        eventId: "WH-EVENT-1",
        eventType: "PAYMENT.CAPTURE.COMPLETED",
        verificationStatus: "SUCCESS",
        orderId: "ORDER12345",
        evidence: [webhookEvidence],
      },
      application: {
        orderId: "ORDER12345",
        orderPersisted: true,
        processedWebhookEventId: "WH-EVENT-1",
        entitlementGranted: false,
        customerVisibleOutcome: false,
        evidence: [applicationEvidence],
      },
    });

    expect(report.result.status).toBe("FAIL");
    expect(report.blockers).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/entitlement was not granted/i),
        expect.stringMatching(/customer-visible paid outcome/i),
      ]),
    );
  });

  it("fails closed when the webhook is bound to another order", () => {
    const report = buildPayPalPaymentIntegrityReport({
      order: {
        id: "ORDER12345",
        status: "COMPLETED",
        captures: [{ id: "CAPTURE1", status: "COMPLETED" }],
        evidence: [orderEvidence],
      },
      webhook: {
        eventId: "WH-EVENT-1",
        eventType: "PAYMENT.CAPTURE.COMPLETED",
        verificationStatus: "SUCCESS",
        orderId: "OTHERORDER",
        evidence: [webhookEvidence],
      },
      application: {
        orderId: "ORDER12345",
        orderPersisted: true,
        processedWebhookEventId: "WH-EVENT-1",
        entitlementGranted: true,
        customerVisibleOutcome: true,
        evidence: [applicationEvidence],
      },
    });

    expect(report.result.status).toBe("FAIL");
    expect(report.blockers.join(" ")).toMatch(/different PayPal order/i);
  });
});
