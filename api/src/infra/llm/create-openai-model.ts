import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV4 } from "@ai-sdk/provider";

export type CreateOpenAiModelConfig = {
  readonly apiKey: string;
  /** Bare model id ("gpt-5-nano") or namespaced ("openai/gpt-5-nano") — the "openai/" prefix is stripped before calling the provider directly. */
  readonly model: string;
};

function stripProviderPrefix(model: string): string {
  return model.startsWith("openai/") ? model.slice("openai/".length) : model;
}

/** Builds the concrete OpenAI chat model used in production wiring. */
export function createOpenAiModel(config: CreateOpenAiModelConfig): LanguageModelV4 {
  const provider = createOpenAI({ apiKey: config.apiKey });
  return provider.chat(stripProviderPrefix(config.model));
}
