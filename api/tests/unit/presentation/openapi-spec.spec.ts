import { describe, expect, it } from "vitest";
import { generateOpenApiSpec } from "../../../src/presentation/http/openapi-spec.js";

describe("generateOpenApiSpec", () => {
  it("generates a spec describing POST /suggestions with request/response schemas", async () => {
    const spec = await generateOpenApiSpec();

    expect(spec.openapi).toBe("3.1.1");
    expect(spec.info).toEqual({ title: "smash-api", version: "0.1.0" });

    const paths = spec.paths as Record<string, unknown>;
    const suggestionsPath = paths["/suggestions"] as Record<string, unknown>;
    const post = suggestionsPath.post as Record<string, unknown>;

    expect(post.requestBody).toBeDefined();
    expect(post.responses).toHaveProperty("200");
  });
});
