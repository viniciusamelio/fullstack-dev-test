import type { Logger } from "../../data/protocols/logger.js";

/**
 * The only place a request can produce an HTTP error: a genuine defect
 * (a thrown exception / Panic), since every business failure (LLM/DB)
 * is modeled as a `Result` and resolved by the fallback chain before it
 * ever reaches the router. oRPC itself sanitizes the response body for
 * unhandled errors — this callback (wrapped with `onError` at the
 * OpenAPIHandler call site, so the interceptor type is inferred
 * correctly) only adds server-side logging.
 */
export function createErrorLogCallback(logger: Logger) {
  return (error: unknown): void => {
    logger.warn("unhandled request error", {
      message: error instanceof Error ? error.message : String(error),
    });
  };
}
