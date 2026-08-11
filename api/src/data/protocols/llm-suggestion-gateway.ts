import type { Result } from "better-result";
import type { Occasion } from "../../domain/enums/occasion.js";
import type { Relationship } from "../../domain/enums/relationship.js";
import type { SuggestionMessages } from "../../domain/models/suggestion-result.js";
import type { LlmGenerationFailed } from "../errors/llm-generation-failed.js";

export type GenerateSuggestionMessagesInput = {
  readonly occasion: Occasion;
  readonly relationship: Relationship;
  readonly promptVersion: string;
};

export type GenerateSuggestionMessagesOutput = {
  readonly messages: SuggestionMessages;
  /** USD cost of this call, or `null` when it couldn't be priced (unknown model / no usage reported) — see `infra/llm/pricing.ts`. */
  readonly costUsd: number | null;
};

/** Port to the LLM provider. Infra implements this against OpenAI via ai-sdk. */
export interface LlmSuggestionGateway {
  generate(
    input: GenerateSuggestionMessagesInput,
  ): Promise<Result<GenerateSuggestionMessagesOutput, LlmGenerationFailed>>;
}
