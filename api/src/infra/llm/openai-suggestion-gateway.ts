import type { LanguageModelV4 } from "@ai-sdk/provider";
import { generateText, Output } from "ai";
import { Result } from "better-result";
import { z } from "zod";
import { LlmGenerationFailed } from "../../data/errors/llm-generation-failed.js";
import type {
  GenerateSuggestionMessagesInput,
  GenerateSuggestionMessagesOutput,
  LlmSuggestionGateway,
} from "../../data/protocols/llm-suggestion-gateway.js";
import { costUsdFor } from "./pricing.js";
import { buildSuggestionPrompt, SUGGESTION_SYSTEM_PROMPT } from "./prompts/v1-suggestion-prompt.js";

const suggestionSchema = z.object({
  messages: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
});

export type OpenAiSuggestionGatewayConfig = {
  readonly model: LanguageModelV4;
};

/** Infra adapter: calls OpenAI (cheapest suitable chat model) via ai-sdk. */
export class OpenAiSuggestionGateway implements LlmSuggestionGateway {
  constructor(private readonly config: OpenAiSuggestionGatewayConfig) {}

  async generate(
    input: GenerateSuggestionMessagesInput,
  ): Promise<Result<GenerateSuggestionMessagesOutput, LlmGenerationFailed>> {
    const callResult = await Result.tryPromise({
      try: () =>
        generateText({
          model: this.config.model,
          system: SUGGESTION_SYSTEM_PROMPT,
          prompt: buildSuggestionPrompt(input.occasion, input.relationship),
          output: Output.object({ schema: suggestionSchema }),
        }),
      catch: (cause) =>
        new LlmGenerationFailed({
          message: cause instanceof Error ? cause.message : "LLM call failed",
          cause,
        }),
    });

    return Result.map(callResult, (result) => ({
      messages: result.output.messages as GenerateSuggestionMessagesOutput["messages"],
      costUsd: costUsdFor(this.config.model.modelId, {
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      }),
    }));
  }
}
