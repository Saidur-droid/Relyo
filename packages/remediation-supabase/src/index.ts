import type { RemediationAction, RemediationAdapter } from "@relyo/remediation";

export interface SupabaseAuthConfig {
  site_url?: string;
  uri_allow_list?: string;
  [key: string]: unknown;
}

export interface SupabaseRemediationOptions {
  token: string;
  projectRef: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
}

async function json<T>(response: Response, operation: string): Promise<T> {
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase remediation ${operation} failed with HTTP ${response.status}: ${body.slice(0, 500)}`);
  }
  return JSON.parse(body) as T;
}

function desired(action: RemediationAction): { site_url: string; uri_allow_list?: string } {
  const siteUrl = String(action.desiredState.site_url ?? "").trim();
  if (!/^https:\/\//i.test(siteUrl)) throw new Error("Supabase Auth site_url must use HTTPS.");
  const allow = action.desiredState.uri_allow_list;
  return {
    site_url: siteUrl,
    ...(typeof allow === "string" && allow.trim() ? { uri_allow_list: allow.trim() } : {}),
  };
}

export class SupabaseAuthRemediationAdapter implements RemediationAdapter {
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;

  constructor(private readonly options: SupabaseRemediationOptions) {
    if (!options.token.trim()) throw new Error("Supabase remediation token is required.");
    if (!/^[a-z0-9]+$/i.test(options.projectRef)) throw new Error("Invalid Supabase project ref.");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = (options.apiBaseUrl ?? "https://api.supabase.com").replace(/\/$/, "");
  }

  private headers() {
    return {
      authorization: `Bearer ${this.options.token}`,
      "content-type": "application/json",
    };
  }

  async capture(action: RemediationAction): Promise<SupabaseAuthConfig> {
    if (action.kind !== "supabase.auth.redirect.update") throw new Error("Unsupported Supabase remediation action.");
    return await json<SupabaseAuthConfig>(
      await this.fetchImpl(`${this.baseUrl}/v1/projects/${this.options.projectRef}/config/auth`, {
        headers: this.headers(),
      }),
      "capture auth config",
    );
  }

  async apply(action: RemediationAction): Promise<void> {
    if (action.kind !== "supabase.auth.redirect.update") throw new Error("Unsupported Supabase remediation action.");
    await json<unknown>(
      await this.fetchImpl(`${this.baseUrl}/v1/projects/${this.options.projectRef}/config/auth`, {
        method: "PATCH",
        headers: this.headers(),
        body: JSON.stringify(desired(action)),
      }),
      "update auth config",
    );
  }

  async verify(action: RemediationAction): Promise<"PASS" | "FAIL" | "UNKNOWN"> {
    const expected = desired(action);
    const observed = await json<SupabaseAuthConfig>(
      await this.fetchImpl(`${this.baseUrl}/v1/projects/${this.options.projectRef}/config/auth`, {
        headers: this.headers(),
      }),
      "verify auth config",
    );
    if (!observed.site_url) return "UNKNOWN";
    if (observed.site_url !== expected.site_url) return "FAIL";
    if (expected.uri_allow_list !== undefined && observed.uri_allow_list !== expected.uri_allow_list) return "FAIL";
    return "PASS";
  }

  async rollback(action: RemediationAction, checkpoint: unknown): Promise<void> {
    if (action.kind !== "supabase.auth.redirect.update") throw new Error("Unsupported Supabase remediation action.");
    const prior = checkpoint as SupabaseAuthConfig;
    if (typeof prior.site_url !== "string") throw new Error("Rollback checkpoint is missing site_url.");
    const patch = {
      site_url: prior.site_url,
      ...(typeof prior.uri_allow_list === "string" ? { uri_allow_list: prior.uri_allow_list } : {}),
    };
    await json<unknown>(
      await this.fetchImpl(`${this.baseUrl}/v1/projects/${this.options.projectRef}/config/auth`, {
        method: "PATCH",
        headers: this.headers(),
        body: JSON.stringify(patch),
      }),
      "rollback auth config",
    );
  }
}
