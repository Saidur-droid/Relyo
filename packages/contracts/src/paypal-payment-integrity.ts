import {
  evaluateContract,
  type Assertion,
  type ContractResult,
  type EvidenceEnvelope,
  type ProofContract,
} from "@relyo/kernel";

export interface PayPalOrderProofObservation {
  id: string;
  status: string;
  captures: Array<{
    id: string;
    status: string;
  }>;
  evidence: EvidenceEnvelope[];
}

export interface PayPalWebhookProofObservation {
  eventId: string | null;
  eventType: string | null;
  verificationStatus: "SUCCESS" | "FAILURE" | "UNKNOWN";
  orderId: string | null;
  evidence: EvidenceEnvelope[];
}

export interface PayPalApplicationOutcomeObservation {
  orderId: string;
  orderPersisted: boolean;
  processedWebhookEventId: string | null;
  entitlementGranted: boolean;
  customerVisibleOutcome: boolean;
  evidence: EvidenceEnvelope[];
}

export interface PayPalPaymentIntegrityReport {
  contract: ProofContract;
  result: ContractResult;
  blockers: string[];
  evidence: EvidenceEnvelope[];
}

function assertion(input: Assertion): Assertion {
  return input;
}

function passFail(value: boolean): "PASS" | "FAIL" {
  return value ? "PASS" : "FAIL";
}

export function buildPayPalPaymentIntegrityContract(input: {
  order: PayPalOrderProofObservation;
  webhook: PayPalWebhookProofObservation;
  application: PayPalApplicationOutcomeObservation;
}): ProofContract {
  const completedCapture = input.order.captures.some(
    (capture) => capture.status === "COMPLETED",
  );
  const webhookBoundToOrder =
    Boolean(input.webhook.orderId) && input.webhook.orderId === input.order.id;
  const applicationBoundToOrder = input.application.orderId === input.order.id;
  const webhookProcessedExactlyForObservedEvent =
    Boolean(input.webhook.eventId) &&
    input.application.processedWebhookEventId === input.webhook.eventId;

  return {
    id: "paypal.payment_integrity",
    version: "1",
    title: "PayPal payment integrity",
    requiredFor: ["R2", "R3", "R4"],
    assertions: [
      assertion({
        id: "paypal.order.completed",
        description: "The PayPal sandbox order reached COMPLETED",
        status: passFail(input.order.status === "COMPLETED"),
        evidenceRefs: input.order.evidence.map((item) => item.id),
        message:
          input.order.status === "COMPLETED"
            ? `PayPal order ${input.order.id} is COMPLETED.`
            : `PayPal order ${input.order.id} is ${input.order.status}, not COMPLETED.`,
      }),
      assertion({
        id: "paypal.capture.completed",
        description: "At least one PayPal capture completed",
        status: passFail(completedCapture),
        evidenceRefs: input.order.evidence.map((item) => item.id),
        message: completedCapture
          ? "A completed capture was observed."
          : "No completed capture was observed.",
      }),
      assertion({
        id: "paypal.webhook.verified",
        description: "The relevant PayPal webhook signature was independently verified",
        status:
          input.webhook.verificationStatus === "SUCCESS"
            ? "PASS"
            : input.webhook.verificationStatus === "FAILURE"
              ? "FAIL"
              : "UNKNOWN",
        evidenceRefs: input.webhook.evidence.map((item) => item.id),
        message:
          input.webhook.verificationStatus === "SUCCESS"
            ? "PayPal verified the webhook signature."
            : "The PayPal webhook signature is not verified.",
      }),
      assertion({
        id: "paypal.webhook.order-bound",
        description: "The verified webhook is bound to the same PayPal order",
        status: input.webhook.orderId ? passFail(webhookBoundToOrder) : "UNKNOWN",
        evidenceRefs: input.webhook.evidence.map((item) => item.id),
        message: input.webhook.orderId
          ? webhookBoundToOrder
            ? "Webhook evidence references the same PayPal order."
            : "Webhook evidence references a different PayPal order."
          : "The webhook did not expose an order identifier that Relyo could bind.",
      }),
      assertion({
        id: "paypal.application.order-persisted",
        description: "The application persisted the same PayPal order",
        status: passFail(applicationBoundToOrder && input.application.orderPersisted),
        evidenceRefs: input.application.evidence.map((item) => item.id),
        message:
          applicationBoundToOrder && input.application.orderPersisted
            ? "The application persisted the observed PayPal order."
            : "The application did not persist the observed PayPal order correctly.",
      }),
      assertion({
        id: "paypal.application.webhook-processed",
        description: "The application processed the exact verified webhook event",
        status: input.webhook.eventId
          ? passFail(webhookProcessedExactlyForObservedEvent)
          : "UNKNOWN",
        evidenceRefs: input.application.evidence.map((item) => item.id),
        message: input.webhook.eventId
          ? webhookProcessedExactlyForObservedEvent
            ? "The exact verified webhook event was processed by the application."
            : "The application did not record processing of the exact verified webhook event."
          : "No webhook event ID was available for application-state binding.",
      }),
      assertion({
        id: "paypal.application.entitlement",
        description: "The paid entitlement or order outcome was granted",
        status: passFail(input.application.entitlementGranted),
        evidenceRefs: input.application.evidence.map((item) => item.id),
        message: input.application.entitlementGranted
          ? "The paid entitlement was granted."
          : "The PayPal payment completed but the entitlement was not granted.",
      }),
      assertion({
        id: "paypal.application.customer-visible",
        description: "The customer-visible paid outcome is correct",
        status: passFail(input.application.customerVisibleOutcome),
        evidenceRefs: input.application.evidence.map((item) => item.id),
        message: input.application.customerVisibleOutcome
          ? "The customer-visible paid outcome is correct."
          : "The customer-visible paid outcome is not correct.",
      }),
    ],
  };
}

export function buildPayPalPaymentIntegrityReport(input: {
  order: PayPalOrderProofObservation;
  webhook: PayPalWebhookProofObservation;
  application: PayPalApplicationOutcomeObservation;
}): PayPalPaymentIntegrityReport {
  const contract = buildPayPalPaymentIntegrityContract(input);
  const result = evaluateContract(contract);
  const evidence = [
    ...input.order.evidence,
    ...input.webhook.evidence,
    ...input.application.evidence,
  ];
  const blockers = result.assertions
    .filter((item) => item.status !== "PASS")
    .map((item) => item.message ?? item.description);

  return { contract, result, blockers, evidence };
}
