import { describe, expect, it, vi } from "vitest";
import { ConsoleLogger } from "../../../../src/infra/logging/console-logger.js";

describe("ConsoleLogger", () => {
  it("writes warnings to console.warn with the given meta", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    new ConsoleLogger().warn("something happened", { foo: "bar" });
    expect(spy).toHaveBeenCalledWith("[smash-api] something happened", { foo: "bar" });
    spy.mockRestore();
  });

  it("defaults meta to an empty object when omitted", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    new ConsoleLogger().warn("no meta");
    expect(spy).toHaveBeenCalledWith("[smash-api] no meta", {});
    spy.mockRestore();
  });
});
