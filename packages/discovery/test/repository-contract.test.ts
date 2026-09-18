import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { inspectGitHubRepository } from "../src/index.js";

const template = readFileSync(new URL("../../../.env.example", import.meta.url), "utf8");
const sha = "a".repeat(40);
const requiredKeys = [
  "DATABASE_URL",
  "RELYO_CREDENTIAL_ENCRYPTION_KEY",
  "RELYO_PASSPORT_SIGNING_PRIVATE_KEY_B64",
  "VERCEL_APP_CLIENT_ID",
  "VERCEL_APP_CLIENT_SECRET",
  "VERCEL_READ_TOKEN",
];

function github(templateText: string | null) {
  const requested: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    requested.push(`${url.pathname}${url.search}`);
    const path = url.pathname;
    if (path.endsWith("/commits/main")) return Response.json({ sha });
    if (path.endsWith("/contents")) return Response.json([
      { name: "package.json", type: "file" },
      { name: "pnpm-lock.yaml", type: "file" },
      { name: ".env.example", type: "file" },
    ]);
    if (path.includes("/contents/")) {
      if (path.endsWith("/.env.example") && templateText === null) {
        return new Response(null, { status: 403 });
      }
      const content = path.endsWith("/package.json")
        ? JSON.stringify({ scripts: { build: "build", test: "test" } })
        : templateText!;
      return Response.json({ encoding: "base64", content: Buffer.from(content).toString("base64") });
    }
    return Response.json({
      full_name: "Saidur-droid/Relyo", html_url: "https://github.com/Saidur-droid/Relyo",
      default_branch: "main", private: false, archived: false,
    });
  }));
  return requested;
}

afterEach(() => vi.unstubAllGlobals());

describe("Relyo production repository contract", () => {
  it("discovers the real required key names and lockfile at the exact observed release", async () => {
    const requested = github(template);
    const repo = await inspectGitHubRepository("Saidur-droid/Relyo");
    expect(repo.packageManager).toBe("pnpm");
    expect(repo.envTemplateVariables).toEqual(requiredKeys);
    expect(repo.findings.some((finding) => finding.id === "repo.lockfile-missing")).toBe(false);
    expect(requested.filter((path) => path.includes("/contents")))
      .toEqual(expect.arrayContaining([
        `/repos/Saidur-droid/Relyo/contents?ref=${sha}`,
        `/repos/Saidur-droid/Relyo/contents/.env.example?ref=${sha}`,
      ]));
    for (const line of template.split(/\r?\n/).filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line))) {
      expect(line.split("=").slice(1).join("=")).toBe("");
    }
  });

  it("discards values and commented optional keys before constructing evidence", async () => {
    github(`${template}\n# OPTIONAL_KEY=do-not-require\nDATABASE_URL=sentinel-private-value\n`);
    const repo = await inspectGitHubRepository("Saidur-droid/Relyo");
    expect(repo.envTemplateVariables).toEqual(requiredKeys);
    expect(JSON.stringify(repo)).not.toContain("sentinel-private-value");
    expect(JSON.stringify(repo)).not.toContain("OPTIONAL_KEY");
  });

  it("leaves requirements empty if GitHub cannot read the template", async () => {
    github(null);
    const repo = await inspectGitHubRepository("Saidur-droid/Relyo");
    expect(repo.envTemplateVariables).toEqual([]);
  });
});
