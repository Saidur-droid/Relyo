import { describe, expect, it } from "vitest";
import type { SupabaseProductionObservation } from "@relyo/adapter-supabase";
import type { DiscoveryResult } from "@relyo/discovery";
import { buildSupabaseAugmentedR1Report } from "../src/supabase-augmented-r1.js";

const discovery = {
  url: {
    inputUrl: "https://app.example.com/",
    finalUrl: "https://app.example.com/",
    host: "app.example.com",
    status: 200,
    reachable: true,
    https: true,
    redirectCount: 0,
    latencyMs: 50,
    headers: {
      strictTransportSecurity: true,
      contentSecurityPolicy: true,
      xContentTypeOptions: true,
      referrerPolicy: true,
      permissionsPolicy: true,
    },
    evidence: [{ id: "ev_url", kind: "http", sha256: "a".repeat(64), collectedAt: "2026-09-20T00:00:00Z", source: "https://app.example.com", redacted: true }],
    findings: [],
  },
  repo: {
    repository: "owner/repo",
    htmlUrl: "https://github.com/owner/repo",
    defaultBranch: "main",
    commitSha: "b".repeat(40),
    private: false,
    archived: false,
    packageManager: "pnpm",
    scripts: ["build", "test"],
    technologies: [],
    rootFiles: ["package.json", "pnpm-lock.yaml"],
    envTemplateVariables: [],
    evidence: [{ id: "ev_repo", kind: "repo", sha256: "b".repeat(64), collectedAt: "2026-09-20T00:00:00Z", source: "github", redacted: true }],
    findings: [],
  },
  graph: {
    nodes: [],
    edges: [],
    unknowns: [
      "Production environment variable presence requires provider connection.",
      "Rollback readiness requires deployment-provider evidence.",
    ],
  },
  findings: [],
  evidence: [
    { id: "ev_url", kind: "http", sha256: "a".repeat(64), collectedAt: "2026-09-20T00:00:00Z", source: "https://app.example.com", redacted: true },
    { id: "ev_repo", kind: "repo", sha256: "b".repeat(64), collectedAt: "2026-09-20T00:00:00Z", source: "github", redacted: true },
  ],
} as DiscoveryResult;

const supabase = {
  provider: "supabase",
  project: { id: "ref", ref: "ref", name: "prod", organizationId: "org", region: "ap-southeast-1", status: "ACTIVE_HEALTHY" },
  auth: {
    siteUrl: "https://app.example.com",
    redirectUrls: ["https://app.example.com/auth/callback"],
    disableSignup: false,
    emailSignupEnabled: true,
    phoneSignupEnabled: false,
    captchaEnabled: true,
  },
  backups: { observed: true, backupCount: 1, latestStatus: "COMPLETED" },
  rls: {
    observed: true,
    tables: [{ schema: "public", table: "profiles", rlsEnabled: true, policyCount: 1 }],
    exposedTableCount: 1,
    tablesWithoutRls: 0,
  },
  evidence: [{ id: "ev_supabase", kind: "supabase", sha256: "c".repeat(64), collectedAt: "2026-09-20T00:00:00Z", source: "supabase", redacted: true }],
} as SupabaseProductionObservation;

describe("Supabase augmented provider-neutral R1", () => {
  it("adds Supabase evidence without pretending Supabase proves deployment identity or rollback", () => {
    const report = buildSupabaseAugmentedR1Report({ discovery, provider: supabase });

    expect(report.passport.environment.provider).toBe("public-web+supabase");
    expect(report.passport.evidence.map((item) => item.id).sort()).toEqual(["ev_repo", "ev_supabase", "ev_url"]);
    expect(report.achievedAssurance).toBe("R0");
    expect(report.blockers.some((item) => /deployment provider|rollback/i.test(item))).toBe(true);
  });
});
