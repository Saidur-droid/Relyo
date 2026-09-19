import type { Passport } from "@relyo/kernel";

export type GitHubCheckConclusion = "success" | "failure" | "neutral";

export interface GitHubCheckOutput {
  title: string;
  summary: string;
  text?: string;
}

export interface GitHubCheckRequest {
  owner: string;
  repo: string;
  headSha: string;
  name?: string;
  detailsUrl?: string;
  externalId?: string;
  passport: Passport;
}

export interface GitHubCheckResponse {
  id: number;
  htmlUrl?: string;
  conclusion: GitHubCheckConclusion;
}

export interface GitHubCheckClientOptions {
  token: string;
  fetchImpl?: typeof fetch;
  apiBaseUrl?: string;
}

function conclusion(passport: Passport): GitHubCheckConclusion {
  if (passport.assurance === passport.targetAssurance) return "success";
  if (passport.results.some((result) => result.status === "FAIL")) return "failure";
  return "neutral";
}

function summarize(passport: Passport): GitHubCheckOutput {
  const failed = passport.results.filter((result) => result.status === "FAIL");
  const unknown = passport.results.filter((result) => result.status === "UNKNOWN");
  const lines = passport.results.map((result) => `- ${result.status}: ${result.contractId}@${result.contractVersion}`);
  return {
    title: `Relyo ${passport.assurance} — ${passport.assurance === passport.targetAssurance ? "VERIFIED" : "NOT VERIFIED"}`,
    summary: `Target ${passport.targetAssurance}; achieved ${passport.assurance}. ${failed.length} failed contract(s), ${unknown.length} unknown contract(s). Evidence is bound to the exact release and environment.`,
    text: lines.join("\n"),
  };
}

export class GitHubCheckClient {
  private readonly fetchImpl: typeof fetch;
  private readonly apiBaseUrl: string;

  constructor(private readonly options: GitHubCheckClientOptions) {
    if (!options.token.trim()) throw new Error("GitHub token is required.");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.apiBaseUrl = options.apiBaseUrl ?? "https://api.github.com";
  }

  async publish(input: GitHubCheckRequest): Promise<GitHubCheckResponse> {
    const checkConclusion = conclusion(input.passport);
    const output = summarize(input.passport);
    const response = await this.fetchImpl(
      `${this.apiBaseUrl}/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/check-runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options.token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          name: input.name ?? "Relyo Production Proof",
          head_sha: input.headSha,
          status: "completed",
          conclusion: checkConclusion,
          completed_at: new Date().toISOString(),
          ...(input.detailsUrl ? { details_url: input.detailsUrl } : {}),
          ...(input.externalId ? { external_id: input.externalId } : {}),
          output,
        }),
      },
    );
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`GitHub Checks API failed with HTTP ${response.status}: ${message.slice(0, 500)}`);
    }
    const payload = await response.json() as { id: number; html_url?: string };
    return {
      id: payload.id,
      ...(payload.html_url ? { htmlUrl: payload.html_url } : {}),
      conclusion: checkConclusion,
    };
  }
}

export function githubCheckConclusion(passport: Passport): GitHubCheckConclusion {
  return conclusion(passport);
}
