import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { suggestionsContract } from "../contracts/suggestions.contract.js";

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

/**
 * Generates the OpenAPI 3.1 spec for this API's contract. Served at
 * `GET /spec.json` (see `server.ts`) so the frontend can generate a typed
 * HTTP client from it (e.g. via Hey API's `openapi-ts`) instead of hand
 * writing request/response types.
 */
export function generateOpenApiSpec(): Promise<Record<string, unknown>> {
  return generator.generate(suggestionsContract, {
    info: {
      title: "smash-api",
      version: "0.1.0",
    },
    servers: [{ url: "/" }],
  });
}
