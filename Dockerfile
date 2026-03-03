# Multi-stage Dockerfile for content-ms (Alpine base)
FROM node:20-alpine AS builder

WORKDIR /app

# Install all deps (including dev deps) to build the project
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# --- Production stage ---
FROM node:20-alpine

# Install CA certificates so the runtime can validate TLS endpoints (R2, external URLs)
RUN apk add --no-cache ca-certificates bash && update-ca-certificates

WORKDIR /app

# Copy built output and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# App uses HTTP port and a TCP port defined in env (3004 and 3005 by default)
EXPOSE 3004
EXPOSE 3005

# Start the compiled Nest app
CMD ["node", "dist/main"]