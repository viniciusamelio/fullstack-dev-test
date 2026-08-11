import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/infra/db/schema.ts",
  out: "./src/infra/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_PATH ?? "./data/smash.db",
  },
});
