import type { FallbackMessageProvider } from "../../data/protocols/fallback-message-provider.js";
import type { Occasion } from "../../domain/enums/occasion.js";
import type { SuggestionMessages } from "../../domain/models/suggestion-result.js";

/**
 * Generic-safe, occasion-aware messages. Relationship-agnostic on purpose
 * to keep this set small — this is the last-resort layer, reached only
 * when both the LLM and the cache lookup have failed for this input.
 */
const MESSAGES_BY_OCCASION: Record<Occasion, SuggestionMessages> = {
  birthday: [
    "Wishing you a wonderful birthday filled with joy.",
    "Hope your day is as special as you are.",
    "Sending warm birthday wishes your way today.",
  ],
  christmas: [
    "Wishing you a joyful Christmas and a bright new year.",
    "May this season bring you warmth and happiness.",
    "Sending festive cheer and warm wishes your way.",
  ],
  easter: [
    "Wishing you a joyful and peaceful Easter.",
    "Hope this Easter brings you happiness and new beginnings.",
    "Sending warm Easter wishes to you and yours.",
  ],
  valentines: [
    "Sending you warmth and love today.",
    "Wishing you a day filled with love and joy.",
    "Thinking of you today with warm wishes.",
  ],
  anniversary: [
    "Wishing you a wonderful anniversary and many more to come.",
    "Congratulations on another year worth celebrating.",
    "Sending warm wishes on this special milestone.",
  ],
  wedding: [
    "Wishing you both a lifetime of love and happiness.",
    "Congratulations on your wedding — here's to your new journey together.",
    "Sending warm wishes as you begin this new chapter.",
  ],
  graduation: [
    "Congratulations on this well-deserved achievement.",
    "Wishing you every success in your next chapter.",
    "Proud of you and excited for what comes next.",
  ],
  thank_you: [
    "Thank you so much for everything — it means a lot.",
    "Your kindness truly made a difference, thank you.",
    "Grateful for you and everything you've done.",
  ],
  get_well: [
    "Wishing you a smooth and speedy recovery.",
    "Sending healing thoughts and warm wishes your way.",
    "Hope you're feeling better with each passing day.",
  ],
  congratulations: [
    "Congratulations on this wonderful achievement.",
    "So happy for you and this well-deserved success.",
    "Wishing you continued success ahead.",
  ],
  new_baby: [
    "Congratulations on your precious new arrival.",
    "Wishing your growing family joy and love.",
    "So excited to celebrate this new little one with you.",
  ],
  retirement: [
    "Wishing you a happy and well-deserved retirement.",
    "Congratulations on this exciting new chapter ahead.",
    "Here's to more time for everything you love.",
  ],
};

export class StaticFallbackMessageProvider implements FallbackMessageProvider {
  get(occasion: Occasion): SuggestionMessages {
    return MESSAGES_BY_OCCASION[occasion];
  }
}
