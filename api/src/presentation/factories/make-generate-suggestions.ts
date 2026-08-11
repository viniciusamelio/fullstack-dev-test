import type { Logger } from "../../data/protocols/logger.js";
import { DbGenerateSuggestions } from "../../data/usecases/db-generate-suggestions.js";
import type { GenerateSuggestions } from "../../domain/usecases/generate-suggestions.js";
import type { DbClient } from "../../infra/db/client.js";
import { DrizzlePromptRunRepository } from "../../infra/db/repositories/drizzle-prompt-run-repository.js";
import { DrizzleSuggestionResultRepository } from "../../infra/db/repositories/drizzle-suggestion-result-repository.js";
import { StaticFallbackMessageProvider } from "../../infra/fallback/static-fallback-message-provider.js";
import { createOpenAiModel } from "../../infra/llm/create-openai-model.js";
import { OpenAiSuggestionGateway } from "../../infra/llm/openai-suggestion-gateway.js";
import { PROMPT_VERSION } from "../../infra/llm/prompts/prompt-version.js";

export type MakeGenerateSuggestionsDeps = {
  readonly db: DbClient;
  readonly logger: Logger;
  readonly apiKey: string;
  readonly model: string;
};

/** Composition root: wires domain/data behind infra adapters. */
export function makeGenerateSuggestions(deps: MakeGenerateSuggestionsDeps): GenerateSuggestions {
  return new DbGenerateSuggestions({
    llmGateway: new OpenAiSuggestionGateway({
      model: createOpenAiModel({ apiKey: deps.apiKey, model: deps.model }),
    }),
    promptRunRepository: new DrizzlePromptRunRepository(deps.db),
    suggestionResultRepository: new DrizzleSuggestionResultRepository(deps.db),
    fallbackMessageProvider: new StaticFallbackMessageProvider(),
    logger: deps.logger,
    promptVersion: PROMPT_VERSION,
    model: deps.model,
  });
}
