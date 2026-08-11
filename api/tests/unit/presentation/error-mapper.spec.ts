import { describe, expect, it, vi } from "vitest";
import { createErrorLogCallback } from "../../../src/presentation/http/error-mapper.js";

describe("createErrorLogCallback", () => {
  it("logs the message when given an Error", () => {
    const logger = { warn: vi.fn() };
    const callback = createErrorLogCallback(logger);

    callback(new Error("boom"));

    expect(logger.warn).toHaveBeenCalledWith("unhandled request error", { message: "boom" });
  });

  it("stringifies non-Error values", () => {
    const logger = { warn: vi.fn() };
    const callback = createErrorLogCallback(logger);

    callback("plain string error");

    expect(logger.warn).toHaveBeenCalledWith("unhandled request error", {
      message: "plain string error",
    });
  });
});
