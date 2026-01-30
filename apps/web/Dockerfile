# Multi-stage build for Vue.js attendance app
FROM node:22 AS base

RUN npm i -g pnpm@9.15.4

FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

# Install rollup binary for linux x64 (required for Vite build)
RUN pnpm add -D @rollup/rollup-linux-x64-gnu --filter=attendance-app

RUN rm -rf apps/web/.env

# Build only the web application
RUN pnpm run build:web

FROM nginx:alpine AS production

# Copy built files to nginx
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy startup script for runtime env config
COPY apps/web/start.sh /start.sh
RUN chmod +x /start.sh

# Update start.sh to work with nginx paths
RUN sed -i 's|/app/dist|/usr/share/nginx/html|g' /start.sh

EXPOSE 80

# Use start.sh to generate env-config.js then start nginx
CMD ["/start.sh", "nginx", "-g", "daemon off;"]
