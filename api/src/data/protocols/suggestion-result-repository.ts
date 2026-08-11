import type { Result } from "better-result";
import type { Occasion } from "../../domain/enums/occasion.js";
import type { Relationship } from "../../domain/enums/relationship.js";
import type {
  SuggestionMessages,
  SuggestionSource,
} from "../../domain/models/suggestion-result.js";
import type { PersistenceFailed } from "../errors/persistence-failed.js";
import type { SuggestionLookupFailed } from "../errors/suggestion-lookup-failed.js";

export type SaveSuggestionResultInput = {
  readonly promptRunId: number | null;
  readonly occasion: Occasion;
  readonly relationship: Relationship;
  readonly promptVersion: string;
  readonly messages: SuggestionMessages;
  readonly source: SuggestionSource;
};

export type FindLatestSuggestionInput = {
  readonly occasion: Occasion;
  readonly relationship: Relationship;
  readonly promptVersion: string;
};

/**
 * Persists every returned result (regardless of source) for audit, and
 * serves as the second fallback layer: `findLatestBySignature` only ever
 * looks at rows with source "llm", so a stale static/cache fallback can
 * never cascade into becoming the "cached" answer for the next failure.
 */
export interface SuggestionResultRepository {
  save(input: SaveSuggestionResultInput): Promise<Result<void, PersistenceFailed>>;
  findLatestBySignature(
    input: FindLatestSuggestionInput,
  ): Promise<Result<SuggestionMessages | null, SuggestionLookupFailed>>;
}
