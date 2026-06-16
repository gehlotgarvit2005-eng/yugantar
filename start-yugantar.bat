@echo off
title YUGANTAR - Premium Idea Gallery
cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Node.js not found! Please install Node.js from https://nodejs.org
    pause
    exit /b
)

echo ════════════════════════════════════════════
echo    YUGANTAR - Ideas Strong Like Mammoth
echo    Starting production server...
echo ════════════════════════════════════════════
echo.

:: Install deps only if node_modules missing
if not exist "node_modules\" (
    echo [1/2] Installing dependencies...
    call npm install --silent
) else (
    echo [1/2] Dependencies already installed ✓
)

:: Try ports 3000, 3001, 3002 in order
set PORT=3000
:checkport
netstat -ano | findstr ":%PORT% " >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set /a PORT=PORT+1
    if %PORT% GTR 3005 (
        echo ✗ All ports 3000-3005 are in use. Please close some applications.
        pause
        exit /b
    )
    goto checkport
)

echo [2/2] Starting server on http://localhost:%PORT%
echo.
start http://localhost:%PORT%
npx next start --port %PORT%
pause
