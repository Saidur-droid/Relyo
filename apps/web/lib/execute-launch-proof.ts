import { SupabaseReadClient } from "@relyo/adapter-supabase";
import { VercelReadClient } from "@relyo/adapter-vercel";
import { listVercelProjects } from "@relyo/adapter-vercel/projects";
import { discoverApplication } from "@relyo/discovery";
import { executeCombinedR1Proof, executeVercelR1Proof } from "@relyo/proof-engine";
import {
  credentialServices,
  hasVercelProviderReadToken,
  passportSigningPrivateKeyPem,
  proofStore,
  vercelProviderReadToken,
} from "@/lib/server-services";

export class LaunchProofPublicError extends Error {
  constructor(
    public readonly status: number,
    public readonly stage: string,
    message: string,
  ) {
    super(message);
    this.name = "LaunchProofPublicError";
  }
}

export interface ExecuteLaunchProofInput {
  url?: string;
  githubRepo?: string;
  vercelConnectionId: string;
  supabaseConnectionId?: string;
}

export async function executeLaunchProof(input: ExecuteLaunchProofInput) {
  let stage = "connection";
  try {
    const services = credentialServices();
    const connection = await services.store.get(input.vercelConnectionId);
    if (!connection || connection.provider !== "vercel") {
      throw new LaunchProofPublicError(401, stage, "Vercel connection was not found. Reconnect Vercel.");
    }
    if (!connection.boundProjectId) {
      throw new LaunchProofPublicError(409, stage, "Choose a Vercel project before running launch proof.");
    }

    const tokens = services.cipher.decrypt(connection.credential);
    const oauthExpired = Boolean(tokens.expiresAt && Date.parse(tokens.expiresAt) <= Date.now());
    if (oauthExpired && !hasVercelProviderReadToken()) {
      throw new LaunchProofPublicError(401, stage, "Vercel connection expired. Reconnect Vercel.");
    }

    const readToken = vercelProviderReadToken(tokens.accessToken);
    stage = "project-scope";
    const accessibleProjects = await listVercelProjects({ token: readToken });
    const boundProject = accessibleProjects.find((project) => project.id === connection.boundProjectId);
    if (!boundProject) {
      throw new LaunchProofPublicError(422, stage, "The bound Vercel project is not accessible with the production read token.");
    }

    const providerTeamId = boundProject.accountId ?? connection.providerTeamId;
    if (providerTeamId && providerTeamId !== connection.providerTeamId) {
      await services.store.save({ ...connection, providerTeamId, updatedAt: new Date().toISOString() });
    }

    stage = "public-discovery";
    const discovery = await discoverApplication({
      ...(input.url ? { url: input.url } : {}),
      ...(input.githubRepo ? { githubRepo: input.githubRepo } : {}),
    });

    stage = "provider-observation";
    const provider = await new VercelReadClient({
      token: readToken,
      ...(providerTeamId ? { teamId: providerTeamId } : {}),
    }).inspectProduction({ projectIdOrName: connection.boundProjectId });

    if (provider.projectId !== connection.boundProjectId) {
      throw new LaunchProofPublicError(422, stage, "Provider project identity did not match the stored binding.");
    }

    let proof: Awaited<ReturnType<typeof executeVercelR1Proof>>;
    let supabaseProject: { id: string; name: string } | null = null;

    if (input.supabaseConnectionId) {
      stage = "supabase-connection";
      const supabaseConnection = await services.store.get(input.supabaseConnectionId);
      if (!supabaseConnection || supabaseConnection.provider !== "supabase") {
        throw new LaunchProofPublicError(401, stage, "Supabase connection was not found. Reconnect Supabase.");
      }
      if (!supabaseConnection.boundProjectId) {
        throw new LaunchProofPublicError(409, stage, "Choose a Supabase project before running combined launch proof.");
      }

      const supabaseTokens = services.cipher.decrypt(supabaseConnection.credential);
      if (supabaseTokens.expiresAt && Date.parse(supabaseTokens.expiresAt) <= Date.now()) {
        throw new LaunchProofPublicError(401, stage, "Supabase connection expired. Reconnect Supabase.");
      }

      stage = "supabase-observation";
      const supabase = await new SupabaseReadClient({ token: supabaseTokens.accessToken })
        .inspectProduction({ projectRef: supabaseConnection.boundProjectId });
      if (supabase.project.ref !== supabaseConnection.boundProjectId) {
        throw new LaunchProofPublicError(422, stage, "Supabase project identity did not match the stored binding.");
      }
      supabaseProject = { id: supabase.project.ref, name: supabase.project.name };

      stage = "proof-persistence";
      proof = await executeCombinedR1Proof({
        discovery,
        vercel: provider,
        supabase,
        store: proofStore(),
        signingPrivateKey: passportSigningPrivateKeyPem(),
      });
    } else {
      stage = "proof-persistence";
      proof = await executeVercelR1Proof({
        discovery,
        provider,
        store: proofStore(),
        signingPrivateKey: passportSigningPrivateKeyPem(),
      });
    }

    return {
      project: { id: provider.projectId, name: provider.projectName },
      supabaseProject,
      proof,
    };
  } catch (error) {
    if (error instanceof LaunchProofPublicError) throw error;
    throw new LaunchProofPublicError(422, stage, `Relyo could not complete R1 ${stage}.`);
  }
}
