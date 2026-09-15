import { lookup } from "node:dns/promises";
import { performance } from "node:perf_hooks";
import ipaddr from "ipaddr.js";
import {
  createEvidenceEnvelope,
  type EvidenceEnvelope,
  type ProductionGraph,
  type ProductionGraphEdge,
  type ProductionGraphNode,
} from "@relyo/kernel";

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  title: string;
  detail: string;
  severity: FindingSeverity;
  source: "public-url" | "github";
  deterministic: true;
}

export interface UrlObservation {
  inputUrl: string;
  finalUrl: string;
  host: string;
  status: number;
  reachable: boolean;
  https: boolean;
  redirectCount: number;
  latencyMs: number;
  headers: {
    strictTransportSecurity: boolean;
    contentSecurityPolicy: boolean;
    xContentTypeOptions: boolean;
    referrerPolicy: boolean;
    permissionsPolicy: boolean;
  };
  evidence: EvidenceEnvelope[];
  findings: Finding[];
}

export interface RepoTechnology {
  key: string;
  label: string;
  category: "framework" | "database" | "auth" | "payment" | "email" | "platform" | "other";
}

export interface RepoObservation {
  repository: string;
  htmlUrl: string;
  defaultBranch: string;
  commitSha: string;
  private: boolean;
  archived: boolean;
  packageManager: "pnpm" | "npm" | "yarn" | "bun" | "unknown";
  scripts: string[];
  technologies: RepoTechnology[];
  rootFiles: string[];
  envTemplateVariables: string[];
  evidence: EvidenceEnvelope[];
  findings: Finding[];
}

export interface DiscoveryResult {
  url?: UrlObservation;
  repo?: RepoObservation;
  graph: ProductionGraph;
  findings: Finding[];
  evidence: EvidenceEnvelope[];
}

const BLOCKED_HOST_SUFFIXES = [".local", ".internal", ".localhost", ".home", ".lan"];

export function normalizeUserUrl(input: string): URL {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("A URL is required.");

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withScheme);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported.");
  }
  if (url.username || url.password) {
    throw new Error("URLs containing credentials are not allowed.");
  }
  if (url.port && !["80", "443"].includes(url.port)) {
    throw new Error("Only standard web ports 80 and 443 are supported in the free check.");
  }
  return url;
}

export function isPublicIpAddress(address: string): boolean {
  try {
    // process() normalizes IPv4-mapped IPv6 addresses before classification.
    // Both IPv4 and IPv6 address objects expose range(), so no unsafe union cast is needed.
    return ipaddr.process(address).range() === "unicast";
  } catch {
    return false;
  }
}

export async function assertSafePublicUrl(url: URL): Promise<void> {
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "localhost.localdomain" ||
    BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))
  ) {
    throw new Error("Local or private hostnames are not allowed.");
  }

  if (ipaddr.isValid(host)) {
    if (!isPublicIpAddress(host)) throw new Error("Private or reserved IP addresses are not allowed.");
    return;
  }

  let addresses: { address: string; family: number }[];
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new Error("The hostname could not be resolved.");
  }

  if (addresses.length === 0) throw new Error("The hostname did not resolve to an IP address.");
  if (addresses.some((entry) => !isPublicIpAddress(entry.address))) {
    throw new Error("The hostname resolves to a private or reserved network address.");
  }
}

function headerPresence(headers: Headers) {
  return {
    strictTransportSecurity: headers.has("strict-transport-security"),
    contentSecurityPolicy: headers.has("content-security-policy"),
    xContentTypeOptions: headers.has("x-content-type-options"),
    referrerPolicy: headers.has("referrer-policy"),
    permissionsPolicy: headers.has("permissions-policy"),
  };
}

