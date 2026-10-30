#!/bin/bash
set -e

echo "[Miki Player] Building web assets..."
npm run build

echo "[Miki Player] Compiling native Swift Cocoa borderless binary..."
swiftc -O -o MikiPlayer MikiPlayerApp.swift -framework Cocoa -framework WebKit

echo "[Miki Player] Generating macOS Application bundle structure..."
mkdir -p "Miki Player.app/Contents/MacOS" "Miki Player.app/Contents/Resources" AppIcon.iconset

echo "[Miki Player] Rendering native AppIcon.icns..."
sips -z 16 16     public/logo.png --out AppIcon.iconset/icon_16x16.png >/dev/null 2>&1
sips -z 32 32     public/logo.png --out AppIcon.iconset/icon_16x16@2x.png >/dev/null 2>&1
sips -z 32 32     public/logo.png --out AppIcon.iconset/icon_32x32.png >/dev/null 2>&1
sips -z 64 64     public/logo.png --out AppIcon.iconset/icon_32x32@2x.png >/dev/null 2>&1
sips -z 128 128   public/logo.png --out AppIcon.iconset/icon_128x128.png >/dev/null 2>&1
sips -z 256 256   public/logo.png --out AppIcon.iconset/icon_128x128@2x.png >/dev/null 2>&1
sips -z 256 256   public/logo.png --out AppIcon.iconset/icon_256x256.png >/dev/null 2>&1
sips -z 512 512   public/logo.png --out AppIcon.iconset/icon_256x256@2x.png >/dev/null 2>&1
sips -z 512 512   public/logo.png --out AppIcon.iconset/icon_512x512.png >/dev/null 2>&1
sips -z 1024 1024 public/logo.png --out AppIcon.iconset/icon_512x512@2x.png >/dev/null 2>&1
iconutil -c icns AppIcon.iconset -o "Miki Player.app/Contents/Resources/AppIcon.icns"
rm -rf AppIcon.iconset

echo "[Miki Player] Copying embedded dist web assets..."
rm -rf "Miki Player.app/Contents/Resources/dist"
cp -r dist "Miki Player.app/Contents/Resources/dist"
cp MikiPlayer "Miki Player.app/Contents/MacOS/MikiPlayerBinary"
chmod +x "Miki Player.app/Contents/MacOS/MikiPlayerBinary"
chmod +x "Miki Player.app/Contents/MacOS/Miki Player"

echo "✅ [Miki Player] Miki Player.app standalone bundle ready! You can double-click it in Finder or run 'open \"Miki Player.app\"'."

