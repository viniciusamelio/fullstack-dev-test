import { Result } from "better-result";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { loadEnv } from "../config/env.js";
import { createDbClient } from "./client.js";

const envResult = loadEnv();

if (Result.isError(envResult)) {
  console.error("[smash-api] invalid environment configuration:", envResult.error.issues);
  process.exit(1);
}

const env = Result.unwrap(envResult);
const db = createDbClient(env.DB_PATH);

migrate(db, { migrationsFolder: "./src/infra/db/migrations" });
console.log("[smash-api] migrations applied");
