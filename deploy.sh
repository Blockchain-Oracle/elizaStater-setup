#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define directories relative to the script's location
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
PLUGIN_DIR="$SCRIPT_DIR/eliza-plugin-hedera"
STARTER_DIR="$SCRIPT_DIR/eliza-starter"

# --- Build Hedera Plugin ---
echo "Building eliza-plugin-hedera..."
cd "$PLUGIN_DIR"
pnpm install
pnpm run build
echo "eliza-plugin-hedera built successfully."

# --- Setup and Start Eliza Starter ---
echo "Setting up eliza-starter..."
cd "$STARTER_DIR"
# Clean previous build/installation if necessary (optional)
# ./scripts/clean.sh
pnpm install  # This will link the local plugin dependency
pnpm run build
echo "eliza-starter built successfully."
echo "Deployment script finished."

