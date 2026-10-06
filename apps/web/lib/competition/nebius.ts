import {
  createEvidenceEnvelope,
  type EvidenceEnvelope,
} from "@relyo/kernel";

export const DEFAULT_NEBIUS_TOKEN_FACTORY_BASE_URL =
  "https://api.tokenfactory.nebius.com/v1";
export const DEFAULT_NVIDIA_NEMOTRON_MODEL =
  "nvidia/Nemotron-3_5-Lightning";
export interface NebiusEvidenceSummary {
  kind: string;
  source: string;
  summary?: Record<string, string | number | boolean | null>;
}

export interface NebiusReasoningInput {
  release?: {
    repository?: string;
    commitSha?: string;
    environment?: string;
  };
  candidateContractIds: string[];
  evidenceSummaries: NebiusEvidenceSummary[];
  question: string;
}

export interface NebiusReasoningObservation {
  provider: "nebius-token-factory";
  model: string;
  selectedContractIds: string[];
  diagnosis: string;
  remediationPlan: string[];
  riskNotes: string[];
  confidence: number | null;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
  latencyMs: number;
  evidence: EvidenceEnvelope[];
}

export interface NebiusReasoningClientOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

type ChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

type ModelAnswer = {
  selectedContractIds?: unknown;
  diagnosis?: unknown;
  remediationPlan?: unknown;
  riskNotes?: unknown;
  confidence?: unknown;
};

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function cleanJsonText(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }
  return trimmed;
}

function stringArray(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((item) => item.slice(0, maxLength));
}

function parseAnswer(
  content: string,
  allowedContractIds: string[],
): Omit<NebiusReasoningObservation, "provider" | "model" | "usage" | "latencyMs" | "evidence"> {
  let parsed: ModelAnswer;
  try {
    parsed = JSON.parse(cleanJsonText(content)) as ModelAnswer;
  } catch {
    throw new Error("Nebius reasoning response was not valid JSON.");
  }

  const allowed = new Set(allowedContractIds);
  const selectedContractIds = stringArray(parsed.selectedContractIds, 32, 160)
    .filter((id) => allowed.has(id));
  const diagnosis =
    typeof parsed.diagnosis === "string" && parsed.diagnosis.trim()
      ? parsed.diagnosis.trim().slice(0, 4_000)
      : "No diagnosis was returned.";
  const remediationPlan = stringArray(parsed.remediationPlan, 12, 800);
  const riskNotes = stringArray(parsed.riskNotes, 12, 800);
  const confidence =
    typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
      ? Math.max(0, Math.min(1, parsed.confidence))
      : null;

  return {
    selectedContractIds,
    diagnosis,
    remediationPlan,
    riskNotes,
    confidence,
  };
}

function validateInput(input: NebiusReasoningInput): void {
  if (!input.question.trim()) throw new Error("A reasoning question is required.");
  if (input.question.length > 2_000) throw new Error("Reasoning question is too long.");
  if (input.candidateContractIds.length === 0) {
    throw new Error("At least one candidate Proof Contract is required.");
  }
  if (input.candidateContractIds.length > 32) {
    throw new Error("Too many candidate Proof Contracts.");
  }
  if (input.evidenceSummaries.length > 64) {
    throw new Error("Too many evidence summaries.");
  }
}

export class NebiusReasoningClient {
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(private readonly options: NebiusReasoningClientOptions) {
    if (!options.apiKey.trim()) throw new Error("A Nebius Token Factory API key is required.");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = normalizeBaseUrl(
      options.baseUrl?.trim() || DEFAULT_NEBIUS_TOKEN_FACTORY_BASE_URL,
    );
    this.model = options.model?.trim() || DEFAULT_NVIDIA_NEMOTRON_MODEL;
    this.timeoutMs = options.timeoutMs ?? 20_000;
  }

  async reasonAboutProof(
    input: NebiusReasoningInput,
  ): Promise<NebiusReasoningObservation> {
    validateInput(input);

    const startedAt = Date.now();
    const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.options.apiKey}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You are Relyo's reasoning layer. Reason, prioritize and diagnose, but never claim PASS, VERIFIED or final truth. Deterministic Proof Contracts and evidence decide final status. Return JSON only with keys selectedContractIds, diagnosis, remediationPlan, riskNotes, confidence. selectedContractIds must only contain IDs supplied by the caller.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Nebius Token Factory credential is invalid or unauthorized.");
    }
    if (!response.ok) {
      throw new Error(`Nebius Token Factory returned HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as ChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Nebius Token Factory returned no reasoning content.");

    const answer = parseAnswer(content, input.candidateContractIds);
    const latencyMs = Date.now() - startedAt;
    const usage = {
      inputTokens:
        typeof payload.usage?.prompt_tokens === "number"
          ? payload.usage.prompt_tokens
          : null,
      outputTokens:
        typeof payload.usage?.completion_tokens === "number"
          ? payload.usage.completion_tokens
          : null,
      totalTokens:
        typeof payload.usage?.total_tokens === "number"
          ? payload.usage.total_tokens
          : null,
    };

    const evidence = [
      createEvidenceEnvelope({
        kind: "nebius-nemotron-reasoning",
        source: `nebius-token-factory:model:${this.model}`,
        payload: {
          model: this.model,
          ...answer,
          usage,
          latencyMs,
        },
        redacted: true,
        summary: {
          model: this.model,
          selectedContractCount: answer.selectedContractIds.length,
          remediationStepCount: answer.remediationPlan.length,
          latencyMs,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
        },
      }),
    ];

    return {
      provider: "nebius-token-factory",
      model: this.model,
      ...answer,
      usage,
      latencyMs,
      evidence,
    };
  }
}
