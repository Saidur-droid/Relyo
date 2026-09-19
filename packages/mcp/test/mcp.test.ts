import { describe, expect, it, vi } from "vitest";
import { dispatchMcpRequest, MCP_PROTOCOL_VERSION } from "../src/index.js";
import type { RelyoClient } from "@relyo/sdk";

function client() {
  return {
    createProofRun: vi.fn().mockResolvedValue({ run: { id: "run_1", state: "VERIFIED" } }),
    getProofRun: vi.fn().mockResolvedValue({ run: { id: "run_1", state: "VERIFIED" } }),
  } as unknown as RelyoClient;
}

describe("Relyo MCP 2026 dispatcher", () => {
  it("advertises stateless tools with cache hints", async () => {
    const result = await dispatchMcpRequest({
      request: { jsonrpc: "2.0", id: 1, method: "tools/list" },
      client: client(),
      protocolVersion: MCP_PROTOCOL_VERSION,
      routedMethod: "tools/list",
    });
    expect("result" in result && (result.result as { tools: unknown[] }).tools).toHaveLength(2);
    expect("result" in result && (result.result as { ttlMs: number }).ttlMs).toBe(60_000);
  });

  it("rejects header/body routing mismatches", async () => {
    const result = await dispatchMcpRequest({
      request: { jsonrpc: "2.0", id: 1, method: "tools/list" },
      client: client(),
      protocolVersion: MCP_PROTOCOL_VERSION,
      routedMethod: "tools/call",
    });
    expect("error" in result && result.error.code).toBe(-32020);
  });

  it("calls proof tool and returns structured content", async () => {
    const fake = client();
    const result = await dispatchMcpRequest({
      request: { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "relyo_proof_run_create", arguments: { githubRepo: "o/r" } } },
      client: fake,
      protocolVersion: MCP_PROTOCOL_VERSION,
      routedMethod: "tools/call",
      routedName: "relyo_proof_run_create",
    });
    expect("result" in result).toBe(true);
  });
});
