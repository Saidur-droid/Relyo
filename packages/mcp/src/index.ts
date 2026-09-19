import type { RelyoClient } from "@relyo/sdk";

export const MCP_PROTOCOL_VERSION = "2026-07-28";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
  _meta?: Record<string, unknown>;
}

export type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: string | number | null; result: unknown }
  | { jsonrpc: "2.0"; id: string | number | null; error: { code: number; message: string; data?: unknown } };

const tools = [
  {
    name: "relyo_proof_run_create",
    description: "Submit a production URL and/or public GitHub repository for Relyo proof.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Production application URL" },
        githubRepo: { type: "string", description: "Public GitHub repository as owner/repo" },
      },
      additionalProperties: false,
      anyOf: [{ required: ["url"] }, { required: ["githubRepo"] }],
    },
  },
  {
    name: "relyo_proof_run_get",
    description: "Fetch a proof run previously submitted with the same Relyo API identity.",
    inputSchema: {
      type: "object",
      properties: { runId: { type: "string", pattern: "^run_[A-Za-z0-9-]+$" } },
      required: ["runId"],
      additionalProperties: false,
    },
  },
] as const;

function response(id: JsonRpcRequest["id"], result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function error(id: JsonRpcRequest["id"], code: number, message: string, data?: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message, ...(data === undefined ? {} : { data }) } };
}

function textResult(value: unknown) {
  return {
    content: [{ type: "text", text: JSON.stringify(value) }],
    structuredContent: value,
  };
}

export async function dispatchMcpRequest(input: {
  request: JsonRpcRequest;
  client: RelyoClient;
  protocolVersion?: string;
  routedMethod?: string | null;
  routedName?: string | null;
}): Promise<JsonRpcResponse> {
  const { request } = input;
  if (request.jsonrpc !== "2.0") return error(request.id, -32600, "Invalid Request");
  if (input.protocolVersion && input.protocolVersion !== MCP_PROTOCOL_VERSION) {
    return error(request.id, -32022, "Unsupported MCP protocol version.", { supported: [MCP_PROTOCOL_VERSION] });
  }
  if (input.routedMethod && input.routedMethod !== request.method) {
    return error(request.id, -32020, "Mcp-Method header does not match JSON-RPC method.");
  }

  if (request.method === "server/discover") {
    return response(request.id, {
      capabilities: { tools: {} },
      ttlMs: 60_000,
      cacheScope: "public",
      _meta: {
        "io.modelcontextprotocol/serverInfo": { name: "relyo", version: "0.1.0" },
      },
    });
  }

  if (request.method === "tools/list") {
    return response(request.id, {
      tools,
      ttlMs: 60_000,
      cacheScope: "public",
      _meta: {
        "io.modelcontextprotocol/serverInfo": { name: "relyo", version: "0.1.0" },
      },
    });
  }

  if (request.method === "tools/call") {
    const name = typeof request.params?.name === "string" ? request.params.name : "";
    if (input.routedName && input.routedName !== name) {
      return error(request.id, -32020, "Mcp-Name header does not match tool name.");
    }
    const args = request.params?.arguments;
    if (!args || typeof args !== "object" || Array.isArray(args)) return error(request.id, -32602, "Tool arguments must be an object.");
    const object = args as Record<string, unknown>;

    try {
      if (name === "relyo_proof_run_create") {
        const url = typeof object.url === "string" ? object.url : undefined;
        const githubRepo = typeof object.githubRepo === "string" ? object.githubRepo : undefined;
        if (!url && !githubRepo) return error(request.id, -32602, "Provide url or githubRepo.");
        const result = await input.client.createProofRun({ ...(url ? { url } : {}), ...(githubRepo ? { githubRepo } : {}) });
        return response(request.id, textResult(result));
      }
      if (name === "relyo_proof_run_get") {
        const runId = typeof object.runId === "string" ? object.runId : "";
        if (!runId) return error(request.id, -32602, "runId is required.");
        const result = await input.client.getProofRun(runId);
        return response(request.id, textResult(result));
      }
      return error(request.id, -32601, "Unknown MCP tool.");
    } catch (caught) {
      return error(request.id, -32000, caught instanceof Error ? caught.message : "Relyo tool call failed.");
    }
  }

  return error(request.id, -32601, "Method not found.");
}
