/**
 * USD price per 1M tokens, by bare model id (no "openai/" prefix).
 * Source: OpenAI's own pricing page
 * (https://developers.openai.com/api/docs/pricing), checked 2026-08-11.
 * Not fetched live — re-verify before relying on this for real spend
 * tracking, since OpenAI's pricing changes over time and a new model
 * (e.g. a `gpt-5.x-nano`) won't be in this table until added here.
 */
const PRICING_PER_MILLION_TOKENS_USD: Record<string, { input: number; output: number }> = {
  "gpt-5-nano": { input: 0.05, output: 0.4 },
};

export type LlmTokenUsage = {
  readonly inputTokens: number | undefined;
  readonly outputTokens: number | undefined;
};

/**
 * Computes the USD cost of one LLM call from its token usage, or `null`
 * when the model isn't in the pricing table or usage wasn't reported —
 * cost tracking is best-effort, not a substitute for the provider's own
 * billing dashboard.
 */
export function costUsdFor(modelId: string, usage: LlmTokenUsage): number | null {
  const pricing = PRICING_PER_MILLION_TOKENS_USD[modelId];
  if (!pricing || usage.inputTokens == null || usage.outputTokens == null) {
    return null;
  }

  return (
    (usage.inputTokens / 1_000_000) * pricing.input +
    (usage.outputTokens / 1_000_000) * pricing.output
  );
}
