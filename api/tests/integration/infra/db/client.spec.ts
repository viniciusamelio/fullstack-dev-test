import { existsSync, rmSync } from "node:fs";
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { createDbClient } from "../../../../src/infra/db/client.js";

const dbPath = "./data/test-client.db";

function cleanup(): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const path = `${dbPath}${suffix}`;
    if (existsSync(path)) rmSync(path);
  }
}

describe("createDbClient", () => {
  afterEach(cleanup);

  it("creates a working sqlite-backed drizzle client", () => {
    const db = createDbClient(dbPath);

    const row = db.get<{ value: number }>(sql`select 1 as value`);

    expect(row).toEqual({ value: 1 });
    expect(existsSync(dbPath)).toBe(true);
  });
});
