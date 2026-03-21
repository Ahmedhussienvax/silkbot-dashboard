# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Crucial for standalone mode in subdirectory: 
# Move assets into the standalone folder BEFORE copying to the final image
RUN mkdir -p .next/standalone/public && \
    cp -r public .next/standalone/ && \
    mkdir -p .next/standalone/.next/static && \
    cp -r .next/static .next/standalone/.next/

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Match the expected path from the Coolify start command: node .next/standalone/server.js
# We copy the already-fixed standalone folder from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone /app/.next/standalone

# Internal Resolution Symlink (Next.js 15 internal resolution for monorepos/subfolders)
# If server.js is at .next/standalone/server.js, it might expect assets relative to its internal app folder
RUN mkdir -p /app/.next/standalone/silkbot-dashboard/.next && \
    ln -s ../.next/static /app/.next/standalone/silkbot-dashboard/.next/static && \
    ln -s ../public /app/.next/standalone/silkbot-dashboard/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check setup for container-level monitoring
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Final Command Alignment: Matches DEPLOYMENT.md and Coolify convention
CMD ["node", ".next/standalone/server.js"]

