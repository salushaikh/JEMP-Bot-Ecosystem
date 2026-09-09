# ==============================================================================
# JOBLESS EMPIRE (JEMP) PRODUCTION DOCKERFILE
# ==============================================================================

# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source files
COPY . .

# Build Vite frontend and bundled CommonJS server
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi && npm cache clean --force

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/schema.sql ./dist/schema.sql

# Expose port 3000
EXPOSE 3000

# Run JEMP Unified Discord Bot Ecosystem
CMD ["node", "dist/server.cjs"]