function findingsForUrl(observation: Omit<UrlObservation, "findings" | "evidence">): Finding[] {
  const findings: Finding[] = [];

  if (!observation.https) {
    findings.push({
      id: "url.insecure-http",
      title: "Production URL is not using HTTPS",
      detail: "Customer traffic is reaching the application over plain HTTP.",
      severity: "high",
      source: "public-url",
      deterministic: true,
    });
  }

  if (observation.status >= 500) {
    findings.push({
      id: "url.server-error",
      title: `Production returned HTTP ${observation.status}`,
      detail: "The public entry point returned a server error during this check.",
      severity: "critical",
      source: "public-url",
      deterministic: true,
    });
  } else if (observation.status >= 400) {
    findings.push({
      id: "url.client-error",
      title: `Production returned HTTP ${observation.status}`,
      detail: "The public entry point is reachable but did not return a successful page response.",
      severity: "medium",
      source: "public-url",
      deterministic: true,
    });
  }

  if (observation.https && !observation.headers.strictTransportSecurity) {
    findings.push({
      id: "url.hsts-missing",
      title: "HSTS header is missing",
      detail: "The HTTPS response does not advertise Strict-Transport-Security.",
      severity: "medium",
      source: "public-url",
      deterministic: true,
    });
  }

  if (!observation.headers.contentSecurityPolicy) {
    findings.push({
      id: "url.csp-missing",
      title: "Content Security Policy is not advertised",
      detail: "No Content-Security-Policy header was observed on the checked response.",
      severity: "low",
      source: "public-url",
      deterministic: true,
    });
  }

  if (!observation.headers.xContentTypeOptions) {
    findings.push({
      id: "url.nosniff-missing",
      title: "X-Content-Type-Options is missing",
      detail: "The response does not explicitly disable MIME type sniffing.",
      severity: "low",
      source: "public-url",
      deterministic: true,
    });
  }

  return findings;
}

export async function inspectPublicUrl(input: string): Promise<UrlObservation> {
  let current = normalizeUserUrl(input);
  const inputUrl = current.toString();
  const started = performance.now();
  let redirectCount = 0;
  let response: Response | undefined;

  while (redirectCount <= 5) {
    await assertSafePublicUrl(current);
    response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      headers: {
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
        "user-agent": "Relyo-Launch-Check/0.1 (+https://relyo.dev)",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) break;
      if (redirectCount === 5) throw new Error("Too many redirects.");
      current = new URL(location, current);
      redirectCount += 1;
      continue;
    }
    break;
  }

  if (!response) throw new Error("No HTTP response was received.");
  const headers = headerPresence(response.headers);
  const base = {
    inputUrl,
    finalUrl: current.toString(),
    host: current.hostname,
    status: response.status,
    reachable: true,
    https: current.protocol === "https:",
    redirectCount,
    latencyMs: Math.round(performance.now() - started),
    headers,
  };
  await response.body?.cancel();

  const evidence = createEvidenceEnvelope({
    kind: "public-http-observation",
    source: current.origin,
    payload: {
      finalUrl: base.finalUrl,
      status: base.status,
      headers,
      redirectCount,
    },
    summary: {
      status: base.status,
      https: base.https,
      redirects: redirectCount,
    },
  });

  return {
    ...base,
    evidence: [evidence],
    findings: findingsForUrl(base),
  };
}

function parseGitHubRepository(input: string): { owner: string; repo: string } {
  const trimmed = input.trim().replace(/\.git$/, "");
  const shorthand = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (shorthand) return { owner: shorthand[1]!, repo: shorthand[2]! };

  const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  if (url.hostname.toLowerCase() !== "github.com") throw new Error("Only GitHub repositories are supported in v0.");
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) throw new Error("A GitHub repository URL must include owner and repository.");
  return { owner: parts[0]!, repo: parts[1]! };
}

