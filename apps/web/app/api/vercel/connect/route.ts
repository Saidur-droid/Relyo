import { createPkceTransaction } from "@relyo/credentials";
import { NextRequest, NextResponse } from "next/server";
import { vercelOAuthConfig } from "@/lib/server-services";

export const runtime = "nodejs";

const OAUTH_MAX_AGE = 10 * 60;

function secureCookie(request: NextRequest) {
  return process.env.NODE_ENV === "production" || request.nextUrl.protocol === "https:";
}

export async function GET(request: NextRequest) {
  let config: ReturnType<typeof vercelOAuthConfig>;
  try {
    config = vercelOAuthConfig();
  } catch {
    return Response.json(
      { error: "Vercel connection is not configured on this Relyo deployment." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const transaction = createPkceTransaction();
  const callbackUrl = new URL("/api/vercel/callback", request.nextUrl.origin).toString();
  const authorizationUrl = new URL("https://vercel.com/oauth/authorize");
  authorizationUrl.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: config.scope,
    state: transaction.state,
    nonce: transaction.nonce,
    code_challenge: transaction.codeChallenge,
    code_challenge_method: "S256",
  }).toString();

  const response = NextResponse.redirect(authorizationUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: secureCookie(request),
    sameSite: "lax" as const,
    path: "/",
    maxAge: OAUTH_MAX_AGE,
  };
  response.cookies.set("relyo_vercel_oauth_state", transaction.state, cookieOptions);
  response.cookies.set("relyo_vercel_oauth_nonce", transaction.nonce, cookieOptions);
  response.cookies.set("relyo_vercel_oauth_verifier", transaction.codeVerifier, cookieOptions);
  response.headers.set("cache-control", "no-store");
  return response;
}
