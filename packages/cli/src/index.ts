#!/usr/bin/env node
import { RelyoClient } from "@relyo/sdk";

export interface ParsedCli {
  command: "prove" | "get" | "help";
  url?: string;
  repo?: string;
  runId?: string;
  baseUrl: string;
}

export function parseCli(argv: string[], env: NodeJS.ProcessEnv = process.env): ParsedCli {
  const [command = "help", ...rest] = argv;
  const baseUrl = env.RELYO_BASE_URL?.trim() || "https://relyo-two.vercel.app";
  if (command === "help" || command === "--help" || command === "-h") return { command: "help", baseUrl };
  if (command !== "prove" && command !== "get") throw new Error("Unknown command. Use: relyo prove | relyo get.");

  const value = (name: string) => {
    const index = rest.indexOf(name);
    return index >= 0 ? rest[index + 1] : undefined;
  };

  if (rest.includes("--api-key")) {
    throw new Error("Do not pass API keys on the command line. Set RELYO_API_KEY instead.");
  }

  if (command === "prove") {
    const url = value("--url");
    const repo = value("--repo");
    if (!url && !repo) throw new Error("Provide --url, --repo, or both.");
    return { command, baseUrl, ...(url ? { url } : {}), ...(repo ? { repo } : {}) };
  }

  const runId = rest[0];
  if (!runId) throw new Error("Usage: relyo get <run_id>");
  return { command, runId, baseUrl };
}

export async function runCli(argv = process.argv.slice(2), env: NodeJS.ProcessEnv = process.env): Promise<number> {
  const parsed = parseCli(argv, env);
  if (parsed.command === "help") {
    process.stdout.write("Relyo CLI\n  relyo prove [--url URL] [--repo owner/repo]\n  relyo get <run_id>\nEnvironment: RELYO_API_KEY (required), RELYO_BASE_URL (optional)\n");
    return 0;
  }
  const apiKey = env.RELYO_API_KEY?.trim();
  if (!apiKey) throw new Error("RELYO_API_KEY is required.");
  const client = new RelyoClient({ baseUrl: parsed.baseUrl, apiKey });
  const result = parsed.command === "prove"
    ? await client.createProofRun({ ...(parsed.url ? { url: parsed.url } : {}), ...(parsed.repo ? { githubRepo: parsed.repo } : {}) })
    : await client.getProofRun(parsed.runId!);
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  return result.run.state === "FAILED" ? 2 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli().then((code) => { process.exitCode = code; }).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : "Relyo CLI failed."}\n`);
    process.exitCode = 1;
  });
}
