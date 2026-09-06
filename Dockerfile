# ---------- build stage ----------
FROM node:22-alpine AS build

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source
COPY . .

# Build the Vite app
# Public Vite settings are supplied at build time without copying local env files.
# Override these arguments when deploying the API on a separate host.
ARG VITE_BACKEND_URL=/backend
ARG VITE_ASSET_BASE_URL=/backend
RUN --mount=type=secret,id=frontend_env,target=/app/.env npm run build

# ---------- runtime stage ----------
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV NGINX_PORT=80
ENV BACKEND_UPSTREAM=backend:8080

# Expose HTTP port
EXPOSE 80

# Use default nginx startup
CMD ["nginx", "-g", "daemon off;"]
