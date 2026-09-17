import { createEvidenceEnvelope, type EvidenceEnvelope } from "@relyo/kernel";

export interface SupabaseProjectSummary {
  id: string;
  ref: string;
  name: string;
  organizationId: string | null;
  region: string | null;
  status: string | null;
}

export interface SupabaseAuthObservation {
  siteUrl: string | null;
  redirectUrls: string[];
  disableSignup: boolean | null;
  emailSignupEnabled: boolean | null;
  phoneSignupEnabled: boolean | null;
  captchaEnabled: boolean | null;
}

export interface SupabaseBackupObservation {
  observed: boolean;
  backupCount: number | null;
  latestStatus: string | null;
}

export interface SupabaseProductionObservation {
  provider: "supabase";
  project: SupabaseProjectSummary;
  auth: SupabaseAuthObservation | null;
  backups: SupabaseBackupObservation;
  schemaPolicyInspection: "UNAVAILABLE_WITH_MANAGEMENT_API_OAUTH";
  evidence: EvidenceEnvelope[];
}

export interface SupabaseReadClientOptions {
  token: string;
  fetchImpl?: typeof fetch;
  apiBaseUrl?: string;
}

type ProjectApi = {
  id?: string;
  ref?: string;
  name?: string;
  organization_id?: string;
  region?: string;
  status?: string;
};

type AuthConfigApi = {
  site_url?: unknown;
  uri_allow_list?: unknown;
  disable_signup?: unknown;
  external_email_enabled?: unknown;
  external_phone_enabled?: unknown;
  security_captcha_enabled?: unknown;
};

type BackupsApi = {
  backups?: Array<{ status?: unknown; created_at?: unknown }>;
};

function normalizeProject(input: ProjectApi): SupabaseProjectSummary | null {
  const ref = typeof input.ref === "string" ? input.ref : typeof input.id === "string" ? input.id : "";
  const id = typeof input.id === "string" ? input.id : ref;
  const name = typeof input.name === "string" ? input.name : "";
  if (!ref || !id || !name) return null;
  return {
    id,
    ref,
    name,
    organizationId: typeof input.organization_id === "string" ? input.organization_id : null,
    region: typeof input.region === "string" ? input.region : null,
    status: typeof input.status === "string" ? input.status : null,
  };
}

function boolOrNull(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function authObservation(input: AuthConfigApi): SupabaseAuthObservation {
  const redirects = Array.isArray(input.uri_allow_list)
    ? input.uri_allow_list.filter((value): value is string => typeof value === "string")
    : typeof input.uri_allow_list === "string"
      ? input.uri_allow_list.split(",").map((value) => value.trim()).filter(Boolean)
      : [];
  return {
    siteUrl: typeof input.site_url === "string" ? input.site_url : null,
    redirectUrls: [...new Set(redirects)].sort(),
    disableSignup: boolOrNull(input.disable_signup),
    emailSignupEnabled: boolOrNull(input.external_email_enabled),
    phoneSignupEnabled: boolOrNull(input.external_phone_enabled),
    captchaEnabled: boolOrNull(input.security_captcha_enabled),
  };
}

export class SupabaseReadClient {
  private readonly fetchImpl: typeof fetch;
  private readonly apiBaseUrl: string;

  constructor(private readonly options: SupabaseReadClientOptions) {
    if (!options.token.trim()) throw new Error("A Supabase credential is required.");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.apiBaseUrl = options.apiBaseUrl ?? "https://api.supabase.com";
  }

  async listProjects(): Promise<SupabaseProjectSummary[]> {
    const payload = await this.getJson<ProjectApi[]>("/v1/projects");
    return payload
      .map(normalizeProject)
      .filter((project): project is SupabaseProjectSummary => Boolean(project))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async inspectProduction(input: { projectRef: string }): Promise<SupabaseProductionObservation> {
    const projects = await this.listProjects();
    const project = projects.find((item) => item.ref === input.projectRef || item.id === input.projectRef);
    if (!project) throw new Error("Supabase project was not found or is not accessible to this connection.");

    const authRaw = await this.getOptionalJson<AuthConfigApi>(`/v1/projects/${encodeURIComponent(project.ref)}/config/auth`);
    const backupsRaw = await this.getOptionalJson<BackupsApi>(`/v1/projects/${encodeURIComponent(project.ref)}/database/backups`);
    const auth = authRaw ? authObservation(authRaw) : null;
    const backupsList = backupsRaw?.backups ?? [];
    const backups: SupabaseBackupObservation = backupsRaw
      ? {
          observed: true,
          backupCount: backupsList.length,
          latestStatus: typeof backupsList[0]?.status === "string" ? backupsList[0].status : null,
        }
      : { observed: false, backupCount: null, latestStatus: null };

    const payload = {
      project,
      auth,
      backups,
      schemaPolicyInspection: "UNAVAILABLE_WITH_MANAGEMENT_API_OAUTH" as const,
    };
    const evidence = [
      createEvidenceEnvelope({
        kind: "supabase-production-observation",
        source: `supabase:project:${project.ref}`,
        payload,
        redacted: true,
        summary: {
          projectRef: project.ref,
          projectHealthy: project.status === "ACTIVE_HEALTHY",
          authConfigObserved: Boolean(auth),
          backupMetadataObserved: backups.observed,
          backupCount: backups.backupCount,
        },
      }),
    ];

    return { provider: "supabase", ...payload, evidence };
  }

  private async getOptionalJson<T>(path: string): Promise<T | null> {
    const response = await this.request(path);
    if (response.status === 403 || response.status === 404) {
      await response.body?.cancel();
      return null;
    }
    if (!response.ok) throw new Error(`Supabase Management API returned HTTP ${response.status}.`);
    return await response.json() as T;
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await this.request(path);
    if (response.status === 401 || response.status === 403) {
      throw new Error("Supabase credential is invalid or lacks access to this resource.");
    }
    if (response.status === 404) throw new Error("Supabase resource was not found.");
    if (!response.ok) throw new Error(`Supabase Management API returned HTTP ${response.status}.`);
    return await response.json() as T;
  }

  private async request(path: string): Promise<Response> {
    return await this.fetchImpl(`${this.apiBaseUrl}${path}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${this.options.token}`,
        accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  }
}
