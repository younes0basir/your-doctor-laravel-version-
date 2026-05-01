@echo off
echo ========================================
echo Your Doctor - Quick Setup Script
echo ========================================
echo.

REM Check if PHP is installed
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PHP is not installed or not in PATH
    echo Please install PHP 8.0+ from https://windows.php.net/download/
    pause
    exit /b 1
)

REM Check if Composer is installed
where composer >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Composer is not installed or not in PATH
    echo Please install Composer from https://getcomposer.org/download/
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] All prerequisites found!
echo.

REM Backend Setup
echo ========================================
echo Setting up Backend (Laravel)...
echo ========================================
echo.

cd backend

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
) else (
    echo .env file already exists
)

echo Installing Composer dependencies...
call composer install --no-dev --optimize-autoloader

echo Generating application key...
call php artisan key:generate

echo Creating SQLite database...
if not exist database\database.sqlite (
    type nul > database\database.sqlite
    echo Database created
) else (
    echo Database already exists
)

echo Running migrations...
call php artisan migrate --force

echo Seeding database...
call php artisan db:seed --force

echo Clearing cache...
call php artisan cache:clear
call php artisan config:clear
call php artisan route:clear

echo.
echo [SUCCESS] Backend setup complete!
echo.

cd ..

REM Frontend Setup
echo ========================================
echo Setting up Frontend (React)...
echo ========================================
echo.

cd frontend

if not exist node_modules (
    echo Installing Node dependencies (this may take a few minutes)...
    call npm install
) else (
    echo node_modules already exists, skipping install
)

echo.
echo [SUCCESS] Frontend setup complete!
echo.

cd ..

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo 1. Backend (in one terminal):
echo    cd backend
echo    php artisan serve
echo.
echo 2. Frontend (in another terminal):
echo    cd frontend
echo    npm run dev
echo.
echo Default Admin Login:
echo Email: admin@example.com
echo Password: password123
echo.
echo For more information, see SETUP_GUIDE.md
echo.
pause
