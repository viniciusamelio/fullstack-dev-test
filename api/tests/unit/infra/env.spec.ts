import { Result } from "better-result";
import { describe, expect, it } from "vitest";
import { loadEnv } from "../../../src/infra/config/env.js";

describe("loadEnv", () => {
  it("parses a valid env and applies defaults", () => {
    const result = loadEnv({ OPENAI_API_KEY: "sk-test" });
    const env = Result.unwrap(result);
    expect(env.OPENAI_MODEL).toBe("openai/gpt-5-nano");
    expect(env.DB_PATH).toBe("./data/smash.db");
    expect(env.PORT).toBe(3000);
  });

  it("returns InvalidEnvConfig when a required var is missing", () => {
    const result = loadEnv({});
    expect(Result.isError(result)).toBe(true);
  });
});
