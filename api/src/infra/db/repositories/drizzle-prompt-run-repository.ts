import { Result } from "better-result";
import { PersistenceFailed } from "../../../data/errors/persistence-failed.js";
import type {
  CreatePromptRunInput,
  PromptRunRecord,
  PromptRunRepository,
} from "../../../data/protocols/prompt-run-repository.js";
import type { DbClient } from "../client.js";
import { promptRuns } from "../schema.js";

export class DrizzlePromptRunRepository implements PromptRunRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreatePromptRunInput): Promise<Result<PromptRunRecord, PersistenceFailed>> {
    return Result.tryPromise({
      try: async () => {
        const [row] = await this.db.insert(promptRuns).values(input).returning();
        return toRecord(row as typeof promptRuns.$inferSelect);
      },
      catch: (cause) => new PersistenceFailed({ operation: "prompt_runs.create", cause }),
    });
  }
}

function toRecord(row: typeof promptRuns.$inferSelect): PromptRunRecord {
  return {
    id: row.id,
    occasion: row.occasion as PromptRunRecord["occasion"],
    relationship: row.relationship as PromptRunRecord["relationship"],
    promptVersion: row.promptVersion,
    model: row.model,
    status: row.status,
    errorMessage: row.errorMessage,
    latencyMs: row.latencyMs,
    createdAt: row.createdAt,
  };
}
