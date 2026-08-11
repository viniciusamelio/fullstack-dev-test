import { TaggedError } from "better-result";

/** A write to the prompt-run or suggestion-result audit tables failed. */
export class PersistenceFailed extends TaggedError("PersistenceFailed")<{
  operation: string;
  cause: unknown;
}> {}
