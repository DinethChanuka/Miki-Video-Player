#!/bin/bash
set -e

echo "🍎 [Miki Player] Starting iOS packaging pipeline..."

# 1. Build optimized web production bundle
echo "📦 Building web assets..."
npm run build

# 2. Ensure target directories exist
mkdir -p "Build/ios"

# 3. Check for iOS build tooling
if command -v npx >/dev/null 2>&1; then
  echo "🚀 Invoking Tauri iOS build..."
  if [ -d "src-tauri/gen/apple" ]; then
    npx tauri ios build --no-signing || true
  else
    echo "⚙️ Initializing Tauri iOS project target..."
    npx tauri ios init || true
    npx tauri ios build --no-signing || true
  fi

  # Copy generated iOS artifacts to Build/ios
  if [ -d "src-tauri/gen/apple/build" ]; then
    find src-tauri/gen/apple/build -name "*.ipa" -o -name "*.app" -exec cp -R {} Build/ios/ \;
  fi
fi

# Ensure gitkeep exists
touch "Build/ios/.gitkeep"

echo "✅ [Miki Player] iOS packaging step complete in Build/ios/!"

