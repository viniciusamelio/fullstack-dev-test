import { Result } from "better-result";
import { loadEnv } from "../../infra/config/env.js";
import { createDbClient } from "../../infra/db/client.js";
import { ConsoleLogger } from "../../infra/logging/console-logger.js";
import { makeGenerateSuggestions } from "../factories/make-generate-suggestions.js";
import { createSuggestionsRouter } from "../routers/suggestions.router.js";
import { createInMemoryRateLimiter } from "./rate-limiter.js";
import { createHttpServer } from "./server.js";

const envResult = loadEnv();

if (Result.isError(envResult)) {
  console.error("[smash-api] invalid environment configuration:", envResult.error.issues);
  process.exit(1);
}

const env = Result.unwrap(envResult);
const logger = new ConsoleLogger();
const db = createDbClient(env.DB_PATH);
const generateSuggestions = makeGenerateSuggestions({
  db,
  logger,
  apiKey: env.OPENAI_API_KEY,
  model: env.OPENAI_MODEL,
});
const router = createSuggestionsRouter(generateSuggestions);
const rateLimiter = createInMemoryRateLimiter({
  limit: env.RATE_LIMIT_MAX,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
});
const server = createHttpServer(router, logger, rateLimiter);

server.listen(env.PORT, () => {
  console.log(`[smash-api] listening on :${env.PORT}`);
});
