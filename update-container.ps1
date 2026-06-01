# -------------------------------------------------------------
# PowerShell script to automate security updates for Local-Film-rating
# -------------------------------------------------------------

# Change directory to the script's location
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Output "=========================================================="
Write-Output "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Starting Update"
Write-Output "=========================================================="

# 1. Pull the latest base Node.js Alpine image from Docker Hub
Write-Output "[1/4] Pulling latest node:20-alpine base image..."
docker pull node:20-alpine

# 2. Rebuild the container image without cache to apply package upgrades
Write-Output "[2/4] Rebuilding application container (no-cache)..."
docker compose build --pull --no-cache

# 3. Re-create and restart the service in the background
Write-Output "[3/4] Restarting container with updated image..."
docker compose up -d

# 4. Prune unused and dangling images to save disk space
Write-Output "[4/4] Pruning dangling images..."
docker image prune -f

Write-Output "=========================================================="
Write-Output "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Update Finished"
Write-Output "=========================================================="
