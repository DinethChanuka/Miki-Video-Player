#!/usr/bin/env python3
"""
AetherPlayer Undecorated Window Launcher (Python)
Demonstrates borderless/undecorated window initialization (equivalent to Java setUndecorated(true))
"""
import os
import sys
import subprocess
import time
import urllib.request

SERVER_URL = "http://localhost:1420/"

def ensure_dev_server():
    try:
        urllib.request.urlopen(SERVER_URL, timeout=1)
        print("✓ AetherPlayer server is active at", SERVER_URL)
    except Exception:
        print("Starting AetherPlayer Vite dev server...")
        subprocess.Popen(["npm", "run", "dev"], cwd=os.path.dirname(os.path.abspath(__file__)))
        time.sleep(2)

def launch_undecorated_window():
    ensure_dev_server()
    print("Launching AetherPlayer in true borderless/undecorated mode...")
    
    # On macOS, launch standalone application process with custom size and profile
    chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if os.path.exists(chrome_path):
        args = [
            chrome_path,
            f"--app={SERVER_URL}",
            "--window-size=1280,720",
            "--user-data-dir=/tmp/aether-undecorated-profile"
        ]
        subprocess.Popen(args)
    else:
        import webbrowser
        webbrowser.open(SERVER_URL)

if __name__ == "__main__":
    launch_undecorated_window()
