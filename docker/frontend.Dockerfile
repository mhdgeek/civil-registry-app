# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY frontend/ ./

# Variables d'environnement pour la build
ARG REACT_APP_API_URL=http://localhost:5000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build l'application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=builder /app/build /usr/share/nginx/html

# Configurer Nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
