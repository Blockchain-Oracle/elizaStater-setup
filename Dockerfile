# Use Node.js v22 as the base image
FROM --platform=linux/amd64 node:22-slim

# Install build essentials for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Set non-interactive mode for pnpm
ENV PNPM_HOME=/root/.local/share/pnpm
ENV NPM_CONFIG_YES=true
ENV PNPM_CONFIG_AUTO_INSTALL_PEERS=true
ENV CI=true

# Set environment variables for tokenizers
ENV NODE_OPTIONS="--experimental-fetch"
ENV TOKENIZERS_PARALLELISM=false
ENV DISABLE_TOKENIZERS_NATIVE_LIBRARIES=true

# Set Docker environment variable
ENV DOCKER_ENVIRONMENT=true
ENV DAEMON_PROCESS=true

# Set Render-specific environment variables
ENV HOST=0.0.0.0
ENV PORT=3000

# Set working directory
WORKDIR /app

# Copy package files for both components
COPY eliza-plugin-hedera/package.json ./eliza-plugin-hedera/
COPY eliza-starter/package.json ./eliza-starter/

# Copy source code
COPY eliza-plugin-hedera ./eliza-plugin-hedera
COPY eliza-starter ./eliza-starter

# Build the Hedera plugin
WORKDIR /app/eliza-plugin-hedera
RUN pnpm install --force
RUN pnpm run build

# Build the Eliza starter (which includes the local plugin dependency)
WORKDIR /app/eliza-starter
RUN pnpm install --force

# Build better-sqlite3 which needs special handling
# Note: Each RUN command starts in the WORKDIR (/app/eliza-starter)
RUN cd node_modules/better-sqlite3 && npm run build-release

# Build the starter application (runs in /app/eliza-starter)
RUN pnpm run build

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN mkdir -p /app/eliza-starter/data && chown -R appuser:appuser /app

# Expose port 3000
EXPOSE 3000

# Switch to non-root user
USER appuser
# Command to run the application with proper signal handling
CMD ["pnpm", "run", "start"] 