#!/bin/bash

# Exit on error
set -e

# Navigate to eliza-starter directory
cd eliza-starter

echo "Building better-sqlite3"
echo "Current directory: $(pwd)"
# Build better-sqlite3
cd node_modules/better-sqlite3 && \
    npm run build-release

# Navigate back to eliza-starter
cd ../../
echo "Navigated back to eliza-starter"
echo "Current directory: $(pwd)"

# Echo current time
echo "Starting application at: $(date)"

# Start the application
pnpm run start