import { describe, expect, it } from "vitest";
import { isOccasion, OCCASIONS } from "../../../src/domain/enums/occasion.js";

describe("isOccasion", () => {
  it("returns true for every known occasion", () => {
    for (const occasion of OCCASIONS) {
      expect(isOccasion(occasion)).toBe(true);
    }
  });

  it("returns false for an unknown value", () => {
    expect(isOccasion("not-a-real-occasion")).toBe(false);
  });
});
