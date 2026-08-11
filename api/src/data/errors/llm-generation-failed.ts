import { TaggedError } from "better-result";

/** LLM call failed for any reason: timeout, 429, 5xx, network error, or malformed output. */
export class LlmGenerationFailed extends TaggedError("LlmGenerationFailed")<{
  message: string;
  cause: unknown;
}> {}
