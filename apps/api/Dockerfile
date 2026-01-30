# FROM node:18 AS base # This is the original Dockerfile
FROM node:22 AS base

RUN npm i -g pnpm@9.15.4

FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
# Skip Prisma postinstall to avoid binary generation issues
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
# Generate Prisma client for the target platform (linux/amd64)
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
ENV PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
# Use npx to avoid pnpm's recursive execution issues
RUN npx --yes prisma@6.13.0 generate --schema=apps/api/prisma/schema.prisma
RUN pnpm run build:api

FROM base AS production
WORKDIR /app

# Copy package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Copy prisma schema first (needed for install to trigger prisma generate)
COPY --from=build /app/apps/api/prisma ./apps/api/prisma

# Install all dependencies
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
RUN pnpm install --frozen-lockfile --ignore-scripts

# Generate Prisma client with explicit schema path
RUN cd apps/api && npx --yes prisma@6.13.0 generate --schema=./prisma/schema.prisma

# Copy built application to the api workspace location
COPY --from=build /app/apps/api/dist/ ./apps/api/dist/

# Set working directory to api folder where node_modules resolution works
WORKDIR /app/apps/api

CMD [ "node", "dist/src/main" ]
