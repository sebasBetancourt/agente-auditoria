# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json tsup.config.ts ./
COPY src/ ./src/

RUN pnpm build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-slim AS production

# Dependencias del sistema para Puppeteer / Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    libasound2 \
    libxrandr2 \
    libxss1 \
    libgtk-3-0 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Instalar pnpm en la imagen de producción
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# Copiar el build compilado
COPY --from=builder /app/dist ./dist

# Directorio persistente para reportes
RUN mkdir -p reports

EXPOSE 3000

CMD ["node", "dist/server.js"]
