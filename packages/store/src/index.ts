import type { Pool, PoolClient } from "pg";
import type { EvidenceEnvelope, Passport, ProofRun } from "@relyo/kernel";
import type { SignedPassport } from "@relyo/kernel/signing";

export interface StoredProofRecord {
  run: ProofRun;
  passport: Passport;
  signedPassport?: SignedPassport;
  evidence: EvidenceEnvelope[];
  createdAt: string;
}

export interface ProofStore {
  save(record: StoredProofRecord): Promise<void>;
  get(runId: string): Promise<StoredProofRecord | null>;
}

function cloneRecord(record: StoredProofRecord): StoredProofRecord {
  return structuredClone(record);
}

export class MemoryProofStore implements ProofStore {
  private readonly records = new Map<string, StoredProofRecord>();

  async save(record: StoredProofRecord): Promise<void> {
    if (this.records.has(record.run.id)) {
      throw new Error(`Proof run ${record.run.id} is immutable and already exists.`);
    }
    this.records.set(record.run.id, cloneRecord(record));
  }

  async get(runId: string): Promise<StoredProofRecord | null> {
    const record = this.records.get(runId);
    return record ? cloneRecord(record) : null;
  }
}

type ProofRunRow = {
  payload: StoredProofRecord;
};

export class PostgresProofStore implements ProofStore {
  constructor(private readonly pool: Pool) {}

  async save(record: StoredProofRecord): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await this.insertEvidence(client, record.evidence);
      await client.query(
        `INSERT INTO proof_runs (id, subject_id, state, target_assurance, created_at, payload)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        [
          record.run.id,
          record.run.subject.id,
          record.run.state,
          record.run.targetAssurance,
          record.createdAt,
          JSON.stringify(record),
        ],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async get(runId: string): Promise<StoredProofRecord | null> {
    const result = await this.pool.query<ProofRunRow>(
      "SELECT payload FROM proof_runs WHERE id = $1",
      [runId],
    );
    return result.rows[0]?.payload ?? null;
  }

  private async insertEvidence(client: PoolClient, evidence: EvidenceEnvelope[]) {
    for (const item of evidence) {
      await client.query(
        `INSERT INTO evidence_envelopes (id, sha256, kind, source, collected_at, payload)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        [
          item.id,
          item.sha256,
          item.kind,
          item.source,
          item.collectedAt,
          JSON.stringify(item),
        ],
      );
    }
  }
}
