import { Result } from "better-result";
import { describe, expect, it } from "vitest";
import type { SaveSuggestionResultInput } from "../../../../src/data/protocols/suggestion-result-repository.js";
import { DrizzleSuggestionResultRepository } from "../../../../src/infra/db/repositories/drizzle-suggestion-result-repository.js";
import { createTestDb } from "../../../support/test-db.js";

const baseInput: SaveSuggestionResultInput = {
  promptRunId: null,
  occasion: "birthday",
  relationship: "friend",
  promptVersion: "v1",
  messages: ["a", "b", "c"],
  source: "llm",
};

describe("DrizzleSuggestionResultRepository", () => {
  it("saves a suggestion result", async () => {
    const { db } = createTestDb();
    const repo = new DrizzleSuggestionResultRepository(db);

    const result = await repo.save(baseInput);

    expect(Result.isOk(result)).toBe(true);
  });

  it("returns PersistenceFailed when the write fails", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.close();
    const repo = new DrizzleSuggestionResultRepository(db);

    const result = await repo.save(baseInput);

    expect(Result.isError(result)).toBe(true);
  });

  it("finds the latest llm-sourced result for a signature, ignoring cache/static rows", async () => {
    const { db } = createTestDb();
    const repo = new DrizzleSuggestionResultRepository(db);
    await repo.save({ ...baseInput, messages: ["old1", "old2", "old3"], source: "llm" });
    await repo.save({
      ...baseInput,
      messages: ["static1", "static2", "static3"],
      source: "static",
    });
    await repo.save({ ...baseInput, messages: ["new1", "new2", "new3"], source: "llm" });

    const result = await repo.findLatestBySignature({
      occasion: baseInput.occasion,
      relationship: baseInput.relationship,
      promptVersion: baseInput.promptVersion,
    });

    expect(Result.unwrap(result)).toEqual(["new1", "new2", "new3"]);
  });

  it("returns null when there is no matching llm result", async () => {
    const { db } = createTestDb();
    const repo = new DrizzleSuggestionResultRepository(db);

    const result = await repo.findLatestBySignature({
      occasion: baseInput.occasion,
      relationship: baseInput.relationship,
      promptVersion: baseInput.promptVersion,
    });

    expect(Result.unwrap(result)).toBeNull();
  });

  it("returns SuggestionLookupFailed when the read fails", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.close();
    const repo = new DrizzleSuggestionResultRepository(db);

    const result = await repo.findLatestBySignature({
      occasion: baseInput.occasion,
      relationship: baseInput.relationship,
      promptVersion: baseInput.promptVersion,
    });

    expect(Result.isError(result)).toBe(true);
  });
});
