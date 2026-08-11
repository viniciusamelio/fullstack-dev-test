import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Result } from "better-result";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LlmGenerationFailed } from "../../src/data/errors/llm-generation-failed.js";
import type {
  GenerateSuggestionMessagesOutput,
  LlmSuggestionGateway,
} from "../../src/data/protocols/llm-suggestion-gateway.js";
import { DbGenerateSuggestions } from "../../src/data/usecases/db-generate-suggestions.js";
import { DrizzlePromptRunRepository } from "../../src/infra/db/repositories/drizzle-prompt-run-repository.js";
import { DrizzleSuggestionResultRepository } from "../../src/infra/db/repositories/drizzle-suggestion-result-repository.js";
import { promptRuns } from "../../src/infra/db/schema.js";
import { StaticFallbackMessageProvider } from "../../src/infra/fallback/static-fallback-message-provider.js";
import { PROMPT_VERSION } from "../../src/infra/llm/prompts/prompt-version.js";
import { ConsoleLogger } from "../../src/infra/logging/console-logger.js";
import {
  createInMemoryRateLimiter,
  type RateLimiter,
} from "../../src/presentation/http/rate-limiter.js";
import { createHttpServer } from "../../src/presentation/http/server.js";
import { createSuggestionsRouter } from "../../src/presentation/routers/suggestions.router.js";
import { createTestDb } from "../support/test-db.js";

function buildApp(rateLimiter?: RateLimiter) {
  const { db } = createTestDb();
  const llmGateway: LlmSuggestionGateway = { generate: vi.fn() };
  const logger = new ConsoleLogger();

  const usecase = new DbGenerateSuggestions({
    llmGateway,
    promptRunRepository: new DrizzlePromptRunRepository(db),
    suggestionResultRepository: new DrizzleSuggestionResultRepository(db),
    fallbackMessageProvider: new StaticFallbackMessageProvider(),
    logger,
    promptVersion: PROMPT_VERSION,
    model: "gpt-5-nano",
  });
  const router = createSuggestionsRouter(usecase);
  // Generous default so tests unrelated to rate limiting aren't affected by it.
  const limiter = rateLimiter ?? createInMemoryRateLimiter({ limit: 1000, windowMs: 60_000 });
  const server = createHttpServer(router, logger, limiter);

  return { server, db, llmGateway };
}

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

async function post(baseUrl: string, path: string, body: unknown) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

type SuggestionResponseBody = { messages: string[]; source: string };

async function bodyOf(response: Response): Promise<SuggestionResponseBody> {
  return (await response.json()) as SuggestionResponseBody;
}

const mockCostUsd = 0.0000065;

function llmSuccess(
  messages: [string, string, string],
  costUsd: number | null = mockCostUsd,
): Result<GenerateSuggestionMessagesOutput, LlmGenerationFailed> {
  return Result.ok({ messages, costUsd });
}

