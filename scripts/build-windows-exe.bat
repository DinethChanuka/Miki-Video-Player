@echo off
REM =========================================================================
REM  Miki Player - Local Windows .EXE Build Script
REM =========================================================================

echo [Miki Player] Checking Node.js and Rust environments...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js / npm not found! Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

where cargo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Rust / Cargo not found! Please install Rust from https://rustup.rs
    pause
    exit /b 1
)

echo [Miki Player] Installing frontend dependencies...
call npm install

echo [Miki Player] Compiling TypeScript & building React production bundle...
call npm run build

echo [Miki Player] Building standalone Windows executable with Tauri...
call npx tauri build

echo =========================================================================
echo  Build Complete! Windows .exe is located in:
echo    src-tauri\target\release\
echo    src-tauri\target\release\bundle\nsis\
echo =========================================================================
pause

