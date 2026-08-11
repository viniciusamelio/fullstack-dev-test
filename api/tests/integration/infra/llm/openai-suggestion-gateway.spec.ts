import { MockLanguageModelV4 } from "ai/test";
import { Result } from "better-result";
import { describe, expect, it } from "vitest";
import { OpenAiSuggestionGateway } from "../../../../src/infra/llm/openai-suggestion-gateway.js";

const input = { occasion: "birthday", relationship: "friend", promptVersion: "v1" } as const;

function successGenerateResult(messages: [string, string, string]) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ messages }) }],
    finishReason: { unified: "stop" as const, raw: "stop" },
    usage: {
      inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
      outputTokens: { total: 5, text: 5, reasoning: undefined },
    },
    warnings: [],
  };
}

describe("OpenAiSuggestionGateway", () => {
  it("returns the parsed messages and priced cost when the model call succeeds", async () => {
    const model = new MockLanguageModelV4({
      modelId: "gpt-5-nano",
      doGenerate: async () => successGenerateResult(["a", "b", "c"]),
    });
    const gateway = new OpenAiSuggestionGateway({ model });

    const result = await gateway.generate(input);

    // 10 input tokens * $0.05/1M + 5 output tokens * $0.4/1M
    expect(Result.unwrap(result)).toEqual({
      messages: ["a", "b", "c"],
      costUsd: (10 / 1_000_000) * 0.05 + (5 / 1_000_000) * 0.4,
    });
  });

  it("returns a null cost for a model that isn't in the pricing table", async () => {
    const model = new MockLanguageModelV4({
      modelId: "some-future-model",
      doGenerate: async () => successGenerateResult(["a", "b", "c"]),
    });
    const gateway = new OpenAiSuggestionGateway({ model });

    const result = await gateway.generate(input);

    expect(Result.unwrap(result)).toEqual({ messages: ["a", "b", "c"], costUsd: null });
  });

  it("returns LlmGenerationFailed with the error message when the model call throws", async () => {
    const model = new MockLanguageModelV4({
      doGenerate: async () => {
        throw new Error("rate limited");
      },
    });
    const gateway = new OpenAiSuggestionGateway({ model });

    const result = await gateway.generate(input);

    expect(Result.isError(result)).toBe(true);
    if (Result.isError(result)) {
      expect(result.error.message).toBe("rate limited");
    }
  });

  it("returns LlmGenerationFailed with a generic message when a non-Error is thrown", async () => {
    const model = new MockLanguageModelV4({
      doGenerate: async () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw "boom";
      },
    });
    const gateway = new OpenAiSuggestionGateway({ model });

    const result = await gateway.generate(input);

    expect(Result.isError(result)).toBe(true);
    if (Result.isError(result)) {
      expect(result.error.message).toBe("LLM call failed");
    }
  });
});