async function githubJson<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "Relyo-Repo-Discovery/0.1",
      "x-github-api-version": "2022-11-28",
    },
  });

  if (response.status === 404) throw new Error("Repository not found or not publicly accessible.");
  if (response.status === 403) throw new Error("GitHub API rate limit reached. Connect GitHub for deeper scanning.");
  if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}.`);
  return (await response.json()) as T;
}

type GitHubRepoApi = {
  full_name: string;
  html_url: string;
  default_branch: string;
  private: boolean;
  archived: boolean;
};

type GitHubCommitApi = { sha: string };
type GitHubContentItem = { name: string; type: "file" | "dir"; path: string };
type GitHubFileApi = { content?: string; encoding?: string };

async function githubFileText(owner: string, repo: string, path: string, ref: string): Promise<string | null> {
  try {
    const data = await githubJson<GitHubFileApi>(`/repos/${owner}/${repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(ref)}`);
    if (!data.content || data.encoding !== "base64") return null;
    return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
  } catch {
    return null;
  }
}

function detectPackageManager(files: string[]): RepoObservation["packageManager"] {
  if (files.includes("pnpm-lock.yaml")) return "pnpm";
  if (files.includes("bun.lock") || files.includes("bun.lockb")) return "bun";
  if (files.includes("yarn.lock")) return "yarn";
  if (files.includes("package-lock.json")) return "npm";
  return "unknown";
}

function detectTechnologies(packageJson: Record<string, unknown> | null, files: string[]): RepoTechnology[] {
  const technologies = new Map<string, RepoTechnology>();
  const dependencies = {
    ...((packageJson?.dependencies as Record<string, string> | undefined) ?? {}),
    ...((packageJson?.devDependencies as Record<string, string> | undefined) ?? {}),
  };

  const add = (technology: RepoTechnology) => technologies.set(technology.key, technology);
  if ("next" in dependencies) add({ key: "nextjs", label: "Next.js", category: "framework" });
  if ("@supabase/supabase-js" in dependencies) add({ key: "supabase", label: "Supabase", category: "database" });
  if ("stripe" in dependencies || "@stripe/stripe-js" in dependencies) add({ key: "stripe", label: "Stripe", category: "payment" });
  if ("resend" in dependencies) add({ key: "resend", label: "Resend", category: "email" });
  if ("next-auth" in dependencies || "@auth/core" in dependencies || "@auth/nextjs" in dependencies) add({ key: "authjs", label: "Auth.js", category: "auth" });
  if ("@clerk/nextjs" in dependencies || "@clerk/clerk-js" in dependencies) add({ key: "clerk", label: "Clerk", category: "auth" });
  if ("@vercel/functions" in dependencies || files.includes("vercel.json")) add({ key: "vercel", label: "Vercel", category: "platform" });
  if (files.includes("wrangler.toml") || files.includes("wrangler.jsonc")) add({ key: "cloudflare", label: "Cloudflare", category: "platform" });
  if (files.includes("supabase")) add({ key: "supabase", label: "Supabase", category: "database" });
  return [...technologies.values()];
}

function parseEnvTemplate(text: string | null): string[] {
  if (!text) return [];
  return Array.from(
    new Set(
      text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^[A-Z][A-Z0-9_]*\s*=/.test(line))
        .map((line) => line.split("=")[0]!.trim()),
    ),
  ).sort();
}

export async function inspectGitHubRepository(input: string): Promise<RepoObservation> {
  const { owner, repo } = parseGitHubRepository(input);
  const metadata = await githubJson<GitHubRepoApi>(`/repos/${owner}/${repo}`);
  const branch = metadata.default_branch;
  const commit = await githubJson<GitHubCommitApi>(`/repos/${owner}/${repo}/commits/${encodeURIComponent(branch)}`);
  const root = await githubJson<GitHubContentItem[]>(`/repos/${owner}/${repo}/contents?ref=${encodeURIComponent(commit.sha)}`);
  const rootFiles = root.map((item) => item.name).sort();

  const packageText = rootFiles.includes("package.json")
    ? await githubFileText(owner, repo, "package.json", commit.sha)
    : null;
  let packageJson: Record<string, unknown> | null = null;
  if (packageText) {
    try {
      packageJson = JSON.parse(packageText) as Record<string, unknown>;
    } catch {
      packageJson = null;
    }
  }

  const envFile = [".env.example", ".env.sample", ".env.template"].find((name) => rootFiles.includes(name));
  const envText = envFile ? await githubFileText(owner, repo, envFile, commit.sha) : null;
  const scripts = Object.keys((packageJson?.scripts as Record<string, string> | undefined) ?? {}).sort();
  const packageManager = detectPackageManager(rootFiles);
  const technologies = detectTechnologies(packageJson, rootFiles);
  const envTemplateVariables = parseEnvTemplate(envText);

  const findings: Finding[] = [];
  if (!scripts.includes("build")) {
    findings.push({
      id: "repo.build-script-missing",
      title: "No build script detected",
      detail: "The root package.json does not expose a build script Relyo can use as a release-readiness signal.",
      severity: "medium",
      source: "github",
      deterministic: true,
    });
  }
  if (!scripts.includes("test")) {
    findings.push({
      id: "repo.test-script-missing",
      title: "No test script detected",
      detail: "The root package.json does not expose a test command.",
      severity: "low",
      source: "github",
      deterministic: true,
    });
  }
  if (packageManager === "unknown" && packageJson) {
    findings.push({
      id: "repo.lockfile-missing",
      title: "No supported lockfile detected",
      detail: "Reproducible dependency installation is harder without a recognized lockfile.",
      severity: "medium",
      source: "github",
      deterministic: true,
    });
  }
  if (!envFile && technologies.some((technology) => ["supabase", "stripe", "resend", "authjs", "clerk"].includes(technology.key))) {
    findings.push({
      id: "repo.env-template-missing",
      title: "Integration dependencies detected without an environment template",
      detail: "Relyo found production integrations but no root .env.example/.env.sample/.env.template describing expected variable names.",
      severity: "low",
      source: "github",
      deterministic: true,
    });
  }

  const evidence = createEvidenceEnvelope({
    kind: "github-repository-observation",
    source: metadata.html_url,
    payload: {
      repository: metadata.full_name,
      defaultBranch: branch,
      commitSha: commit.sha,
      rootFiles,
      packageManager,
      scripts,
      technologies: technologies.map((technology) => technology.key),
      envTemplateVariables,
    },
    summary: {
      repository: metadata.full_name,
      filesObserved: rootFiles.length,
      technologiesDetected: technologies.length,
    },
  });

  return {
    repository: metadata.full_name,
    htmlUrl: metadata.html_url,
    defaultBranch: branch,
    commitSha: commit.sha,
    private: metadata.private,
    archived: metadata.archived,
    packageManager,
    scripts,
    technologies,
    rootFiles,
    envTemplateVariables,
    evidence: [evidence],
    findings,
  };
}

function mergeGraph(url?: UrlObservation, repo?: RepoObservation): ProductionGraph {
  const nodes: ProductionGraphNode[] = [];
  const edges: ProductionGraphEdge[] = [];
  const unknowns: string[] = [];

  if (repo) {
    const repoId = `repo:${repo.repository}`;
    nodes.push({ id: repoId, type: "repository", label: repo.repository, provider: "GitHub" });
    for (const technology of repo.technologies) {
      const nodeId = `tech:${technology.key}`;
      const type: ProductionGraphNode["type"] =
        technology.category === "framework"
          ? "framework"
          : technology.category === "database"
            ? "database"
            : technology.category === "auth"
              ? "auth"
              : technology.category === "payment"
                ? "payment"
                : technology.category === "email"
                  ? "email"
                  : "external-api";
      nodes.push({ id: nodeId, type, label: technology.label, provider: technology.label });
      edges.push({ from: repoId, to: nodeId, relation: "depends-on" });
    }
  } else {
    unknowns.push("Repository release identity is unknown until GitHub is connected or a public repository is supplied.");
  }

  if (url) {
    const deployId = `deployment:${url.host}`;
    nodes.push({
      id: deployId,
      type: "deployment",
      label: url.host,
      provider: "public-web",
      attributes: { https: url.https, status: url.status },
    });
    nodes.push({ id: `dns:${url.host}`, type: "dns", label: url.host, provider: "DNS" });
    edges.push({ from: `dns:${url.host}`, to: deployId, relation: "routes-to" });
    if (repo) edges.push({ from: `repo:${repo.repository}`, to: deployId, relation: "may-deploy-to" });
  } else {
    unknowns.push("Production URL is unknown, so public runtime reachability is not verified.");
  }

  unknowns.push("Production environment variable presence requires provider connection.");
  unknowns.push("Rollback readiness requires deployment-provider evidence.");

  return { nodes, edges, unknowns };
}

export async function discoverApplication(input: {
  url?: string;
  githubRepo?: string;
}): Promise<DiscoveryResult> {
  const [url, repo] = await Promise.all([
    input.url ? inspectPublicUrl(input.url) : Promise.resolve(undefined),
    input.githubRepo ? inspectGitHubRepository(input.githubRepo) : Promise.resolve(undefined),
  ]);

  const evidence = [...(url?.evidence ?? []), ...(repo?.evidence ?? [])];
  const findings = [...(url?.findings ?? []), ...(repo?.findings ?? [])];
  return {
    ...(url ? { url } : {}),
    ...(repo ? { repo } : {}),
    graph: mergeGraph(url, repo),
    findings,
    evidence,
  };
}
