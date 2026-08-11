export type RateLimitConfig = {
  /** Max requests allowed per key within one window. */
  readonly limit: number;
  readonly windowMs: number;
  /** Injectable clock, for deterministic tests. */
  readonly now?: () => number;
};

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMs: number };

export type RateLimiter = {
  check(key: string): RateLimitResult;
};

type WindowState = { windowStart: number; count: number };

/**
 * Fixed-window in-memory rate limiter. Single-process only — fine for
 * this service (one process, no clustering) but wouldn't survive a
 * multi-instance deployment without a shared store (e.g. Redis). A fixed
 * window can allow up to 2x `limit` requests across a window boundary
 * (e.g. `limit` at 0:59 and `limit` again at 1:01) — acceptable trade-off
 * for a 10/min guard; a sliding-window log would remove that but isn't
 * worth the extra state for this use case.
 */
export function createInMemoryRateLimiter(config: RateLimitConfig): RateLimiter {
  const { limit, windowMs, now = Date.now } = config;
  const windows = new Map<string, WindowState>();

  return {
    check(key: string): RateLimitResult {
      const currentTime = now();
      const existing = windows.get(key);

      if (!existing || currentTime - existing.windowStart >= windowMs) {
        windows.set(key, { windowStart: currentTime, count: 1 });
        return { allowed: true };
      }

      if (existing.count < limit) {
        existing.count += 1;
        return { allowed: true };
      }

      return { allowed: false, retryAfterMs: existing.windowStart + windowMs - currentTime };
    },
  };
}
