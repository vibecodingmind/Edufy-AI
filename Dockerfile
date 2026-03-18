# EDUC.AI Dockerfile for Railway Deployment
FROM node:20-alpine AS base

# Install dependencies for building native modules
RUN apk add --no-cache libc6-compat openssl

# Install Bun
RUN npm install -g bun

# ============================================
# Stage 1: Install dependencies
# ============================================
FROM base AS deps

WORKDIR /app

# Copy package files AND prisma schema (needed for prisma generate during install)
COPY package.json bun.lock* package-lock.json* yarn.lock* pnpm-lock.yaml* ./
COPY prisma ./prisma

# Install dependencies with Bun (this will run prisma generate via postinstall)
RUN bun install --frozen-lockfile

# ============================================
# Stage 2: Build the application
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (ensure it's generated)
RUN bunx prisma generate

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN bun run build

# ============================================
# Stage 3: Production runner
# ============================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
