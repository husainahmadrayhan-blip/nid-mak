@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Install Remote PDF Browser Support

echo ==========================================
echo PDF Editor - Playwright Repair
echo ==========================================
echo.
where python >nul 2>nul
if errorlevel 1 (
  echo ERROR: Python was not found in PATH.
  echo Install Python from python.org and enable Add Python to PATH.
  pause
  exit /b 1
)
python --version
if errorlevel 1 goto :fail

echo.
echo [1/4] Repairing pip...
python -m ensurepip --upgrade
python -m pip install --upgrade pip
if errorlevel 1 goto :fail

echo.
echo [2/4] Installing Playwright into the SAME Python used by the app...
python -m pip install --upgrade "playwright>=1.50,<2"
if errorlevel 1 goto :fail

echo.
echo [3/4] Verifying Playwright import...
python -c "import sys; from playwright.sync_api import sync_playwright; print('Playwright OK'); print('Python:',sys.executable)"
if errorlevel 1 goto :fail

echo.
echo [4/4] Installing Playwright Chromium browser...
python -m playwright install chromium
if errorlevel 1 (
  echo Chromium installation failed. Trying the full browser install command...
  python -m playwright install
  if errorlevel 1 goto :fail
)

echo.
echo ==========================================
echo SUCCESS: Playwright and browser installed.
echo Now close this window and start RUN-LOCAL-WINDOWS.bat.
echo ==========================================
pause
exit /b 0

:fail
echo.
echo INSTALL FAILED. Copy the error shown above and send it in ChatGPT.
echo If multiple Python versions are installed, check: where python
pause
exit /b 1
