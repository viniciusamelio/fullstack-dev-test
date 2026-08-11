import { describe, expect, it } from "vitest";
import { ConsoleLogger } from "../../../src/infra/logging/console-logger.js";
import { makeGenerateSuggestions } from "../../../src/presentation/factories/make-generate-suggestions.js";
import { createTestDb } from "../../support/test-db.js";

describe("makeGenerateSuggestions", () => {
  it("wires a fully-functional GenerateSuggestions usecase", () => {
    const { db } = createTestDb();

    const usecase = makeGenerateSuggestions({
      db,
      logger: new ConsoleLogger(),
      apiKey: "sk-test",
      model: "gpt-5-nano",
    });

    expect(typeof usecase.execute).toBe("function");
  });
});
