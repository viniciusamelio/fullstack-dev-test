import { call } from "@orpc/server";
import { Result } from "better-result";
import { describe, expect, it, vi } from "vitest";
import type { GenerateSuggestions } from "../../../src/domain/usecases/generate-suggestions.js";
import { createSuggestionsRouter } from "../../../src/presentation/routers/suggestions.router.js";

describe("suggestions router", () => {
  it("returns the usecase result for a valid request", async () => {
    const generateSuggestions: GenerateSuggestions = {
      execute: vi.fn().mockResolvedValue(Result.ok({ messages: ["a", "b", "c"], source: "llm" })),
    };
    const router = createSuggestionsRouter(generateSuggestions);

    const output = await call(router.generate, { occasion: "birthday", relationship: "friend" });

    expect(output).toEqual({ messages: ["a", "b", "c"], source: "llm" });
    expect(generateSuggestions.execute).toHaveBeenCalledWith({
      occasion: "birthday",
      relationship: "friend",
    });
  });

  it("rejects an invalid occasion before reaching the usecase", async () => {
    const generateSuggestions: GenerateSuggestions = { execute: vi.fn() };
    const router = createSuggestionsRouter(generateSuggestions);

    await expect(
      call(router.generate, { occasion: "not-real", relationship: "friend" } as never),
    ).rejects.toThrow();
    expect(generateSuggestions.execute).not.toHaveBeenCalled();
  });
});
