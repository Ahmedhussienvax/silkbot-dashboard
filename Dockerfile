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
# MUST include .next/standalone and .next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Next.js 15/16 Standalone Fix: Assets need to be accessible in the project subfolder
# The subfolder name 'silkbot-dashboard' comes from package.json name
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./silkbot-dashboard/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./silkbot-dashboard/public

# Also keep them at root for standard compatibility
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is the entrypoint for standalone mode
CMD ["node", "server.js"]
