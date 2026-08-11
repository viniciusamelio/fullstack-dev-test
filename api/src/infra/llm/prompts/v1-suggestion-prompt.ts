import type { Occasion } from "../../../domain/enums/occasion.js";
import type { Relationship } from "../../../domain/enums/relationship.js";

export const SUGGESTION_SYSTEM_PROMPT =
  "You are a thoughtful gift-card message writer. You write short, warm, " +
  "sincere messages suitable for printing inside a gift card. Avoid " +
  "clichés, avoid emojis, avoid mentioning price or the gift itself, and " +
  "never write anything that could be hurtful or inappropriate.";

function humanize(value: string): string {
  return value.replace(/_/g, " ");
}

export function buildSuggestionPrompt(occasion: Occasion, relationship: Relationship): string {
  return (
    `Write exactly 3 distinct short gift-card message suggestions (1-2 ` +
    `sentences each) for a ${humanize(occasion)} occasion, addressed to a ` +
    `${humanize(relationship)}. Keep each message self-contained and ready ` +
    `to write directly inside a card.`
  );
}
