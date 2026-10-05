import {
  createEvidenceEnvelope,
  sha256Json,
  type EvidenceEnvelope,
} from "@relyo/kernel";

export const DEFAULT_PAYPAL_SANDBOX_BASE_URL =
  "https://api-m.sandbox.paypal.com";

export interface PayPalCaptureEvidence {
  id: string;
  status: string;
  amount: {
    currencyCode: string | null;
    value: string | null;
  };
}

export interface PayPalOrderObservation {
  provider: "paypal";
  id: string;
  status: string;
  intent: string;
  captures: PayPalCaptureEvidence[];
  evidence: EvidenceEnvelope[];
}

export interface PayPalWebhookVerification {
  provider: "paypal";
  eventId: string | null;
  eventType: string | null;
  verificationStatus: "SUCCESS" | "FAILURE" | "UNKNOWN";
  eventHash: string;
  evidence: EvidenceEnvelope[];
}

export interface PayPalWebhookInput {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookId: string;
  event: unknown;
}

export interface PayPalClientOptions {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

type OAuthResponse = {
  access_token?: string;
};

type PayPalOrderResponse = {
  id?: string;
  status?: string;
  intent?: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: {
          currency_code?: string;
          value?: string;
        };
      }>;
    };
  }>;
};

type VerifyWebhookResponse = {
  verification_status?: string;
};

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function validOrderId(value: string): boolean {
  return /^[A-Za-z0-9_-]{8,64}$/.test(value);
}

function requirePayPalCertUrl(value: string): string {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:") throw new Error("PayPal certificate URL must use HTTPS.");
  const host = parsed.hostname.toLowerCase();
  if (!(host === "paypal.com" || host.endsWith(".paypal.com"))) {
    throw new Error("PayPal certificate URL host is not trusted.");
  }
  return value;
}

function eventMetadata(event: unknown): { id: string | null; type: string | null } {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return { id: null, type: null };
  }
  const record = event as Record<string, unknown>;
  return {
    id: typeof record.id === "string" ? record.id : null,
    type: typeof record.event_type === "string" ? record.event_type : null,
  };
}

export function extractPayPalOrderId(event: unknown): string | null {
  if (!event || typeof event !== "object" || Array.isArray(event)) return null;
  const root = event as Record<string, unknown>;
  const resource =
    root.resource && typeof root.resource === "object" && !Array.isArray(root.resource)
      ? (root.resource as Record<string, unknown>)
      : null;

  if (resource && typeof resource.id === "string" && root.event_type === "CHECKOUT.ORDER.APPROVED") {
    return resource.id;
  }

  const supplementary =
    resource?.supplementary_data &&
    typeof resource.supplementary_data === "object" &&
    !Array.isArray(resource.supplementary_data)
      ? (resource.supplementary_data as Record<string, unknown>)
      : null;
  const related =
    supplementary?.related_ids &&
    typeof supplementary.related_ids === "object" &&
    !Array.isArray(supplementary.related_ids)
      ? (supplementary.related_ids as Record<string, unknown>)
      : null;

  return typeof related?.order_id === "string" ? related.order_id : null;
}

