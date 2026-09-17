import type { SupabaseProductionObservation } from "@relyo/adapter-supabase";
import type { DiscoveryResult } from "@relyo/discovery";
import type { Assertion, ProofContract } from "@relyo/kernel";

function evidenceRefs(provider: SupabaseProductionObservation): string[] {
  return provider.evidence.map((item) => item.id);
}

function projectHealthContract(provider: SupabaseProductionObservation): ProofContract {
  const status = provider.project.status;
  return {
    id: "supabase.project-health",
    version: "1",
    title: "Supabase production project health",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [{
      id: "supabase.project-active-healthy",
      description: "Supabase reports the bound production project as ACTIVE_HEALTHY",
      status: status ? (status === "ACTIVE_HEALTHY" ? "PASS" : "FAIL") : "UNKNOWN",
      evidenceRefs: evidenceRefs(provider),
      message: status ? `Supabase project state is ${status}.` : "Supabase project health state was not observed.",
    }],
  };
}

function authContract(discovery: DiscoveryResult, provider: SupabaseProductionObservation): ProofContract {
  const expectedUrl = discovery.url?.finalUrl;
  let redirectStatus: Assertion["status"] = "UNKNOWN";
  let redirectMessage = "Supabase Auth site URL was not available for comparison.";
  if (expectedUrl && provider.auth?.siteUrl) {
    try {
      const expected = new URL(expectedUrl).origin;
      const actual = new URL(provider.auth.siteUrl).origin;
      redirectStatus = expected === actual ? "PASS" : "FAIL";
      redirectMessage = redirectStatus === "PASS"
        ? `Supabase Auth site URL matches ${expected}.`
        : `Supabase Auth site URL ${actual} does not match checked application origin ${expected}.`;
    } catch {
      redirectStatus = "UNKNOWN";
      redirectMessage = "Supabase Auth site URL could not be normalized safely.";
    }
  }

  return {
    id: "supabase.auth-config",
    version: "1",
    title: "Supabase Auth production configuration",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [
      {
        id: "supabase.auth-observed",
        description: "Supabase Auth configuration is observable through the connected provider",
        status: provider.auth ? "PASS" : "UNKNOWN",
        evidenceRefs: evidenceRefs(provider),
        message: provider.auth
          ? "Auth configuration metadata was observed without retaining provider secrets."
          : "Auth configuration was inaccessible; Relyo will not infer a pass.",
      },
      {
        id: "supabase.auth-site-url",
        description: "Supabase Auth site URL matches the checked production application",
        status: redirectStatus,
        evidenceRefs: evidenceRefs(provider),
        message: redirectMessage,
      },
    ],
  };
}

function rlsContract(provider: SupabaseProductionObservation): ProofContract {
  const assertion: Assertion = !provider.rls.observed
    ? {
        id: "supabase.rls-enabled",
        description: "All observed public/storage tables have Row Level Security enabled",
        status: "UNKNOWN",
        evidenceRefs: evidenceRefs(provider),
        message: "Read-only schema policy inspection was inaccessible; RLS state remains UNKNOWN.",
      }
    : provider.rls.exposedTableCount === 0
      ? {
          id: "supabase.rls-enabled",
          description: "All observed public/storage tables have Row Level Security enabled",
          status: "UNKNOWN",
          evidenceRefs: evidenceRefs(provider),
          message: "No public/storage tables were returned by the read-only schema inspection.",
        }
      : {
          id: "supabase.rls-enabled",
          description: "All observed public/storage tables have Row Level Security enabled",
          status: provider.rls.tablesWithoutRls === 0 ? "PASS" : "FAIL",
          evidenceRefs: evidenceRefs(provider),
          message: provider.rls.tablesWithoutRls === 0
            ? `${provider.rls.exposedTableCount} table(s) were observed and all have RLS enabled.`
            : `${provider.rls.tablesWithoutRls} of ${provider.rls.exposedTableCount} observed table(s) do not have RLS enabled.`,
        };

  return {
    id: "supabase.rls-policy",
    version: "1",
    title: "Supabase RLS baseline",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [assertion],
  };
}

function backupContract(provider: SupabaseProductionObservation): ProofContract {
  return {
    id: "supabase.backup-readiness",
    version: "1",
    title: "Supabase backup observability",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [{
      id: "supabase.backup-present",
      description: "At least one database backup is observable for the bound production project",
      status: !provider.backups.observed
        ? "UNKNOWN"
        : (provider.backups.backupCount ?? 0) > 0
          ? "PASS"
          : "FAIL",
      evidenceRefs: evidenceRefs(provider),
      message: !provider.backups.observed
        ? "Backup metadata was inaccessible; backup readiness remains UNKNOWN."
        : `${provider.backups.backupCount ?? 0} backup(s) were observed.`,
    }],
  };
}

function browserSecretContract(discovery: DiscoveryResult, provider: SupabaseProductionObservation): ProofContract {
  const variables = discovery.repo?.envTemplateVariables;
  const risky = variables?.filter((key) =>
    /^(NEXT_PUBLIC_|VITE_|PUBLIC_).*(SERVICE_ROLE|SUPABASE_SECRET|SECRET_KEY)/i.test(key),
  ) ?? [];

  return {
    id: "supabase.browser-secret-exposure",
    version: "1",
    title: "Browser-visible Supabase secret baseline",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [{
      id: "supabase.no-public-secret-env",
      description: "Repository environment declarations do not expose service-role or secret Supabase credentials to browser-prefixed variables",
      status: discovery.repo ? (risky.length === 0 ? "PASS" : "FAIL") : "UNKNOWN",
      evidenceRefs: [
        ...(discovery.repo?.evidence.map((item) => item.id) ?? []),
        ...evidenceRefs(provider),
      ],
      message: !discovery.repo
        ? "No repository evidence was available to inspect browser-prefixed environment declarations."
        : risky.length === 0
          ? "No browser-prefixed service-role or secret Supabase environment declarations were observed."
          : `Potential browser secret exposure declarations observed: ${risky.join(", ")}.`,
    }],
  };
}

export function buildSupabaseR1Contracts(input: {
  discovery: DiscoveryResult;
  provider: SupabaseProductionObservation;
}): ProofContract[] {
  return [
    projectHealthContract(input.provider),
    authContract(input.discovery, input.provider),
    rlsContract(input.provider),
    backupContract(input.provider),
    browserSecretContract(input.discovery, input.provider),
  ];
}
