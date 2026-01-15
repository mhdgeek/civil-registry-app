# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json
COPY backend/package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

WORKDIR /app

# Installer curl pour health check
RUN apk add --no-cache curl

# Copier les dépendances
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copier le code source
COPY backend/ ./

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Exposer le port
EXPOSE 5000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Commande de démarrage
CMD ["node", "src/server.js"]
