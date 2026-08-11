import { describe, expect, it } from "vitest";
import { isRelationship, RELATIONSHIPS } from "../../../src/domain/enums/relationship.js";

describe("isRelationship", () => {
  it("returns true for every known relationship", () => {
    for (const relationship of RELATIONSHIPS) {
      expect(isRelationship(relationship)).toBe(true);
    }
  });

  it("returns false for an unknown value", () => {
    expect(isRelationship("not-a-real-relationship")).toBe(false);
  });
});
