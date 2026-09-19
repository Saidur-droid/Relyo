import { NextRequest } from "next/server";
import { dispatchMcpRequest, MCP_PROTOCOL_VERSION, type JsonRpcRequest } from "@relyo/mcp";
import { RelyoClient } from "@relyo/sdk";
import { parseBearerToken } from "@relyo/proof-api";

export const runtime = "nodejs";

function json(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function POST(request: NextRequest) {
  const protocolVersion = request.headers.get("mcp-protocol-version");
  if (protocolVersion !== MCP_PROTOCOL_VERSION) {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32022, message: "Unsupported MCP protocol version.", data: { supported: [MCP_PROTOCOL_VERSION] } } }, 400);
  }

  const token = parseBearerToken(request.headers.get("authorization"));
  if (!token) {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32001, message: "Bearer authentication is required." } }, 401);
  }

  let rpc: unknown;
  try { rpc = await request.json(); } catch {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error." } }, 400);
  }
  if (!rpc || typeof rpc !== "object" || Array.isArray(rpc)) {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request." } }, 400);
  }

  const client = new RelyoClient({ baseUrl: request.nextUrl.origin, apiKey: token });
  const result = await dispatchMcpRequest({
    request: rpc as JsonRpcRequest,
    client,
    protocolVersion,
    routedMethod: request.headers.get("mcp-method"),
    routedName: request.headers.get("mcp-name"),
  });
  const status = "error" in result && (result.error.code === -32020 || result.error.code === -32600 || result.error.code === -32602) ? 400 : 200;
  return json(result, status);
}
