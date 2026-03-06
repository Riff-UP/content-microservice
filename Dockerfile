# Multi-stage Dockerfile for content-ms
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Forzar compilación completa (sin caché incremental)
RUN rm -f tsconfig.tsbuildinfo

RUN npm run build

# Verificar que dist/main.js existe
RUN test -f dist/main.js || (echo "ERROR: dist/main.js no generado" && ls -la dist/ && exit 1)

# Instalar solo prod deps en el mismo entorno (Debian) para compatibilidad de binarios nativos
RUN npm install --omit=dev

# --- Production stage ---
FROM node:20-slim

# libvips requerido por sharp en runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libvips \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3004
EXPOSE 3005

CMD ["node", "dist/main"]

