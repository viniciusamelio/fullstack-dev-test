import { Result } from "better-result";
import { describe, expect, it, vi } from "vitest";
import { LlmGenerationFailed } from "../../../src/data/errors/llm-generation-failed.js";
import { PersistenceFailed } from "../../../src/data/errors/persistence-failed.js";
import { SuggestionLookupFailed } from "../../../src/data/errors/suggestion-lookup-failed.js";
import type { FallbackMessageProvider } from "../../../src/data/protocols/fallback-message-provider.js";
import type { LlmSuggestionGateway } from "../../../src/data/protocols/llm-suggestion-gateway.js";
import type { Logger } from "../../../src/data/protocols/logger.js";
import type {
  PromptRunRecord,
  PromptRunRepository,
} from "../../../src/data/protocols/prompt-run-repository.js";
import type { SuggestionResultRepository } from "../../../src/data/protocols/suggestion-result-repository.js";
import { DbGenerateSuggestions } from "../../../src/data/usecases/db-generate-suggestions.js";
import type { SuggestionRequest } from "../../../src/domain/models/suggestion-request.js";
import type { SuggestionMessages } from "../../../src/domain/models/suggestion-result.js";

const request: SuggestionRequest = { occasion: "birthday", relationship: "friend" };
const llmMessages: SuggestionMessages = ["a", "b", "c"];
const cachedMessages: SuggestionMessages = ["x", "y", "z"];
const staticMessages: SuggestionMessages = ["s1", "s2", "s3"];

const llmCostUsd = 0.0000065;

function makeRecord(overrides: Partial<PromptRunRecord> = {}): PromptRunRecord {
  return {
    id: 1,
    occasion: "birthday",
    relationship: "friend",
    promptVersion: "v1",
    model: "gpt-5-nano",
    status: "success",
    errorMessage: null,
    latencyMs: 10,
    costUsd: llmCostUsd,
    createdAt: new Date(),
    ...overrides,
  };
}

type Overrides = {
  llmGateway?: LlmSuggestionGateway;
  promptRunRepository?: PromptRunRepository;
  suggestionResultRepository?: SuggestionResultRepository;
  fallbackMessageProvider?: FallbackMessageProvider;
  logger?: Logger;
};

function makeSut(overrides: Overrides = {}) {
  const llmGateway: LlmSuggestionGateway = overrides.llmGateway ?? {
    generate: vi.fn().mockResolvedValue(Result.ok({ messages: llmMessages, costUsd: llmCostUsd })),
  };
  const promptRunRepository: PromptRunRepository = overrides.promptRunRepository ?? {
    create: vi.fn().mockResolvedValue(Result.ok(makeRecord())),
  };
  const suggestionResultRepository: SuggestionResultRepository =
    overrides.suggestionResultRepository ?? {
      save: vi.fn().mockResolvedValue(Result.ok(undefined)),
      findLatestBySignature: vi.fn().mockResolvedValue(Result.ok(null)),
    };
  const fallbackMessageProvider: FallbackMessageProvider = overrides.fallbackMessageProvider ?? {
    get: vi.fn().mockReturnValue(staticMessages),
  };
  const logger: Logger = overrides.logger ?? { warn: vi.fn() };

  const sut = new DbGenerateSuggestions({
    llmGateway,
    promptRunRepository,
    suggestionResultRepository,
    fallbackMessageProvider,
    logger,
    promptVersion: "v1",
    model: "gpt-5-nano",
  });

  return {
    sut,
    llmGateway,
    promptRunRepository,
    suggestionResultRepository,
    fallbackMessageProvider,
    logger,
  };
}

