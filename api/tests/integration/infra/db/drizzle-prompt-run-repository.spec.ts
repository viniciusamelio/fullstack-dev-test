import { Result } from "better-result";
import { describe, expect, it } from "vitest";
import type { CreatePromptRunInput } from "../../../../src/data/protocols/prompt-run-repository.js";
import { DrizzlePromptRunRepository } from "../../../../src/infra/db/repositories/drizzle-prompt-run-repository.js";
import { createTestDb } from "../../../support/test-db.js";

const input: CreatePromptRunInput = {
  occasion: "birthday",
  relationship: "friend",
  promptVersion: "v1",
  model: "gpt-5-nano",
  status: "success",
  errorMessage: null,
  latencyMs: 12,
};

describe("DrizzlePromptRunRepository", () => {
  it("creates and returns a prompt run record", async () => {
    const { db } = createTestDb();
    const repo = new DrizzlePromptRunRepository(db);

    const record = Result.unwrap(await repo.create(input));

    expect(record.id).toBeGreaterThan(0);
    expect(record.occasion).toBe("birthday");
    expect(record.status).toBe("success");
    expect(record.createdAt).toBeInstanceOf(Date);
  });

  it("returns PersistenceFailed when the write fails", async () => {
    const { db, sqlite } = createTestDb();
    sqlite.close();
    const repo = new DrizzlePromptRunRepository(db);

    const result = await repo.create(input);

    expect(Result.isError(result)).toBe(true);
  });
});
