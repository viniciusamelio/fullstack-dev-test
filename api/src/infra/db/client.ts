import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

export function createDbClient(dbPath: string): DbClient {
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  return drizzle(sqlite, { schema });
}
