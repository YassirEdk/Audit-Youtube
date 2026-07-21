@echo off
REM Starts the React dev server. Double-click this, or run: start-frontend.bat
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing frontend dependencies, one moment...
    call npm install
)

echo Starting frontend on http://localhost:5173
echo Press Ctrl+C to stop.
echo.
call npm run dev
pause
