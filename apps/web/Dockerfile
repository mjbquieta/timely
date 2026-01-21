# Single-stage build for Vue.js attendance app
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

RUN rm -rf .env

# Build the application
RUN pnpm run build

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose port 5173
EXPOSE 5173

# Start the application using the startup script
CMD ["/start.sh", "pnpm", "run", "preview", "--host", "0.0.0.0", "--port", "5173"]