#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# 1. Ensure Vite development server is active
if ! curl -s http://localhost:1420/ >/dev/null 2>&1; then
  echo "[Miki Player] Starting Vite development server..."
  npm run dev >/dev/null 2>&1 &
  for i in {1..20}; do
    if curl -s http://localhost:1420/ >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done
fi

# 2. Compile native borderless launcher if not yet compiled
if [ ! -f "./MikiPlayer" ]; then
  echo "[Miki Player] Compiling native borderless Cocoa app..."
  swiftc -O -o MikiPlayer MikiPlayerApp.swift -framework Cocoa -framework WebKit
fi

# 3. Launch native undecorated Miki Player window (Zero OS Titlebar / Traffic Lights)
echo "[Miki Player] Launching standalone undecorated application..."
exec ./MikiPlayer
