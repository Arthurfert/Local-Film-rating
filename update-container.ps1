# PowerShell equivalent of update-container.sh

$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

Write-Host "=========================================================="
Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Starting Update"
Write-Host "=========================================================="

Write-Host "[1/4] Pulling latest node:20-alpine base image..."
docker pull node:20-alpine

Write-Host "[2/4] Rebuilding application container (no-cache)..."
docker compose build --pull --no-cache

Write-Host "[3/4] Restarting container with updated image..."
docker compose up -d

Write-Host "[4/4] Pruning dangling images..."
docker image prune -f

Write-Host "=========================================================="
Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Update Finished"
Write-Host "=========================================================="
