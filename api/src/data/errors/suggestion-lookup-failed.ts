import { TaggedError } from "better-result";

/** Reading a previously cached suggestion result from the DB failed. */
export class SuggestionLookupFailed extends TaggedError("SuggestionLookupFailed")<{
  cause: unknown;
}> {}
