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

# IMPORTANT: No build-time secrets allowed to prevent embedding in Docker layers.
# Next.js standalone mode will use runtime ENVs for Server Components.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permissions
RUN chown nextjs:nodejs /app

# Copy essential standalone files
# Maintain the full path to avoid pathing mismatch and match the server expectations
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# In Next.js 15, the standalone output might contain a subfolder 'dashboard' or the package name
# We ensure the assets are also there for internal resolution
RUN mkdir -p silkbot-dashboard/.next && \
    ln -s ../.next/static silkbot-dashboard/.next/static && \
    ln -s ../public silkbot-dashboard/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the server from the root of the standalone folder
# Pathing Fix: If server.js is at root, call it directly.
# If built with base-path/monorepo, it might be in a subfolder, 
# but Next standalone should have it at root of standalone/.
CMD ["node", "server.js"]

