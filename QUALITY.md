# Quality gate

This repo's backend (`api/`) was built largely with an AI coding agent. The
gate below exists to compensate for the main risk that comes with that:
plausible-looking code with untested edge cases (a fallback branch that
never actually triggers, an error path that silently returns the wrong
thing). It is encoded machine-readably in [`quality-gates.json`](./quality-gates.json)
so it can be checked in CI, not just asserted in prose here.

## The rule

**Every feature or change must ship with 100% coverage** (statements,
branches, functions, lines — `vitest --coverage`, v8 provider) **using the
test type(s) appropriate to the layer(s) it touches.** A PR that adds code
without a test exercising every branch of it does not pass, whether the
code was written by a human or an agent — 100% coverage doesn't prove
correctness, but it does prove every line and branch was deliberately
exercised at least once, which is the minimum bar for AI-generated code
before it can be trusted.

Run it locally:

```bash
cd api
bun run typecheck      # tsc --noEmit
bun run lint            # biome check .
bun run test:coverage  # vitest run --coverage, fails under 100%
```

## Test taxonomy

The four layers of `api/` (`domain/data/infra/presentation`, see the root
[`CLAUDE.md`](./CLAUDE.md)) each call for a different kind of test:

| Layer | Test type | What it means here | Location |
|---|---|---|---|
| `domain` | **unit** | Pure functions/types (enum guards, models). No mocks needed — there's nothing to mock. | `api/tests/unit/domain/` |
| `data` | **unit** | Usecase orchestration (the LLM → cache → static fallback chain) tested against hand-written mocks of its `data/protocols/*` ports. Never touches a real DB or network. | `api/tests/unit/data/` |
| `infra` | **integration** | Concrete adapters tested against something close to the real dependency: a real in-memory/tmp SQLite file through Drizzle, a real `ai-sdk` `generateText` call against a `MockLanguageModelV4` (no network, but the real ai-sdk parsing/validation path). | `api/tests/integration/` |
| `presentation` | **component** + **e2e** | Component: the oRPC router invoked in-process via `@orpc/server`'s `call()`, no HTTP, one fake usecase. e2e: a real `node:http` server, a real SQLite DB, a fake `LlmSuggestionGateway` (the one deliberate seam — see below), driven with real `fetch()` calls. | `api/tests/component/`, `api/tests/e2e/` |

A handful of small infra/presentation pieces (`infra/config/env.ts`,
`infra/logging/console-logger.ts`,
`infra/fallback/static-fallback-message-provider.ts`,
`presentation/http/rate-limiter.ts`, `presentation/http/client-ip.ts`,
`presentation/http/error-mapper.ts`) are pure/synchronous enough that a
plain unit test covers them fully (their integration/e2e-level wiring is
still exercised where required — the rate limiter and client-IP resolver
both have a dedicated `429` assertion in the e2e suite) — see
`requiredTestTypes` in `quality-gates.json` for the authoritative
per-layer minimum, not a per-file mandate.

### Why the e2e tests fake the LLM gateway instead of mocking HTTP

`tests/integration/infra/llm/openai-suggestion-gateway.spec.ts` already
covers the real `ai-sdk` request/response parsing path against a
`MockLanguageModelV4`. Re-mocking OpenAI's wire format again at the e2e
layer would just duplicate that coverage while making the e2e suite
brittle to `ai-sdk`-internal changes. The e2e suite instead fakes the
`LlmSuggestionGateway` port directly (same technique as the unit tests,
just wired through a real HTTP server + real DB) — the goal there is
proving the *whole app* (routing, validation, fallback chain, persistence,
error mapping) works together, not re-proving the OpenAI adapter.

## Exceptions

A small number of files are excluded from the coverage requirement,
each with a stated reason in `quality-gates.json`
(`coverage.excludedFiles`): drizzle-generated migrations, the declarative
Drizzle schema, and the two process-entrypoint scripts (`main.ts`,
`migrate.ts`) whose side effects (opening a real port/DB, calling
`process.exit`) make them unit-untestable by nature — their logic is
duplicated in a testable form elsewhere (`presentation/factories/`,
`presentation/http/server.ts`, `infra/config/env.ts`). Adding a new
exclusion requires a stated reason and is reviewed like any other
quality-gate change.

## Error handling: no raw `try`/`catch`

Fallible operations (LLM calls, DB reads/writes, env parsing) use
[`better-result`](https://better-result.dev) instead of `try`/`catch`:
`Result<T, E>`, `TaggedError` for typed errors, `Result.tryPromise` to wrap
a throwing call, `Result.match`/`Result.isOk` to branch on the outcome.
This is enforced by convention/review, not by a lint rule — see the
"Error handling" section of `CLAUDE.md` for the pattern and the one
sanctioned exception (unhandled defects surfacing as oRPC's own generic
500, never a raw `try`/`catch` in application code).

## CI

CI must run `bun run typecheck`, `bun run lint`, and `bun run test:coverage`
on every PR touching `api/` and block merge if any of them fails.
