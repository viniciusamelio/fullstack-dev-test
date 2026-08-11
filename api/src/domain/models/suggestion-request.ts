import type { Occasion } from "../enums/occasion.js";
import type { Relationship } from "../enums/relationship.js";

export type SuggestionRequest = {
  readonly occasion: Occasion;
  readonly relationship: Relationship;
};
