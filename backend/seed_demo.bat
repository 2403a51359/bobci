@echo off
echo 🌱 Seeding BobCI with demo data...
echo.

venv\Scripts\python.exe seed_demo_data.py

if %errorlevel% equ 0 (
    echo.
    echo ✅ Demo data loaded successfully!
    echo.
    echo 🌐 Open http://localhost:3000 to view the dashboard
    echo.
) else (
    echo.
    echo ❌ Failed to seed demo data
    echo Make sure the backend server is NOT running when seeding
    echo.
)

pause

@REM Made with Bob
