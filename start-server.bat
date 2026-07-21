@echo off
REM Starts the API server. Double-click this, or run: start-server.bat
REM cd /d %~dp0 jumps to this file's own folder, so it works from anywhere.
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo ERROR: .venv not found in %CD%
    echo Run this first:  python -m venv .venv ^&^& .venv\Scripts\python.exe -m pip install -r requirements.txt
    pause
    exit /b 1
)

echo Starting API server on http://localhost:8000
echo Press Ctrl+C to stop.
echo.
REM --reload-include .env: uvicorn's reloader watches *.py only, so without
REM this an edit to .env is silently ignored until a manual restart — which
REM looks exactly like the new key not working.
.venv\Scripts\python.exe -m uvicorn api.index:app --reload --reload-include .env --port 8000
pause
