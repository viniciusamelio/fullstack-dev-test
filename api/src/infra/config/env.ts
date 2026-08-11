import "dotenv/config";
import { Result, TaggedError } from "better-result";
import { z } from "zod";

export class InvalidEnvConfig extends TaggedError("InvalidEnvConfig")<{
  issues: string;
}> {}

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("openai/gpt-5-nano"),
  DB_PATH: z.string().min(1).default("./data/smash.db"),
  PORT: z.coerce.number().int().positive().default(3000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Parses/validates process env into typed config. Takes an injectable
 * `source` (defaults to `process.env`) so it stays a pure, unit-testable
 * function despite living in infra.
 */
export function loadEnv(
  source: Record<string, string | undefined> = process.env,
): Result<EnvConfig, InvalidEnvConfig> {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    return Result.err(new InvalidEnvConfig({ issues: parsed.error.message }));
  }
  return Result.ok(parsed.data);
}
