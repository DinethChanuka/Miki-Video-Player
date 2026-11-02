# syntax=docker/dockerfile:1.4
# =========================================================================
# Stage 1: Build Optimized Web Production Bundle
# =========================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install clean dependencies
RUN npm ci

# Copy full application source code
COPY . .

# Compile and bundle web distribution
RUN npm run build

# =========================================================================
# Stage 2: High-Performance Production Nginx Runtime
# =========================================================================
FROM nginx:1.27-alpine AS runner

# Configure custom Nginx with SPA routing, gzip compression & security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled web assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP web port
EXPOSE 80

# Health check to ensure Nginx is responding cleanly
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
