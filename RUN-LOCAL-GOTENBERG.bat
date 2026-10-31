@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo NID-MAK - Local Gotenberg + Editor
echo ==========================================
echo.

where docker >nul 2>nul
if errorlevel 1 (
  echo ERROR: Docker Desktop is not installed or not in PATH.
  echo Install and start Docker Desktop, then run this file again.
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo ERROR: Docker Desktop is not running.
  echo Open Docker Desktop and wait until it says Engine running.
  pause
  exit /b 1
)

docker inspect nidmak-gotenberg >nul 2>nul
if errorlevel 1 (
  echo Downloading and starting Gotenberg...
  docker run -d --name nidmak-gotenberg --restart unless-stopped -p 127.0.0.1:3000:3000 gotenberg/gotenberg:8-chromium
  if errorlevel 1 (
    echo ERROR: Could not start Gotenberg.
    pause
    exit /b 1
  )
) else (
  docker start nidmak-gotenberg >nul
)

echo.
echo Waiting for Gotenberg...
powershell -NoProfile -Command "$ok=$false; for($i=0;$i -lt 30;$i++){try{$r=Invoke-RestMethod 'http://127.0.0.1:3000/health' -TimeoutSec 2;if($r.status -eq 'up'){$ok=$true;break}}catch{};Start-Sleep -Seconds 2};if(-not $ok){exit 1}"
if errorlevel 1 (
  echo ERROR: Gotenberg did not become ready. Check: docker logs nidmak-gotenberg
  pause
  exit /b 1
)

set PDF_SERVICE_URL=http://127.0.0.1:3000
set PDF_SERVICE_TOKEN=
echo Gotenberg is ready at http://127.0.0.1:3000
echo Starting the editor...
echo.
python server.py
if errorlevel 1 (
  echo.
  echo ERROR: The editor stopped with an error.
)
pause
