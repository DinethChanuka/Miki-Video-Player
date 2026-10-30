#!/usr/bin/env python3
"""
Miki Player - Standalone Borderless / Undecorated Window Launcher
"""
import os
import sys
import subprocess
import time
import urllib.request

APP_URL = "http://localhost:1420/"

def ensure_server():
    try:
        req = urllib.request.urlopen(APP_URL, timeout=1)
        if req.status == 200:
            return
    except Exception:
        pass
    print("[Miki Player] Starting Vite server...")
    subprocess.Popen(["npm", "run", "dev"])
    for _ in range(20):
        time.sleep(0.5)
        try:
            req = urllib.request.urlopen(APP_URL, timeout=1)
            if req.status == 200:
                break
        except Exception:
            pass

def main():
    ensure_server()
    dir_path = os.path.dirname(os.path.abspath(__file__))
    native_binary = os.path.join(dir_path, "MikiPlayer")
    if os.path.exists(native_binary) and os.access(native_binary, os.X_OK):
        print("[Miki Player] Starting native Cocoa undecorated window...")
        subprocess.Popen([native_binary])
    else:
        subprocess.Popen([os.path.join(dir_path, "run-desktop.sh")])

if __name__ == "__main__":
    main()
