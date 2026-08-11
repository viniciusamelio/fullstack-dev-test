/**
 * Bump this whenever `v1-suggestion-prompt.ts` (or whichever template is
 * current) changes in a way that affects output. Persisted on every
 * prompt_runs/suggestion_results row so cost and quality can be tracked
 * per template version, and so the cache-fallback lookup can be scoped to
 * the current version only.
 */
export const PROMPT_VERSION = "v1";
