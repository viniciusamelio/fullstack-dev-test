import { createServer as createNodeServer, type Server } from "node:http";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { onError } from "@orpc/server";
import type { Logger } from "../../data/protocols/logger.js";
import type { SuggestionsRouter } from "../routers/suggestions.router.js";
import { getClientIp } from "./client-ip.js";
import { createErrorLogCallback } from "./error-mapper.js";
import { generateOpenApiSpec } from "./openapi-spec.js";
import type { RateLimiter } from "./rate-limiter.js";

/** Plain `node:http` server exposing the oRPC router as REST via OpenAPIHandler. */
export function createHttpServer(
  router: SuggestionsRouter,
  logger: Logger,
  rateLimiter: RateLimiter,
): Server {
  const handler = new OpenAPIHandler(router, {
    interceptors: [onError(createErrorLogCallback(logger))],
  });
  // The contract is static, so the spec never changes at runtime — generate
  // it once, lazily, and reuse it for every /spec.json request.
  let specPromise: Promise<Record<string, unknown>> | undefined;

  return createNodeServer(async (req, res) => {
    const rateLimitResult = rateLimiter.check(getClientIp(req));
    if (!rateLimitResult.allowed) {
      const retryAfterSeconds = Math.ceil(rateLimitResult.retryAfterMs / 1000);
      res.statusCode = 429;
      res.setHeader("content-type", "application/json");
      res.setHeader("retry-after", String(retryAfterSeconds));
      res.end(JSON.stringify({ error: "rate_limited", retryAfterSeconds }));
      return;
    }

    if (req.method === "GET" && req.url === "/spec.json") {
      specPromise ??= generateOpenApiSpec();
      const spec = await specPromise;
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(spec));
      return;
    }

    const result = await handler.handle(req, res, { context: {} });
    if (!result.matched) {
      res.statusCode = 404;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: "not_found" }));
    }
  });
}
