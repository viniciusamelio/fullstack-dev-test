export type SuggestionSource = "llm" | "cache" | "static";

/** Always exactly 3 short gift-card message suggestions. */
export type SuggestionMessages = [string, string, string];

export type SuggestionResult = {
  readonly messages: SuggestionMessages;
  readonly source: SuggestionSource;
};
