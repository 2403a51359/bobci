# BobCI - Cleanup Script for GitHub Upload (non-interactive with -Force)
param(
    [switch]$Force
)

Write-Host "BobCI Security Cleanup Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "Error: Run from the bobci directory" -ForegroundColor Red
    exit 1
}

$pathsToRemove = @(
    "backend/.env",
    "backend/bobci.db",
    "backend/Dict[str",
    "backend/str",
    "backend/venv",
    "frontend/node_modules",
    "frontend/.next",
    "bob_sessions/bob_task_may-16-2026_3-45-54-pm.md",
    "bob_sessions/Screenshot 2026-05-16 154716.png"
)

$removed = 0
foreach ($path in $pathsToRemove) {
    if (Test-Path $path) {
        if ($Force) {
            Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "Removed: $path" -ForegroundColor Green
            $removed++
        } else {
            Write-Host "Found (use -Force to remove): $path" -ForegroundColor Yellow
        }
    }
}

if (-not $Force) {
    Write-Host ""
    Write-Host "Run: .\cleanup_before_github.ps1 -Force" -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "Cleanup complete. Removed $removed item(s)." -ForegroundColor Green
Write-Host "Next: cp backend/.env.example backend/.env && cp frontend/.env.local.example frontend/.env.local" -ForegroundColor Cyan
