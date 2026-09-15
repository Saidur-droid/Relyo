import {
  createProviderConnection,
  secureEqual,
  type ProviderTokenSet,
} from "@relyo/credentials";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { credentialServices, vercelOAuthConfig } from "@/lib/server-services";

export const runtime = "nodejs";

const JWKS = createRemoteJWKSet(new URL("https://vercel.com/.well-known/jwks"));

function secureCookie(request: NextRequest) {
  return process.env.NODE_ENV === "production" || request.nextUrl.protocol === "https:";
}

function clearTransactionCookies(response: NextResponse) {
  for (const name of [
    "relyo_vercel_oauth_state",
    "relyo_vercel_oauth_nonce",
    "relyo_vercel_oauth_verifier",
  ]) {
    response.cookies.set(name, "", { httpOnly: true, path: "/", maxAge: 0 });
  }
}

type VercelTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  id_token?: string;
  expires_in?: number;
  scope?: string;
};

export async function GET(request: NextRequest) {
  const failure = () => {
    const response = NextResponse.redirect(new URL("/?vercel=error", request.url));
    clearTransactionCookies(response);
    response.headers.set("cache-control", "no-store");
    return response;
  };

  try {
    const code = request.nextUrl.searchParams.get("code");
    const returnedState = request.nextUrl.searchParams.get("state");
    const storedState = request.cookies.get("relyo_vercel_oauth_state")?.value;
    const storedNonce = request.cookies.get("relyo_vercel_oauth_nonce")?.value;
    const codeVerifier = request.cookies.get("relyo_vercel_oauth_verifier")?.value;

    if (!code || !secureEqual(returnedState, storedState) || !storedNonce || !codeVerifier) {
      return failure();
    }

    const config = vercelOAuthConfig();
    const redirectUri = new URL("/api/vercel/callback", request.nextUrl.origin).toString();
    const tokenResponse = await fetch("https://api.vercel.com/login/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (!tokenResponse.ok) return failure();
    const tokenData = await tokenResponse.json() as VercelTokenResponse;
    if (!tokenData.access_token || !tokenData.token_type || !tokenData.id_token) return failure();

    const verified = await jwtVerify(tokenData.id_token, JWKS, {
      issuer: "https://vercel.com",
      audience: config.clientId,
    });
    if (typeof verified.payload.nonce !== "string" || !secureEqual(verified.payload.nonce, storedNonce)) {
      return failure();
    }

    const scopes = (tokenData.scope ?? config.scope)
      .split(/\s+/)
      .map((scope) => scope.trim())
      .filter(Boolean);
    const tokens: ProviderTokenSet = {
      accessToken: tokenData.access_token,
      ...(tokenData.refresh_token ? { refreshToken: tokenData.refresh_token } : {}),
      tokenType: tokenData.token_type,
      scope: scopes,
      ...(typeof tokenData.expires_in === "number"
        ? { expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString() }
        : {}),
    };

    const services = credentialServices();
    const connection = createProviderConnection({
      provider: "vercel",
      scopes,
      credential: services.cipher.encrypt(tokens),
      providerAccountId: typeof verified.payload.sub === "string" ? verified.payload.sub : undefined,
    });
    await services.store.save(connection);

    const response = NextResponse.redirect(new URL("/?vercel=connected", request.url));
    clearTransactionCookies(response);
    response.cookies.set("relyo_vercel_connection", connection.id, {
      httpOnly: true,
      secure: secureCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.headers.set("cache-control", "no-store");
    return response;
  } catch {
    return failure();
  }
}
