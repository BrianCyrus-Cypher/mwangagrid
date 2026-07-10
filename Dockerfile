# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package management files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build frontend and backend
RUN pnpm build

# Stage 2: Run the application
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only what we need from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/node_modules ./node_modules

# Expose the application port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/trpc/system.health || exit 1

# Start the application
CMD ["pnpm", "start"]
