import type { IncomingMessage } from "node:http";

/**
 * Best-effort client IP for rate-limiting purposes: trusts a single
 * `x-forwarded-for` hop (fine behind one reverse proxy; a multi-hop
 * deployment would need to pick the right entry, not just the first) and
 * falls back to the raw socket address.
 */
export function getClientIp(req: IncomingMessage): string {
  const header = req.headers["x-forwarded-for"];
  const value = Array.isArray(header) ? header[0] : header;
  const first = value ? value.split(",")[0]!.trim() : "";
  return first || req.socket.remoteAddress || "unknown";
}
