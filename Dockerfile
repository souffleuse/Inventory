# ─────────────────────────────────────────
# Stage 1 : build the React app
# ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─────────────────────────────────────────
# Stage 2 : production image
# ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Only prod dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Server + built frontend
COPY server.cjs ./
COPY --from=builder /app/dist ./dist

# Data directory (will be overridden by volume)
RUN mkdir -p data

ENV PORT=80
EXPOSE 80

CMD ["node", "server.cjs"]