describe("suggestions e2e", () => {
  let server: Server | undefined;

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server?.close(resolve));
      server = undefined;
    }
  });

  it("returns LLM-generated messages on the happy path and audits the run", async () => {
    const app = buildApp();
    server = app.server;
    vi.mocked(app.llmGateway.generate).mockResolvedValue(llmSuccess(["a", "b", "c"]));
    const baseUrl = await listen(server);

    const response = await post(baseUrl, "/suggestions", {
      occasion: "birthday",
      relationship: "friend",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ messages: ["a", "b", "c"], source: "llm" });

    const runs = app.db.select().from(promptRuns).all();
    expect(runs).toHaveLength(1);
    expect(runs[0]?.status).toBe("success");
    expect(runs[0]?.costUsd).toBe(mockCostUsd);
  });

  it("falls back to the cached result on a later LLM failure for the same input", async () => {
    const app = buildApp();
    server = app.server;
    vi.mocked(app.llmGateway.generate)
      .mockResolvedValueOnce(llmSuccess(["a", "b", "c"]))
      .mockResolvedValueOnce(
        Result.err(new LlmGenerationFailed({ message: "429", cause: "rate limited" })),
      );
    const baseUrl = await listen(server);

    const first = await post(baseUrl, "/suggestions", {
      occasion: "wedding",
      relationship: "friend",
    });
    expect((await bodyOf(first)).source).toBe("llm");

    const second = await post(baseUrl, "/suggestions", {
      occasion: "wedding",
      relationship: "friend",
    });
    expect(second.status).toBe(200);
    expect(await bodyOf(second)).toEqual({ messages: ["a", "b", "c"], source: "cache" });

    const runs = app.db.select().from(promptRuns).all();
    expect(runs).toHaveLength(2);
    expect(runs[0]?.costUsd).toBe(mockCostUsd);
    expect(runs[1]?.status).toBe("llm_failed");
    expect(runs[1]?.costUsd).toBeNull();
  });

  it("falls back to static messages when the LLM fails and there is no cache", async () => {
    const app = buildApp();
    server = app.server;
    vi.mocked(app.llmGateway.generate).mockResolvedValue(
      Result.err(new LlmGenerationFailed({ message: "500", cause: "outage" })),
    );
    const baseUrl = await listen(server);

    const response = await post(baseUrl, "/suggestions", {
      occasion: "christmas",
      relationship: "mother",
    });

    expect(response.status).toBe(200);
    const body = await bodyOf(response);
    expect(body.source).toBe("static");
    expect(body.messages).toHaveLength(3);
  });

  it("returns 400 for an invalid occasion", async () => {
    const app = buildApp();
    server = app.server;
    const baseUrl = await listen(server);

    const response = await post(baseUrl, "/suggestions", {
      occasion: "not-real",
      relationship: "friend",
    });

    expect(response.status).toBe(400);
    expect(app.llmGateway.generate).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown route", async () => {
    const app = buildApp();
    server = app.server;
    const baseUrl = await listen(server);

    const response = await fetch(`${baseUrl}/nope`);

    expect(response.status).toBe(404);
  });

  it("returns 429 with a Retry-After header once the per-IP limit is exceeded", async () => {
    const limiter = createInMemoryRateLimiter({ limit: 2, windowMs: 60_000 });
    const app = buildApp(limiter);
    server = app.server;
    vi.mocked(app.llmGateway.generate).mockResolvedValue(llmSuccess(["a", "b", "c"]));
    const baseUrl = await listen(server);
    const body = { occasion: "birthday", relationship: "friend" };

    const first = await post(baseUrl, "/suggestions", body);
    const second = await post(baseUrl, "/suggestions", body);
    const third = await post(baseUrl, "/suggestions", body);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
    expect(third.headers.get("retry-after")).toBeTruthy();
    expect(await third.json()).toEqual(expect.objectContaining({ error: "rate_limited" }));
    expect(app.llmGateway.generate).toHaveBeenCalledTimes(2);
  });

  it("answers a CORS preflight OPTIONS request with 204 and no downstream handling", async () => {
    const app = buildApp();
    server = app.server;
    const baseUrl = await listen(server);

    const response = await fetch(`${baseUrl}/suggestions`, { method: "OPTIONS" });

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("access-control-allow-methods")).toContain("POST");
    expect(app.llmGateway.generate).not.toHaveBeenCalled();
  });

  it("sets CORS headers on a normal response", async () => {
    const app = buildApp();
    server = app.server;
    vi.mocked(app.llmGateway.generate).mockResolvedValue(llmSuccess(["a", "b", "c"]));
    const baseUrl = await listen(server);

    const response = await post(baseUrl, "/suggestions", {
      occasion: "birthday",
      relationship: "friend",
    });

    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("serves the OpenAPI spec at GET /spec.json", async () => {
    const app = buildApp();
    server = app.server;
    const baseUrl = await listen(server);

    const response = await fetch(`${baseUrl}/spec.json`);
    const spec = (await response.json()) as { paths: Record<string, unknown> };

    expect(response.status).toBe(200);
    expect(spec.paths).toHaveProperty("/suggestions");
  });
});