describe("DbGenerateSuggestions", () => {
  it("returns the LLM messages and persists a success run + llm result", async () => {
    const { sut, promptRunRepository, suggestionResultRepository } = makeSut();

    const result = await sut.execute(request);

    expect(Result.unwrap(result)).toEqual({ messages: llmMessages, source: "llm" });
    expect(promptRunRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success", errorMessage: null, costUsd: llmCostUsd }),
    );
    expect(suggestionResultRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ source: "llm", messages: llmMessages, promptRunId: 1 }),
    );
  });

  it("logs and continues with a null promptRunId when recording the run fails", async () => {
    const { sut, logger, suggestionResultRepository } = makeSut({
      promptRunRepository: {
        create: vi
          .fn()
          .mockResolvedValue(
            Result.err(new PersistenceFailed({ operation: "x", cause: "db down" })),
          ),
      },
    });

    const result = await sut.execute(request);

    expect(Result.unwrap(result)).toEqual({ messages: llmMessages, source: "llm" });
    expect(logger.warn).toHaveBeenCalledWith("prompt_run persistence failed", expect.anything());
    expect(suggestionResultRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ promptRunId: null }),
    );
  });

  it("logs when saving the suggestion result fails, but still returns the messages", async () => {
    const { sut, logger } = makeSut({
      suggestionResultRepository: {
        save: vi
          .fn()
          .mockResolvedValue(
            Result.err(new PersistenceFailed({ operation: "x", cause: "db down" })),
          ),
        findLatestBySignature: vi.fn().mockResolvedValue(Result.ok(null)),
      },
    });

    const result = await sut.execute(request);

    expect(Result.unwrap(result)).toEqual({ messages: llmMessages, source: "llm" });
    expect(logger.warn).toHaveBeenCalledWith(
      "suggestion_result persistence failed",
      expect.anything(),
    );
  });

  it("falls back to the cached result when the LLM call fails", async () => {
    const { sut, promptRunRepository, suggestionResultRepository } = makeSut({
      llmGateway: {
        generate: vi
          .fn()
          .mockResolvedValue(
            Result.err(new LlmGenerationFailed({ message: "429", cause: "rate limited" })),
          ),
      },
      suggestionResultRepository: {
        save: vi.fn().mockResolvedValue(Result.ok(undefined)),
        findLatestBySignature: vi.fn().mockResolvedValue(Result.ok(cachedMessages)),
      },
    });

    const result = await sut.execute(request);

    expect(Result.unwrap(result)).toEqual({ messages: cachedMessages, source: "cache" });
    expect(promptRunRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "llm_failed", errorMessage: "429", costUsd: null }),
    );
    expect(suggestionResultRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ source: "cache", messages: cachedMessages }),
    );
  });

  it("falls back to static messages when the LLM fails and there is no cache", async () => {
    const { sut, fallbackMessageProvider, suggestionResultRepository } = makeSut({
      llmGateway: {
        generate: vi
          .fn()
          .mockResolvedValue(
            Result.err(new LlmGenerationFailed({ message: "500", cause: "oops" })),
          ),
      },
    });

    const result = await sut.execute(request);

    expect(Result.unwrap(result)).toEqual({ messages: staticMessages, source: "static" });
    expect(fallbackMessageProvider.get).toHaveBeenCalledWith("birthday");
    expect(suggestionResultRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ source: "static", messages: staticMessages }),
    );
  });

  it("falls back to static messages when the LLM fails and the cache lookup itself fails", async () => {
    const { sut, logger } = makeSut({
      llmGateway: {
        generate: vi
          .fn()
          .mockResolvedValue(
            Result.err(new LlmGenerationFailed({ message: "500", cause: "oops" })),
          ),
      },
      suggestionResultRepository: {
        save: vi.fn().mockResolvedValue(Result.ok(undefined)),
        findLatestBySignature: vi
          .fn()
          .mockResolvedValue(Result.err(new SuggestionLookupFailed({ cause: "db down" }))),
      },
    });

    const result = await sut.execute(request);

    expect(Result.unwrap(result)).toEqual({ messages: staticMessages, source: "static" });
    expect(logger.warn).toHaveBeenCalledWith("suggestion cache lookup failed", expect.anything());
  });
});
