import { implement } from "@orpc/server";
import { Result } from "better-result";
import type { GenerateSuggestions } from "../../domain/usecases/generate-suggestions.js";
import { suggestionsContract } from "../contracts/suggestions.contract.js";

const os = implement(suggestionsContract);

/**
 * `generateSuggestions.execute` never returns `Err` (see the usecase's
 * doc comment for why), so `Result.unwrap` here can never throw in
 * practice — it just extracts the guaranteed success value.
 */
export function createSuggestionsRouter(generateSuggestions: GenerateSuggestions) {
  const generate = os.generate.handler(async ({ input }) => {
    const result = await generateSuggestions.execute(input);
    return Result.unwrap(result);
  });

  return os.router({ generate });
}

export type SuggestionsRouter = ReturnType<typeof createSuggestionsRouter>;
