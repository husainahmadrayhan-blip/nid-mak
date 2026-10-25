@echo off
setlocal
cd /d "%~dp0"
echo Checking OpenCV face detector with binary wheels only...
python -c "import cv2, numpy, os; assert hasattr(cv2,'CascadeClassifier') and hasattr(cv2,'data') and hasattr(cv2,'imdecode'); p=cv2.data.haarcascades+'haarcascade_frontalface_default.xml'; assert os.path.isfile(p); assert not cv2.CascadeClassifier(p).empty(); print('OpenCV OK:',cv2.__version__,cv2.__file__)" >nul 2>nul
if not errorlevel 1 goto start

echo Repairing OpenCV for Python 3.14 using prebuilt wheels...
python -m pip uninstall -y opencv-python opencv-contrib-python opencv-python-headless opencv-python-headless-rolling
python -m pip install --no-cache-dir --force-reinstall --only-binary=:all: "numpy>=2.3,<3" "opencv-python-headless>=4.13,<5"
if errorlevel 1 goto failed
python -c "import cv2, numpy, os; p=cv2.data.haarcascades+'haarcascade_frontalface_default.xml'; assert hasattr(cv2,'CascadeClassifier') and hasattr(cv2,'imdecode'); assert os.path.isfile(p),p; c=cv2.CascadeClassifier(p); assert not c.empty(); print('OpenCV face detector OK:',cv2.__version__,cv2.__file__)"
if errorlevel 1 goto failed

goto start

:failed
echo.
echo ERROR: A compatible prebuilt OpenCV wheel could not be installed or verified.
echo No source compilation was attempted. Please send this output:
echo python -c "import sys; print(sys.version); import cv2; print(cv2.__version__, cv2.__file__, hasattr(cv2,'CascadeClassifier'))"
pause
exit /b 1

:start
echo OpenCV repair verified. Starting Visual Editor...
python server.py
pause
