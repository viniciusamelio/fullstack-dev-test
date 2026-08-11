import { describe, expect, it } from "vitest";
import { createInMemoryRateLimiter } from "../../../src/presentation/http/rate-limiter.js";

describe("createInMemoryRateLimiter", () => {
  it("allows requests up to the limit within a window", () => {
    const now = 0;
    const limiter = createInMemoryRateLimiter({ limit: 3, windowMs: 60_000, now: () => now });

    expect(limiter.check("1.2.3.4")).toEqual({ allowed: true });
    expect(limiter.check("1.2.3.4")).toEqual({ allowed: true });
    expect(limiter.check("1.2.3.4")).toEqual({ allowed: true });
  });

  it("blocks the request that exceeds the limit, with the correct retryAfterMs", () => {
    let now = 0;
    const limiter = createInMemoryRateLimiter({ limit: 2, windowMs: 60_000, now: () => now });

    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    now = 10_000;
    const result = limiter.check("1.2.3.4");

    expect(result).toEqual({ allowed: false, retryAfterMs: 50_000 });
  });

  it("resets the window once it elapses", () => {
    let now = 0;
    const limiter = createInMemoryRateLimiter({ limit: 1, windowMs: 60_000, now: () => now });

    limiter.check("1.2.3.4");
    expect(limiter.check("1.2.3.4")).toEqual({ allowed: false, retryAfterMs: 60_000 });

    now = 60_000;
    expect(limiter.check("1.2.3.4")).toEqual({ allowed: true });
  });

  it("tracks separate keys independently", () => {
    const now = 0;
    const limiter = createInMemoryRateLimiter({ limit: 1, windowMs: 60_000, now: () => now });

    expect(limiter.check("1.1.1.1")).toEqual({ allowed: true });
    expect(limiter.check("2.2.2.2")).toEqual({ allowed: true });
    expect(limiter.check("1.1.1.1")).toEqual({ allowed: false, retryAfterMs: 60_000 });
  });

  it("defaults to the system clock when now is not provided", () => {
    const limiter = createInMemoryRateLimiter({ limit: 1, windowMs: 60_000 });

    expect(limiter.check("1.2.3.4")).toEqual({ allowed: true });
  });
});
