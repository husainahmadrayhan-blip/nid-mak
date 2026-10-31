@echo off
setlocal EnableExtensions

title NID-MAK - Auto Gotenberg Port
cd /d "%~dp0"
if errorlevel 1 (
    echo [ERROR] Cannot open NID-MAK project folder.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo       NID-MAK AUTO GOTENBERG STARTER
echo ==========================================
echo.

where docker >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Docker command not found. Start Docker Desktop first.
    pause
    exit /b 1
)
docker info >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Docker Desktop is not ready. Start Docker Desktop and retry.
    pause
    exit /b 1
)

echo [1/4] Trying ports 3200 through 3299 until Docker accepts one...

set "PDF_PORT="
for /L %%P in (3200,1,3299) do (
    if not defined PDF_PORT (
        docker rm -f nidmak-gotenberg-auto >nul 2>nul
        echo     Testing port %%P...
        docker run -d --name nidmak-gotenberg-auto --restart unless-stopped -p 127.0.0.1:%%P:3000 gotenberg/gotenberg:8-chromium >nul
        if not errorlevel 1 set "PDF_PORT=%%P"
    )
)

if not defined PDF_PORT (
    echo [ERROR] Docker could not allocate any port from 3200 to 3299.
    echo Check Docker containers and port usage, then retry.
    pause
    exit /b 1
)

echo.
echo [OK] Docker allocated port: %PDF_PORT%

echo.
echo [2/4] Waiting for Gotenberg health check...
powershell -NoProfile -Command "$u='http://127.0.0.1:%PDF_PORT%/health'; for($i=0;$i -lt 30;$i++){try{$r=Invoke-RestMethod -Uri $u -TimeoutSec 3; if($r.status -eq 'up'){Write-Output 'Gotenberg health: UP'; exit 0}}catch{}; Start-Sleep -Seconds 2}; Write-Error 'Gotenberg health check timed out'; exit 1"
if errorlevel 1 (
    echo [ERROR] Gotenberg did not become healthy. Recent logs:
    docker logs --tail 40 nidmak-gotenberg-auto
    pause
    exit /b 1
)

echo.
echo [3/4] Setting NID-MAK PDF service URL...
set "PDF_SERVICE_URL=http://127.0.0.1:%PDF_PORT%"
echo PDF_SERVICE_URL=%PDF_SERVICE_URL%

echo.
echo [4/4] Starting NID-MAK server...
python server.py
if errorlevel 1 (
    echo.
    echo [ERROR] NID-MAK server exited with an error.
    pause
    exit /b 1
)

endlocal
