import { describe, expect, it } from "vitest";
import { OCCASIONS } from "../../../../src/domain/enums/occasion.js";
import { StaticFallbackMessageProvider } from "../../../../src/infra/fallback/static-fallback-message-provider.js";

describe("StaticFallbackMessageProvider", () => {
  it("returns exactly 3 non-empty messages for every occasion", () => {
    const provider = new StaticFallbackMessageProvider();
    for (const occasion of OCCASIONS) {
      const messages = provider.get(occasion);
      expect(messages).toHaveLength(3);
      for (const message of messages) {
        expect(message.length).toBeGreaterThan(0);
      }
    }
  });
});
