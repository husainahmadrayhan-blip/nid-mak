@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo PDF Editor - Startup
echo ==========================================
echo.
where python >nul 2>nul
if errorlevel 1 (
  echo ERROR: Python was not found in PATH.
  echo Install Python and enable Add Python to PATH, then reopen this window.
  pause
  exit /b 1
)
python --version
if errorlevel 1 (
  echo ERROR: Python did not start correctly.
  pause
  exit /b 1
)

echo.
if errorlevel 1 (
  echo then close this window and run RUN-LOCAL-WINDOWS.bat again.
  echo.
  echo Diagnostic Python path:
  python -c "import sys; print(sys.executable)"
  pause
  exit /b 1
)

echo.
echo Checking OpenCV face detector...
python -c "import cv2, numpy, os; p=cv2.data.haarcascades+'haarcascade_frontalface_default.xml'; assert hasattr(cv2,'CascadeClassifier') and os.path.isfile(p) and not cv2.CascadeClassifier(p).empty(); print('OpenCV OK:',cv2.__version__)" 
if errorlevel 1 (
  echo.
  echo WARNING: OpenCV face detector is not ready. The editor may still start.
  echo To repair it later, close this window and run FIX-OPENCV-WINDOWS.bat.
)

echo.
echo.
echo Starting PDF Editor server...
python server.py
if errorlevel 1 (
  echo.
  echo ERROR: The server stopped with an error. Read the message above.
)
pause
