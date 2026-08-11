import type { Occasion } from "../../domain/enums/occasion.js";
import type { SuggestionMessages } from "../../domain/models/suggestion-result.js";

/**
 * Last-resort, in-memory, infallible source of generic-safe messages.
 * Synchronous and total (never throws, never returns Result) because it
 * is a pure static lookup with a guaranteed default entry.
 */
export interface FallbackMessageProvider {
  get(occasion: Occasion): SuggestionMessages;
}
