import type { Result } from "better-result";
import type { SuggestionRequest } from "../models/suggestion-request.js";
import type { SuggestionResult } from "../models/suggestion-result.js";

/**
 * Produces gift-message suggestions for an occasion/relationship pair.
 *
 * This usecase never fails from the caller's perspective: the LLM ->
 * cached-result -> static-message fallback chain always resolves to a
 * result (`Result<SuggestionResult, never>`). Persistence/audit failures
 * along the way are logged internally and never block the response.
 */
export interface GenerateSuggestions {
  execute(request: SuggestionRequest): Promise<Result<SuggestionResult, never>>;
}
