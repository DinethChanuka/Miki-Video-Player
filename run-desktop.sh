#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Ensure the Vite development server is active
if ! curl -s http://localhost:1420/ >/dev/null 2>&1; then
  echo "Starting AetherPlayer server..."
  npm run dev >/dev/null 2>&1 &
  sleep 2
fi

echo "Launching AetherPlayer dedicated desktop application window..."
exec /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --app="http://localhost:1420/" \
  --window-size=1280,720 \
  --user-data-dir=/tmp/aether-player-profile
