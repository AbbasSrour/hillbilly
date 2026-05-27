# Build stage: monorepo root context
FROM oven/bun:1-alpine AS build

WORKDIR /app

# Install dependencies (bun workspaces need full monorepo)
COPY package.json bun.lock bunfig.toml ./

# Copy workspace package manifests for dependency resolution
COPY apps/backend/package.json ./apps/backend/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/templates/package.json ./packages/templates/

RUN bun install --frozen-lockfile

# Copy full source
COPY . .

# Build only the backend workspace
RUN bun run --filter backend build

# Production stage
FROM oven/bun:1-alpine AS runner

ARG PORT=3000
ENV PORT=$PORT
ENV NODE_ENV=production

# Run as non-root
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy only what's needed at runtime
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/package.json ./

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE $PORT

CMD ["bun", "dist/main.js"]
