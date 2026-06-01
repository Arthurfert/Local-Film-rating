#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Change directory to the script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================="
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting Update"
echo "=========================================================="

# 1. Pull the latest base Node.js Alpine image from Docker Hub
echo "[1/4] Pulling latest node:20-alpine base image..."
docker pull node:20-alpine

# 2. Rebuild the container image without cache to apply package upgrades
echo "[2/4] Rebuilding application container (no-cache)..."
docker compose build --pull --no-cache

# 3. Re-create and restart the service in the background
echo "[3/4] Restarting container with updated image..."
docker compose up -d

# 4. Prune unused and dangling images to save disk space
echo "[4/4] Pruning dangling images..."
docker image prune -f

echo "=========================================================="
echo "$(date '+%Y-%m-%d %H:%M:%S') - Update Finished"
echo "=========================================================="
