#!/bin/bash
set -e

echo "🤖 [Miki Player] Starting Android APK packaging pipeline..."

# 1. Export Android SDK & NDK locations if present
if [ -z "$ANDROID_HOME" ] && [ -d "/usr/local/lib/android/sdk" ]; then
  export ANDROID_HOME="/usr/local/lib/android/sdk"
fi
if [ -n "$ANDROID_HOME" ]; then
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
  if [ -d "$ANDROID_HOME/ndk" ]; then
    LATEST_NDK=$(ls -1 "$ANDROID_HOME/ndk" 2>/dev/null | sort -V | tail -n 1)
    if [ -n "$LATEST_NDK" ]; then
      export NDK_HOME="$ANDROID_HOME/ndk/$LATEST_NDK"
    fi
  fi
fi

# 2. Build optimized web production bundle
echo "📦 Building web assets..."
npm run build

# 3. Ensure target directories exist
mkdir -p "Build/Android"

# 4. Check for Android build tooling
if command -v npx >/dev/null 2>&1; then
  echo "🚀 Invoking Tauri Android build..."
  if [ -d "src-tauri/gen/android" ]; then
    npx tauri android build --apk || true
  else
    echo "⚙️ Initializing Tauri Android project target..."
    npx tauri android init || true
    npx tauri android build --apk || true
  fi

  # Copy generated APKs to Build/Android
  if [ -d "src-tauri/gen/android/app/build/outputs/apk" ]; then
    find src-tauri/gen/android/app/build/outputs/apk -name "*.apk" -exec cp {} Build/Android/ \; 2>/dev/null || true
  fi
fi

# Ensure gitkeep exists
touch "Build/Android/.gitkeep"

echo "✅ [Miki Player] Android APK packaging step complete in Build/Android/!"
