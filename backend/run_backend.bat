@echo off
echo Installing backend dependencies...
venv\Scripts\python.exe -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b %errorlevel%
)

echo.
echo Starting backend server...
venv\Scripts\python.exe main.py
pause

@REM Made with Bob
