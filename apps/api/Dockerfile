# FROM node:18 AS base # This is the original Dockerfile
FROM --platform=linux/amd64 node:18 AS base

RUN npm i -g pnpm@9.15.4

FROM base AS dependencies

WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .
# pnpm install # This is the original Dockerfile
# Skip Prisma postinstall to avoid binary generation issues
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
# pnpm prisma generate # This is the original Dockerfile
# Generate Prisma client for the target platform (linux/amd64)
# Set environment variables for Prisma
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
ENV PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
# Use npx to avoid pnpm's recursive execution issues
RUN npx --yes prisma@6.13.0 generate
RUN pnpm run build

FROM base AS production
WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma

CMD [ "node", "dist/src/main" ]
