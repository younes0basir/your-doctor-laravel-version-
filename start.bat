@echo off
echo ========================================
echo Starting Your Doctor Application
echo ========================================
echo.

REM Start Backend in a new window
echo Starting Laravel Backend on http://localhost:8000...
start "Laravel Backend" cmd /k "cd backend && php artisan serve"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend in a new window
echo Starting React Frontend...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Application Starting...
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173 (or check console for actual port)
echo.
echo Admin Login:
echo Email: admin@example.com
echo Password: password123
echo.
echo Press any key to stop both servers...
pause

REM Kill both processes
taskkill /FI "WINDOWTITLE eq Laravel Backend*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq React Frontend*" /T /F >nul 2>nul

echo Servers stopped.
