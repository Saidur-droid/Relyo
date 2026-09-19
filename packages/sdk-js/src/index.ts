export interface RelyoClientOptions {
  baseUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
}

export interface CreateProofRunInput {
  url?: string;
  githubRepo?: string;
  webhook?: { url: string; secret: string };
}

export interface ProofRunSummary {
  run: {
    id: string;
    state: string;
    targetAssurance: string;
    startedAt: string;
    completedAt?: string;
  };
  assurance?: string;
  blockers?: string[];
  signedPassport?: unknown;
}

export class RelyoClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly apiKey: string;

  constructor(options: RelyoClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey.trim();
    this.fetchImpl = options.fetchImpl ?? fetch;
    if (!/^https?:\/\//.test(this.baseUrl)) throw new Error("Relyo baseUrl must be an absolute HTTP(S) URL.");
    if (!this.apiKey.startsWith("rly_live_")) throw new Error("A Relyo API key is required.");
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        authorization: `Bearer ${this.apiKey}`,
        accept: "application/json",
        ...(init?.body ? { "content-type": "application/json" } : {}),
      },
    });
    if (!response.ok) {
      let message = `Relyo API request failed with HTTP ${response.status}.`;
      try {
        const payload = await response.json() as { error?: unknown };
        if (typeof payload.error === "string") message = payload.error;
      } catch {}
      throw new Error(message);
    }
    return await response.json() as T;
  }

  async createProofRun(input: CreateProofRunInput): Promise<ProofRunSummary> {
    if (!input.url?.trim() && !input.githubRepo?.trim()) throw new Error("Provide a production URL, GitHub repository, or both.");
    return await this.request<ProofRunSummary>("/api/v1/proof-runs", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async getProofRun(runId: string): Promise<ProofRunSummary> {
    if (!/^run_[A-Za-z0-9-]+$/.test(runId)) throw new Error("Invalid proof run ID.");
    return await this.request<ProofRunSummary>(`/api/v1/proof-runs/${encodeURIComponent(runId)}`);
  }
}
