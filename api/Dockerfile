# syntax=docker/dockerfile:1

# Node.js is the actual runtime (see CLAUDE.md → "Stack"). Package
# management inside this image uses pnpm rather than the project's local
# Bun tooling.
#
# Pinned to Node 22, not the documented "Node.js v20+" minimum — Node 20
# segfaults on `new Database(...)` with the installed better-sqlite3@13
# (its `NAPI_VERSION=10` binding isn't reliably supported by Node 20's
# N-API implementation; reproduced identically with both the package's
# bundled prebuilt binary and a fresh from-source build, ruling out a bad
# prebuild). Node 22 doesn't have this problem. `engines.node` and the
# root README have been updated to match — this is a real constraint, not
# just a Docker-image choice.
#
# Alpine (musl libc, not glibc) for a smaller image — better-sqlite3 ships
# a musl-specific prebuilt binary (linuxmusl-{arm64,x64}.node) alongside
# the glibc ones, so this doesn't need its own from-source build; verified
# end-to-end the same way the Node 20 issue above was.

FROM node:22-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN pnpm run build

FROM node:22-alpine AS prod-deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    DB_PATH=/app/data/smash.db \
    PORT=3000

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
# migrate.ts resolves its migrations folder relative to cwd (./src/infra/db/migrations),
# not to dist/ — see src/infra/db/migrate.ts. Only the (small) SQL/meta files are needed,
# not the rest of src/, which was already compiled into dist/ above.
COPY src/infra/db/migrations ./src/infra/db/migrations

RUN mkdir -p /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3000)+'/spec.json',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Apply any pending migrations, then start the server — see api/CLAUDE.md
# "Commands" for the equivalent bare `bun run db:migrate && bun run start`.
CMD ["sh", "-c", "node dist/infra/db/migrate.js && node dist/presentation/http/main.js"]
