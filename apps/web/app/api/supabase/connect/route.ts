import { createPkceTransaction } from "@relyo/credentials";
import { NextRequest, NextResponse } from "next/server";
import { supabaseOAuthConfig } from "@/lib/server-services";

export const runtime = "nodejs";

const OAUTH_MAX_AGE = 10 * 60;

function secureCookie(request: NextRequest) {
  return process.env.NODE_ENV === "production" || request.nextUrl.protocol === "https:";
}

export async function GET(request: NextRequest) {
  let config: ReturnType<typeof supabaseOAuthConfig>;
  try {
    config = supabaseOAuthConfig();
  } catch {
    return Response.json(
      { error: "Supabase connection is not configured on this Relyo deployment." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const transaction = createPkceTransaction();
  const callbackUrl = new URL("/api/supabase/callback", request.nextUrl.origin).toString();
  const authorizationUrl = new URL("https://api.supabase.com/v1/oauth/authorize");
  authorizationUrl.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    state: transaction.state,
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
  response.cookies.set("relyo_supabase_oauth_state", transaction.state, cookieOptions);
  response.cookies.set("relyo_supabase_oauth_verifier", transaction.codeVerifier, cookieOptions);
  response.headers.set("cache-control", "no-store");
  return response;
}
