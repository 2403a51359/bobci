@echo off
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b %errorlevel%
)

echo.
echo Starting frontend server...
call npm run dev
pause

@REM Made with Bob
