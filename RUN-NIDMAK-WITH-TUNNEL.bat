@echo off
setlocal
cd /d "%~dp0"
title NID-MAK Editor + Cloudflare Tunnel (Native Chrome Print)

where python >nul 2>nul
if errorlevel 1 (
  echo Python not found. Install Python and add it to PATH.
  pause
  exit /b 1
)
where cloudflared >nul 2>nul
if errorlevel 1 (
  echo cloudflared not found. Install it with:
  echo winget install --id Cloudflare.cloudflared
  pause
  exit /b 1
)

echo Starting NID-MAK Editor...
start "NID-MAK Editor" cmd /k "cd /d ""%~dp0"" && python server.py"
timeout /t 3 /nobreak >nul
echo Starting Cloudflare Quick Tunnel to local editor port 55627...
cloudflared tunnel --url http://127.0.0.1:55627
pause
