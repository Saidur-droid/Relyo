import type { AssuranceLevel } from "@relyo/kernel";

export interface FleetOrganization {
  id: string;
  name: string;
  appLimit: number;
}

export interface FleetApp {
  id: string;
  organizationId: string;
  name: string;
  clientRef?: string;
  providerKeys: string[];
  currentAssurance: AssuranceLevel;
  targetAssurance: AssuranceLevel;
  passportExpiresAt?: string;
  degraded: boolean;
}

export interface FleetPolicy {
  organizationId: string;
  minimumAssurance: AssuranceLevel;
  maxPassportAgeMs: number;
  requiredProviderKeys?: string[];
}

export interface FleetQueueItem {
  appId: string;
  reason: "DEGRADED" | "EXPIRED" | "BELOW_POLICY" | "PROVIDER_INCIDENT";
  priority: number;
}

const ASSURANCE_ORDER: AssuranceLevel[] = ["R0", "R1", "R2", "R3", "R4"];

function assuranceAtLeast(actual: AssuranceLevel, minimum: AssuranceLevel): boolean {
  return ASSURANCE_ORDER.indexOf(actual) >= ASSURANCE_ORDER.indexOf(minimum);
}

export function assertFleetIsolation(organizationId: string, app: FleetApp): void {
  if (app.organizationId !== organizationId) throw new Error("Cross-organization fleet access denied.");
}

export function evaluateFleetQueue(input: {
  organization: FleetOrganization;
  apps: FleetApp[];
  policy: FleetPolicy;
  now?: Date;
  incidentProviderKeys?: string[];
}): FleetQueueItem[] {
  if (input.policy.organizationId !== input.organization.id) throw new Error("Fleet policy belongs to another organization.");
  if (input.apps.length > input.organization.appLimit) throw new Error("Fleet app limit exceeded.");
  const now = input.now ?? new Date();
  const incidents = new Set(input.incidentProviderKeys ?? []);
  const queue: FleetQueueItem[] = [];

  for (const app of input.apps) {
    assertFleetIsolation(input.organization.id, app);
    const incident = app.providerKeys.some((key) => incidents.has(key));
    const expired = Boolean(app.passportExpiresAt && Date.parse(app.passportExpiresAt) <= now.getTime());
    const belowPolicy = !assuranceAtLeast(app.currentAssurance, input.policy.minimumAssurance);
    if (incident) queue.push({ appId: app.id, reason: "PROVIDER_INCIDENT", priority: 100 });
    if (app.degraded) queue.push({ appId: app.id, reason: "DEGRADED", priority: 90 });
    if (expired) queue.push({ appId: app.id, reason: "EXPIRED", priority: 80 });
    if (belowPolicy) queue.push({ appId: app.id, reason: "BELOW_POLICY", priority: 70 });
  }

  return queue.sort((a, b) => b.priority - a.priority || a.appId.localeCompare(b.appId));
}

export function providerIncidentBlastRadius(apps: FleetApp[], providerKey: string): string[] {
  return apps.filter((app) => app.providerKeys.includes(providerKey)).map((app) => app.id).sort();
}

export function scheduleBulkProofs(input: {
  organization: FleetOrganization;
  apps: FleetApp[];
  maxBatchSize: number;
}): string[][] {
  if (!Number.isInteger(input.maxBatchSize) || input.maxBatchSize < 1 || input.maxBatchSize > 100) {
    throw new Error("Bulk proof batch size must be between 1 and 100.");
  }
  if (input.apps.length > input.organization.appLimit) throw new Error("Fleet app limit exceeded.");
  for (const app of input.apps) assertFleetIsolation(input.organization.id, app);
  const ids = input.apps.map((app) => app.id).sort();
  const batches: string[][] = [];
  for (let index = 0; index < ids.length; index += input.maxBatchSize) batches.push(ids.slice(index, index + input.maxBatchSize));
  return batches;
}
