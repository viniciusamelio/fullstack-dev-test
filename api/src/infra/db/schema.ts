import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const promptRuns = sqliteTable("prompt_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  occasion: text("occasion").notNull(),
  relationship: text("relationship").notNull(),
  promptVersion: text("prompt_version").notNull(),
  model: text("model").notNull(),
  status: text("status", { enum: ["success", "llm_failed"] }).notNull(),
  errorMessage: text("error_message"),
  latencyMs: integer("latency_ms").notNull(),
  /** USD cost of this call, or null when it failed or couldn't be priced (see infra/llm/pricing.ts). */
  costUsd: real("cost_usd"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const suggestionResults = sqliteTable("suggestion_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  promptRunId: integer("prompt_run_id").references(() => promptRuns.id),
  occasion: text("occasion").notNull(),
  relationship: text("relationship").notNull(),
  promptVersion: text("prompt_version").notNull(),
  messages: text("messages", { mode: "json" }).notNull().$type<[string, string, string]>(),
  source: text("source", { enum: ["llm", "cache", "static"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
