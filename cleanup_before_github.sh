#!/bin/bash
# Usage: ./cleanup_before_github.sh --force
set -euo pipefail

FORCE=false
if [ "${1:-}" = "--force" ] || [ "${1:-}" = "-f" ]; then
  FORCE=true
fi

echo "BobCI Security Cleanup Script"
echo "============================="

if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
  echo "Error: Run from the bobci directory"
  exit 1
fi

paths=(
  "backend/.env"
  "backend/bobci.db"
  "backend/Dict[str"
  "backend/str"
  "backend/venv"
  "frontend/node_modules"
  "frontend/.next"
  "bob_sessions/bob_task_may-16-2026_3-45-54-pm.md"
  "bob_sessions/Screenshot 2026-05-16 154716.png"
)

removed=0
for path in "${paths[@]}"; do
  if [ -e "$path" ]; then
    if [ "$FORCE" = true ]; then
      rm -rf "$path"
      echo "Removed: $path"
      removed=$((removed + 1))
    else
      echo "Found (use --force): $path"
    fi
  fi
done

if [ "$FORCE" = false ]; then
  echo ""
  echo "Run: ./cleanup_before_github.sh --force"
  exit 0
fi

echo ""
echo "Cleanup complete. Removed $removed item(s)."
echo "Next: cp backend/.env.example backend/.env && cp frontend/.env.local.example frontend/.env.local"
