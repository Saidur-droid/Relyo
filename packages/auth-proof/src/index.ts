import { createEvidenceEnvelope, type EvidenceEnvelope, type ProofContract } from "@relyo/kernel";

export type OAuthProvider = "google" | "github";

export interface AuthStepObservation {
  attempted: boolean;
  success: boolean | null;
  observedAt: string;
  httpStatus?: number;
  finalUrl?: string;
  sessionPresent?: boolean;
  detail?: string;
}

export interface AuthJourneyObservation {
  provider: OAuthProvider;
  freshSession: boolean;
  authorizationInitiation: AuthStepObservation;
  callback: AuthStepObservation;
  sessionCreation: AuthStepObservation;
  protectedRoute: AuthStepObservation;
  logout: AuthStepObservation;
  unauthorizedAfterLogout: AuthStepObservation;
  repeatLogin: AuthStepObservation;
  unauthorizedFreshSession: AuthStepObservation;
  evidence: EvidenceEnvelope[];
}

export interface AuthJourneyDriver {
  beginFreshSession(): Promise<void>;
  initiateAuthorization(provider: OAuthProvider): Promise<AuthStepObservation>;
  completeCallback(provider: OAuthProvider): Promise<AuthStepObservation>;
  observeSession(): Promise<AuthStepObservation>;
  visitProtectedRoute(): Promise<AuthStepObservation>;
  logout(): Promise<AuthStepObservation>;
  visitProtectedRouteUnauthenticated(): Promise<AuthStepObservation>;
  dispose(): Promise<void>;
}

export interface AuthProofRunOptions {
  provider: OAuthProvider;
  driverFactory: () => Promise<AuthJourneyDriver>;
  source: string;
  now?: () => Date;
}

function unknownStep(at: string, detail: string): AuthStepObservation {
  return { attempted: false, success: null, observedAt: at, detail };
}

function assertionStatus(step: AuthStepObservation): "PASS" | "FAIL" | "UNKNOWN" {
  if (!step.attempted || step.success === null) return "UNKNOWN";
  return step.success ? "PASS" : "FAIL";
}

function evidenceRefs(observation: AuthJourneyObservation): string[] {
  return observation.evidence.map((item) => item.id);
}

export function buildAuthProofContract(observation: AuthJourneyObservation): ProofContract {
  const refs = evidenceRefs(observation);
  const assertions = [
    ["auth.fresh-session", "Verification starts from a fresh browser/session state", observation.freshSession ? "PASS" : "FAIL", observation.freshSession ? "Fresh session boundary was established." : "Fresh session boundary was not established."],
    ["auth.authorization-initiation", "OAuth authorization can be initiated", assertionStatus(observation.authorizationInitiation), observation.authorizationInitiation.detail ?? "Authorization initiation observed."],
    ["auth.callback", "OAuth callback completes correctly", assertionStatus(observation.callback), observation.callback.detail ?? "Callback outcome observed."],
    ["auth.session-created", "A valid authenticated session is created", assertionStatus(observation.sessionCreation), observation.sessionCreation.detail ?? "Session creation outcome observed."],
    ["auth.protected-route", "Authenticated session can access the protected route", assertionStatus(observation.protectedRoute), observation.protectedRoute.detail ?? "Protected route outcome observed."],
    ["auth.logout", "Logout invalidates the authenticated session", assertionStatus(observation.logout), observation.logout.detail ?? "Logout outcome observed."],
    ["auth.unauthorized-after-logout", "Protected route rejects access after logout", assertionStatus(observation.unauthorizedAfterLogout), observation.unauthorizedAfterLogout.detail ?? "Post-logout authorization outcome observed."],
    ["auth.repeat-login", "A second fresh login succeeds", assertionStatus(observation.repeatLogin), observation.repeatLogin.detail ?? "Repeat login outcome observed."],
    ["auth.unauthorized-fresh-session", "A fresh unauthenticated session is rejected by the protected route", assertionStatus(observation.unauthorizedFreshSession), observation.unauthorizedFreshSession.detail ?? "Fresh unauthenticated access outcome observed."],
  ] as const;

  return {
    id: `auth.oauth-${observation.provider}`,
    version: "1",
    title: `${observation.provider === "google" ? "Google" : "GitHub"} OAuth production proof`,
    requiredFor: ["R2", "R3", "R4"],
    assertions: assertions.map(([id, description, status, message]) => ({
      id,
      description,
      status,
      evidenceRefs: refs,
      message,
    })),
  };
}

async function executeSingleJourney(
  provider: OAuthProvider,
  driver: AuthJourneyDriver,
  now: () => Date,
): Promise<Omit<AuthJourneyObservation, "repeatLogin" | "unauthorizedFreshSession" | "evidence">> {
  await driver.beginFreshSession();
  const authorizationInitiation = await driver.initiateAuthorization(provider);
  const callback = await driver.completeCallback(provider);
  const sessionCreation = await driver.observeSession();
  const protectedRoute = await driver.visitProtectedRoute();
  const logout = await driver.logout();
  const unauthorizedAfterLogout = await driver.visitProtectedRouteUnauthenticated();
  return {
    provider,
    freshSession: true,
    authorizationInitiation,
    callback,
    sessionCreation,
    protectedRoute,
    logout,
    unauthorizedAfterLogout,
  };
}

export async function runAuthProof(options: AuthProofRunOptions): Promise<AuthJourneyObservation> {
  const now = options.now ?? (() => new Date());
  const first = await options.driverFactory();
  let firstJourney: Awaited<ReturnType<typeof executeSingleJourney>>;
  try {
    firstJourney = await executeSingleJourney(options.provider, first, now);
  } finally {
    await first.dispose();
  }

  const second = await options.driverFactory();
  let repeatLogin = unknownStep(now().toISOString(), "Repeat login was not attempted.");
  let unauthorizedFreshSession = unknownStep(now().toISOString(), "Fresh unauthenticated rejection was not attempted.");
  try {
    await second.beginFreshSession();
    unauthorizedFreshSession = await second.visitProtectedRouteUnauthenticated();
    const initiation = await second.initiateAuthorization(options.provider);
    const callback = await second.completeCallback(options.provider);
    const session = await second.observeSession();
    repeatLogin = {
      attempted: initiation.attempted || callback.attempted || session.attempted,
      success: initiation.success === true && callback.success === true && session.success === true,
      observedAt: now().toISOString(),
      detail: "Second fresh-session authorization, callback and session creation were evaluated.",
    };
  } finally {
    await second.dispose();
  }

  const evidence = [
    createEvidenceEnvelope({
      kind: "auth-journey-observation",
      source: options.source,
      payload: {
        provider: options.provider,
        firstJourney,
        repeatLogin,
        unauthorizedFreshSession,
      },
      collectedAt: now().toISOString(),
      redacted: true,
      summary: {
        provider: options.provider,
        freshSession: firstJourney.freshSession,
        firstLogin: firstJourney.sessionCreation.success,
        repeatLogin: repeatLogin.success,
        unauthorizedRejected: unauthorizedFreshSession.success,
      },
    }),
  ];

  return { ...firstJourney, repeatLogin, unauthorizedFreshSession, evidence };
}
