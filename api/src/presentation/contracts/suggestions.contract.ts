import { oc } from "@orpc/contract";
import { z } from "zod";
import { OCCASIONS } from "../../domain/enums/occasion.js";
import { RELATIONSHIPS } from "../../domain/enums/relationship.js";

export const occasionSchema = z.enum(OCCASIONS);
export const relationshipSchema = z.enum(RELATIONSHIPS);

export const suggestionRequestSchema = z.object({
  occasion: occasionSchema,
  relationship: relationshipSchema,
});

export const suggestionResponseSchema = z.object({
  messages: z.tuple([z.string(), z.string(), z.string()]),
  source: z.enum(["llm", "cache", "static"]),
});

/** Single endpoint of the API: POST /suggestions. */
export const suggestionsContract = {
  generate: oc
    .route({ method: "POST", path: "/suggestions" })
    .input(suggestionRequestSchema)
    .output(suggestionResponseSchema),
};
