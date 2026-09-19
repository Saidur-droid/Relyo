import { appendFileSync } from "node:fs";

const apiKey = process.env.INPUT_API_KEY?.trim();
const baseUrl = (process.env.INPUT_BASE_URL || "https://relyo-two.vercel.app").replace(/\/$/, "");
const productionUrl = process.env.INPUT_PRODUCTION_URL?.trim();
const githubRepo = process.env.INPUT_GITHUB_REPO?.trim() || process.env.GITHUB_REPOSITORY?.trim();

if (!apiKey?.startsWith("rly_live_")) throw new Error("A Relyo API key is required.");
if (!productionUrl && !githubRepo) throw new Error("Provide production-url or github-repo.");

const response = await fetch(`${baseUrl}/api/v1/proof-runs`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${apiKey}`,
    "content-type": "application/json",
    accept: "application/json",
  },
  body: JSON.stringify({
    ...(productionUrl ? { url: productionUrl } : {}),
    ...(githubRepo ? { githubRepo } : {}),
  }),
  signal: AbortSignal.timeout(120_000),
});
const payload = await response.json();
if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : `Relyo returned HTTP ${response.status}.`);

const output = process.env.GITHUB_OUTPUT;
if (output) {
  appendFileSync(output, `run-id=${payload.run?.id ?? ""}\n`);
  appendFileSync(output, `state=${payload.run?.state ?? ""}\n`);
  appendFileSync(output, `assurance=${payload.signedPassport?.passport?.assurance ?? ""}\n`);
}
if (payload.run?.state !== "VERIFIED") {
  process.exitCode = 2;
}
