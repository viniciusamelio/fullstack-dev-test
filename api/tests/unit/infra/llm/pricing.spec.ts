import { describe, expect, it } from "vitest";
import { costUsdFor } from "../../../../src/infra/llm/pricing.js";

describe("costUsdFor", () => {
  it("computes USD cost from input/output token usage for a known model", () => {
    const cost = costUsdFor("gpt-5-nano", { inputTokens: 1_000_000, outputTokens: 1_000_000 });

    expect(cost).toBeCloseTo(0.05 + 0.4);
  });

  it("returns null for a model not in the pricing table", () => {
    const cost = costUsdFor("some-future-model", { inputTokens: 100, outputTokens: 100 });

    expect(cost).toBeNull();
  });

  it("returns null when input token usage wasn't reported", () => {
    const cost = costUsdFor("gpt-5-nano", { inputTokens: undefined, outputTokens: 100 });

    expect(cost).toBeNull();
  });

  it("returns null when output token usage wasn't reported", () => {
    const cost = costUsdFor("gpt-5-nano", { inputTokens: 100, outputTokens: undefined });

    expect(cost).toBeNull();
  });
});
