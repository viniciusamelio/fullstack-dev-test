import { Result } from "better-result";
import type { Occasion } from "../../domain/enums/occasion.js";
import type { Relationship } from "../../domain/enums/relationship.js";
import type { SuggestionRequest } from "../../domain/models/suggestion-request.js";
import type {
  SuggestionMessages,
  SuggestionResult,
  SuggestionSource,
} from "../../domain/models/suggestion-result.js";
import type { GenerateSuggestions } from "../../domain/usecases/generate-suggestions.js";
import type { FallbackMessageProvider } from "../protocols/fallback-message-provider.js";
import type { LlmSuggestionGateway } from "../protocols/llm-suggestion-gateway.js";
import type { Logger } from "../protocols/logger.js";
import type {
  CreatePromptRunInput,
  PromptRunRepository,
} from "../protocols/prompt-run-repository.js";
import type { SuggestionResultRepository } from "../protocols/suggestion-result-repository.js";

export type DbGenerateSuggestionsDeps = {
  readonly llmGateway: LlmSuggestionGateway;
  readonly promptRunRepository: PromptRunRepository;
  readonly suggestionResultRepository: SuggestionResultRepository;
  readonly fallbackMessageProvider: FallbackMessageProvider;
  readonly logger: Logger;
  readonly promptVersion: string;
  readonly model: string;
};

/**
 * Fallback chain: LLM -> latest persisted successful result for the same
 * input -> static generic message. Every attempt is audited (prompt_runs)
 * and every returned result is persisted (suggestion_results), regardless
 * of source. This usecase never returns Err: persistence/lookup failures
 * along the way are logged and do not affect the response returned to the
 * caller — only a genuine defect (a thrown exception, i.e. a Panic) can
 * stop it, and that is intentionally left to propagate.
 */
export class DbGenerateSuggestions implements GenerateSuggestions {
  constructor(private readonly deps: DbGenerateSuggestionsDeps) {}

  async execute(request: SuggestionRequest): Promise<Result<SuggestionResult, never>> {
    const { occasion, relationship } = request;
    const { llmGateway, promptVersion, model } = this.deps;
    const startedAt = Date.now();

    const llmResult = await llmGateway.generate({ occasion, relationship, promptVersion });

    if (Result.isOk(llmResult)) {
      const { messages, costUsd } = llmResult.value;
      const promptRunId = await this.recordRun({
        occasion,
        relationship,
        promptVersion,
        model,
        status: "success",
        errorMessage: null,
        latencyMs: Date.now() - startedAt,
        costUsd,
      });
      await this.recordResult(promptRunId, occasion, relationship, messages, "llm");
      return Result.ok({ messages, source: "llm" });
    }

    const promptRunId = await this.recordRun({
      occasion,
      relationship,
      promptVersion,
      model,
      status: "llm_failed",
      errorMessage: llmResult.error.message,
      latencyMs: Date.now() - startedAt,
      // No completed call to price — the LLM call itself is what failed.
      costUsd: null,
    });

    const cachedMessages = await this.findCached(occasion, relationship, promptVersion);

    if (cachedMessages) {
      await this.recordResult(promptRunId, occasion, relationship, cachedMessages, "cache");
      return Result.ok({ messages: cachedMessages, source: "cache" });
    }

    const staticMessages = this.deps.fallbackMessageProvider.get(occasion);
    await this.recordResult(promptRunId, occasion, relationship, staticMessages, "static");
    return Result.ok({ messages: staticMessages, source: "static" });
  }

  private async recordRun(input: CreatePromptRunInput): Promise<number | null> {
    const result = await this.deps.promptRunRepository.create(input);
    return Result.match(result, {
      ok: (record) => record.id,
      err: (error) => {
        this.deps.logger.warn("prompt_run persistence failed", { error });
        return null;
      },
    });
  }

  private async recordResult(
    promptRunId: number | null,
    occasion: Occasion,
    relationship: Relationship,
    messages: SuggestionMessages,
    source: SuggestionSource,
  ): Promise<void> {
    const result = await this.deps.suggestionResultRepository.save({
      promptRunId,
      occasion,
      relationship,
      promptVersion: this.deps.promptVersion,
      messages,
      source,
    });
    Result.match(result, {
      ok: () => undefined,
      err: (error) => {
        this.deps.logger.warn("suggestion_result persistence failed", { error });
      },
    });
  }

  private async findCached(
    occasion: Occasion,
    relationship: Relationship,
    promptVersion: string,
  ): Promise<SuggestionMessages | null> {
    const result = await this.deps.suggestionResultRepository.findLatestBySignature({
      occasion,
      relationship,
      promptVersion,
    });
    return Result.match(result, {
      ok: (messages) => messages,
      err: (error) => {
        this.deps.logger.warn("suggestion cache lookup failed", { error });
        return null;
      },
    });
  }
}