export class PayPalSandboxClient {
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly options: PayPalClientOptions) {
    if (!options.clientId.trim() || !options.clientSecret.trim()) {
      throw new Error("PayPal client ID and client secret are required.");
    }
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = normalizeBaseUrl(
      options.baseUrl?.trim() || DEFAULT_PAYPAL_SANDBOX_BASE_URL,
    );
    this.timeoutMs = options.timeoutMs ?? 15_000;
  }

  async inspectOrder(orderId: string): Promise<PayPalOrderObservation> {
    if (!validOrderId(orderId)) throw new Error("PayPal order ID is invalid.");

    const token = await this.accessToken();
    const response = await this.fetchImpl(
      `${this.baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(this.timeoutMs),
      },
    );

    if (response.status === 404) throw new Error("PayPal sandbox order was not found.");
    if (!response.ok) throw new Error(`PayPal Orders API returned HTTP ${response.status}.`);

    const payload = (await response.json()) as PayPalOrderResponse;
    if (!payload.id || !payload.status || !payload.intent) {
      throw new Error("PayPal order response was incomplete.");
    }

    const captures = (payload.purchase_units ?? [])
      .flatMap((unit) => unit.payments?.captures ?? [])
      .filter((capture): capture is NonNullable<typeof capture> & { id: string; status: string } =>
        Boolean(capture.id && capture.status),
      )
      .map((capture) => ({
        id: capture.id,
        status: capture.status,
        amount: {
          currencyCode: capture.amount?.currency_code ?? null,
          value: capture.amount?.value ?? null,
        },
      }));

    const redactedPayload = {
      id: payload.id,
      status: payload.status,
      intent: payload.intent,
      captures,
    };

    return {
      provider: "paypal",
      ...redactedPayload,
      evidence: [
        createEvidenceEnvelope({
          kind: "paypal-order-observation",
          source: `paypal:sandbox:order:${payload.id}`,
          payload: redactedPayload,
          redacted: true,
          summary: {
            orderId: payload.id,
            status: payload.status,
            intent: payload.intent,
            captureCount: captures.length,
            completedCaptureCount: captures.filter((item) => item.status === "COMPLETED").length,
          },
        }),
      ],
    };
  }

  async verifyWebhook(
    input: PayPalWebhookInput,
  ): Promise<PayPalWebhookVerification> {
    requirePayPalCertUrl(input.certUrl);
    if (!input.webhookId.trim()) throw new Error("PayPal webhook ID is required.");

    const token = await this.accessToken();
    const response = await this.fetchImpl(
      `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          transmission_id: input.transmissionId,
          transmission_time: input.transmissionTime,
          cert_url: input.certUrl,
          auth_algo: input.authAlgo,
          transmission_sig: input.transmissionSig,
          webhook_id: input.webhookId,
          webhook_event: input.event,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(this.timeoutMs),
      },
    );

    if (!response.ok) {
      throw new Error(`PayPal webhook verification returned HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as VerifyWebhookResponse;
    const rawStatus = payload.verification_status;
    const verificationStatus =
      rawStatus === "SUCCESS"
        ? "SUCCESS"
        : rawStatus === "FAILURE"
          ? "FAILURE"
          : "UNKNOWN";
    const metadata = eventMetadata(input.event);
    const eventHash = sha256Json(input.event);

    const evidence = [
      createEvidenceEnvelope({
        kind: "paypal-webhook-verification",
        source: `paypal:webhook:${metadata.id ?? eventHash.slice(0, 16)}`,
        payload: {
          eventId: metadata.id,
          eventType: metadata.type,
          eventHash,
          verificationStatus,
        },
        redacted: true,
        summary: {
          eventId: metadata.id,
          eventType: metadata.type,
          verificationStatus,
        },
      }),
    ];

    return {
      provider: "paypal",
      eventId: metadata.id,
      eventType: metadata.type,
      verificationStatus,
      eventHash,
      evidence,
    };
  }

  private async accessToken(): Promise<string> {
    const basic = Buffer.from(
      `${this.options.clientId}:${this.options.clientSecret}`,
      "utf8",
    ).toString("base64");

    const response = await this.fetchImpl(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        authorization: `Basic ${basic}`,
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("PayPal sandbox credential is invalid or unauthorized.");
    }
    if (!response.ok) {
      throw new Error(`PayPal OAuth returned HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as OAuthResponse;
    if (!payload.access_token) throw new Error("PayPal OAuth returned no access token.");
    return payload.access_token;
  }
}


export interface ApplicationPaymentOutcomeObservation {
  orderId: string;
  orderPersisted: boolean;
  processedWebhookEventId: string | null;
  entitlementGranted: boolean;
  customerVisibleOutcome: boolean;
  evidence: EvidenceEnvelope[];
}

export interface ApplicationPaymentOutcomeClientOptions {
  baseUrl: string;
  bearerToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

type ApplicationOutcomeResponse = {
  orderId?: unknown;
  orderPersisted?: unknown;
  processedWebhookEventId?: unknown;
  entitlementGranted?: unknown;
  customerVisibleOutcome?: unknown;
};

export class ApplicationPaymentOutcomeClient {
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly options: ApplicationPaymentOutcomeClientOptions) {
    const parsed = new URL(options.baseUrl);
    if (!["https:", "http:"].includes(parsed.protocol)) {
      throw new Error("Application payment outcome URL must use HTTP or HTTPS.");
    }
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  async inspect(orderId: string): Promise<ApplicationPaymentOutcomeObservation> {
    if (!validOrderId(orderId)) throw new Error("Application payment outcome order ID is invalid.");

    const response = await this.fetchImpl(
      `${this.baseUrl}/${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          ...(this.options.bearerToken
            ? { authorization: `Bearer ${this.options.bearerToken}` }
            : {}),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(this.timeoutMs),
      },
    );

    if (response.status === 404) {
      throw new Error("Application payment outcome was not found.");
    }
    if (!response.ok) {
      throw new Error(`Application payment outcome endpoint returned HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as ApplicationOutcomeResponse;
    if (
      payload.orderId !== orderId ||
      typeof payload.orderPersisted !== "boolean" ||
      typeof payload.entitlementGranted !== "boolean" ||
      typeof payload.customerVisibleOutcome !== "boolean"
    ) {
      throw new Error("Application payment outcome response was incomplete or mismatched.");
    }

    const processedWebhookEventId =
      typeof payload.processedWebhookEventId === "string"
        ? payload.processedWebhookEventId
        : null;
    const normalized = {
      orderId,
      orderPersisted: payload.orderPersisted,
      processedWebhookEventId,
      entitlementGranted: payload.entitlementGranted,
      customerVisibleOutcome: payload.customerVisibleOutcome,
    };

    return {
      ...normalized,
      evidence: [
        createEvidenceEnvelope({
          kind: "application-payment-outcome",
          source: `application:payment-outcome:${orderId}`,
          payload: normalized,
          redacted: true,
          summary: {
            orderId,
            orderPersisted: normalized.orderPersisted,
            entitlementGranted: normalized.entitlementGranted,
            customerVisibleOutcome: normalized.customerVisibleOutcome,
            processedWebhookBound: Boolean(normalized.processedWebhookEventId),
          },
        }),
      ],
    };
  }
}
