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

echo "[Miki Player] Generating Info.plist..."
cat << 'EOF' > "Miki Player.app/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Miki Player</string>
    <key>CFBundleIdentifier</key>
    <string>com.miki.player</string>
    <key>CFBundleName</key>
    <string>Miki Player</string>
    <key>CFBundleDisplayName</key>
    <string>Miki Player</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.0.0</string>
    <key>CFBundleVersion</key>
    <string>20261030</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSRequiresAquaSystemAppearance</key>
    <false/>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
        <key>NSAllowsLocalNetworking</key>
        <true/>
    </dict>
</dict>
</plist>
EOF

echo "[Miki Player] Copying embedded dist web assets..."
rm -rf "Miki Player.app/Contents/Resources/dist"
cp -r dist "Miki Player.app/Contents/Resources/dist"

echo "[Miki Player] Installing native executable binary..."
cp MikiPlayer "Miki Player.app/Contents/MacOS/Miki Player"
chmod +x "Miki Player.app/Contents/MacOS/Miki Player"

echo "[Miki Player] Syncing to Build/MacOs..."
mkdir -p "Build/windows" "Build/MacOs" "Build/Android" "Build/ios" "Build/Linux"
touch "Build/windows/.gitkeep" "Build/Android/.gitkeep" "Build/ios/.gitkeep" "Build/Linux/.gitkeep"

rm -rf "Build/MacOs/Miki Player.app"
cp -R "Miki Player.app" "Build/MacOs/Miki Player.app"
ditto -c -k --sequesterRsrc --keepParent "Build/MacOs/Miki Player.app" "Build/MacOs/Miki-Player-macOS.zip"

# Clean up root working directory artifacts so root stays pristine
rm -rf "Miki Player.app" "MikiPlayer"

echo "✅ [Miki Player] Miki Player.app ready in Build/MacOs/! Double-click to run or open 'Build/MacOs/Miki Player.app'."
