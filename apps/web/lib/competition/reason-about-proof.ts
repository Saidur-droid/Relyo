import type { ContractResult, EvidenceEnvelope } from "@relyo/kernel";
import { NebiusReasoningClient, type NebiusReasoningObservation } from "./nebius";

export interface ReasonAboutProofInput {
  result: ContractResult;
  evidence: EvidenceEnvelope[];
  release?: {
    repository?: string;
    commitSha?: string;
    environment?: string;
  };
}

export async function reasonAboutProofResult(
  input: ReasonAboutProofInput,
): Promise<NebiusReasoningObservation> {
  const apiKey = process.env.NEBIUS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Nebius competition reasoning is not configured.");
  }

  const client = new NebiusReasoningClient({
    apiKey,
    ...(process.env.NEBIUS_MODEL?.trim()
      ? { model: process.env.NEBIUS_MODEL.trim() }
      : {}),
    ...(process.env.NEBIUS_BASE_URL?.trim()
      ? { baseUrl: process.env.NEBIUS_BASE_URL.trim() }
      : {}),
  });

  const failedAssertions = input.result.assertions
    .filter((item) => item.status !== "PASS")
    .map((item) => ({
      id: item.id,
      status: item.status,
      description: item.description,
      message: item.message ?? null,
    }));

  return client.reasonAboutProof({
    ...(input.release ? { release: input.release } : {}),
    candidateContractIds: [input.result.contractId],
    evidenceSummaries: input.evidence.map((item) => ({
      kind: item.kind,
      source: item.source,
      ...(item.summary ? { summary: item.summary } : {}),
    })),
    question: [
      "Relyo's deterministic verifier has already evaluated this Proof Contract.",
      "Explain the most likely cause of the non-passing assertions and propose the safest remediation/re-verification plan.",
      "Do not change or override the deterministic status.",
      JSON.stringify({
        contractId: input.result.contractId,
        status: input.result.status,
        failedAssertions,
      }),
    ].join("\n"),
  });
}
