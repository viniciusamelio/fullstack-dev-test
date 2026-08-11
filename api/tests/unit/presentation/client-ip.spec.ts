import type { IncomingMessage } from "node:http";
import { describe, expect, it } from "vitest";
import { getClientIp } from "../../../src/presentation/http/client-ip.js";

function makeRequest(
  headers: Record<string, string | string[] | undefined>,
  remoteAddress?: string,
): IncomingMessage {
  return {
    headers,
    socket: { remoteAddress },
  } as unknown as IncomingMessage;
}

describe("getClientIp", () => {
  it("uses the first entry of an array x-forwarded-for header", () => {
    const req = makeRequest({ "x-forwarded-for": ["1.2.3.4", "5.6.7.8"] });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("uses the first entry of a comma-separated string x-forwarded-for header", () => {
    const req = makeRequest({ "x-forwarded-for": "9.9.9.9, 8.8.8.8" });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("falls back to the socket remote address when there is no header", () => {
    const req = makeRequest({}, "10.0.0.1");
    expect(getClientIp(req)).toBe("10.0.0.1");
  });

  it("falls back to 'unknown' when there is neither a header nor a remote address", () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe("unknown");
  });
});
