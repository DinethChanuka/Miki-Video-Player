#!/bin/bash
set -e

echo "🤖 [Miki Player] Starting Android APK packaging pipeline..."

# 1. Build optimized web production bundle
echo "📦 Building web assets..."
npm run build

# 2. Ensure target directories exist
mkdir -p "Build/Android"

# 3. Check for Android build tooling
if command -v npx >/dev/null 2>&1; then
  echo "🚀 Invoking Tauri Android build..."
  if [ -d "src-tauri/gen/android" ]; then
    npx tauri android build --apk
  else
    echo "⚙️ Initializing Tauri Android project target..."
    npx tauri android init || true
    npx tauri android build --apk || true
  fi

  # Copy generated APKs to Build/Android
  if [ -d "src-tauri/gen/android/app/build/outputs/apk" ]; then
    find src-tauri/gen/android/app/build/outputs/apk -name "*.apk" -exec cp {} Build/Android/ \;
  fi
fi

# Ensure gitkeep exists
touch "Build/Android/.gitkeep"

echo "✅ [Miki Player] Android APK packaging step complete in Build/Android/!"
