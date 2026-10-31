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

REM Remove only the container managed by this automatic BAT.
docker rm -f nidmak-gotenberg-auto >nul 2>nul

echo [1/4] Finding an unused local port from 3200 to 3299...

set "PDF_PORT="
for /f %%P in ('powershell -NoProfile -Command "$ErrorActionPreference='SilentlyContinue'; foreach($p in  (3200..3299)) { $l=$null; try { $l=[System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any,$p); $l.Start(); $l.Stop(); Write-Output $p; exit 0 } catch { if($l){try{$l.Stop()}catch{}} } }; exit 1"') do (
    set "PDF_PORT=%%P"
    goto :port_found
)

echo [ERROR] No free port found in the range 3200-3299.
pause
exit /b 1

:port_found
echo [OK] Selected port: %PDF_PORT%

echo.
echo [2/4] Starting NID-MAK Gotenberg on port %PDF_PORT%...
docker run -d --name nidmak-gotenberg-auto --restart unless-stopped -p 127.0.0.1:%PDF_PORT%:3000 gotenberg/gotenberg:8-chromium
if errorlevel 1 (
    echo [ERROR] Could not start the Gotenberg container.
    pause
    exit /b 1
)

echo.
echo [3/4] Waiting for Gotenberg health check...
powershell -NoProfile -Command "$u='http://127.0.0.1:%PDF_PORT%/health'; for($i=0;$i -lt 30;$i++){try{$r=Invoke-RestMethod -Uri $u -TimeoutSec 3; if($r.status -eq 'up'){Write-Output 'Gotenberg health: UP'; exit 0}}catch{}; Start-Sleep -Seconds 2}; Write-Error 'Gotenberg health check timed out'; exit 1"
if errorlevel 1 (
    echo [ERROR] Gotenberg did not become healthy. Container logs:
    docker logs --tail 40 nidmak-gotenberg-auto
    pause
    exit /b 1
)

echo.
echo [4/4] Starting NID-MAK server...
set "PDF_SERVICE_URL=http://127.0.0.1:%PDF_PORT%"
echo PDF_SERVICE_URL=%PDF_SERVICE_URL%
echo.
python server.py
if errorlevel 1 (
    echo.
    echo [ERROR] NID-MAK server exited with an error.
    pause
    exit /b 1
)

endlocal
