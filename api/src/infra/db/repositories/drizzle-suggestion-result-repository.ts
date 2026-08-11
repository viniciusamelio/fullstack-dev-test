import { Result } from "better-result";
import { and, desc, eq } from "drizzle-orm";
import { PersistenceFailed } from "../../../data/errors/persistence-failed.js";
import { SuggestionLookupFailed } from "../../../data/errors/suggestion-lookup-failed.js";
import type {
  FindLatestSuggestionInput,
  SaveSuggestionResultInput,
  SuggestionResultRepository,
} from "../../../data/protocols/suggestion-result-repository.js";
import type { SuggestionMessages } from "../../../domain/models/suggestion-result.js";
import type { DbClient } from "../client.js";
import { suggestionResults } from "../schema.js";

export class DrizzleSuggestionResultRepository implements SuggestionResultRepository {
  constructor(private readonly db: DbClient) {}

  async save(input: SaveSuggestionResultInput): Promise<Result<void, PersistenceFailed>> {
    return Result.tryPromise({
      try: async () => {
        await this.db.insert(suggestionResults).values({
          promptRunId: input.promptRunId,
          occasion: input.occasion,
          relationship: input.relationship,
          promptVersion: input.promptVersion,
          messages: [...input.messages] as [string, string, string],
          source: input.source,
        });
      },
      catch: (cause) => new PersistenceFailed({ operation: "suggestion_results.save", cause }),
    });
  }

  async findLatestBySignature(
    input: FindLatestSuggestionInput,
  ): Promise<Result<SuggestionMessages | null, SuggestionLookupFailed>> {
    return Result.tryPromise({
      try: async () => {
        const rows = await this.db
          .select({ messages: suggestionResults.messages })
          .from(suggestionResults)
          .where(
            and(
              eq(suggestionResults.occasion, input.occasion),
              eq(suggestionResults.relationship, input.relationship),
              eq(suggestionResults.promptVersion, input.promptVersion),
              eq(suggestionResults.source, "llm"),
            ),
          )
          .orderBy(desc(suggestionResults.createdAt), desc(suggestionResults.id))
          .limit(1);
        return rows[0]?.messages ?? null;
      },
      catch: (cause) => new SuggestionLookupFailed({ cause }),
    });
  }
}
