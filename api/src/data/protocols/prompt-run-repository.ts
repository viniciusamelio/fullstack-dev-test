import type { Result } from "better-result";
import type { Occasion } from "../../domain/enums/occasion.js";
import type { Relationship } from "../../domain/enums/relationship.js";
import type { PersistenceFailed } from "../errors/persistence-failed.js";

export type PromptRunStatus = "success" | "llm_failed";

export type CreatePromptRunInput = {
  readonly occasion: Occasion;
  readonly relationship: Relationship;
  readonly promptVersion: string;
  readonly model: string;
  readonly status: PromptRunStatus;
  readonly errorMessage: string | null;
  readonly latencyMs: number;
  /** USD cost of the LLM call, or `null` when it failed or couldn't be priced. */
  readonly costUsd: number | null;
};

export type PromptRunRecord = CreatePromptRunInput & {
  readonly id: number;
  readonly createdAt: Date;
};

/** Audit trail of every LLM call attempt, used to control/track prompt cost. */
export interface PromptRunRepository {
  create(input: CreatePromptRunInput): Promise<Result<PromptRunRecord, PersistenceFailed>>;
}
