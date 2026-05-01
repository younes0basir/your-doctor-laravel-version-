@echo off
echo ========================================
echo Admin Dashboard Backend Test
echo ========================================
echo.

cd backend

echo Step 1: Checking if Laravel server is running...
php -r "echo 'Testing port 8000...' . PHP_EOL; $fp = @fsockopen('localhost', 8000); if ($fp) { echo '✓ Backend server is RUNNING on port 8000' . PHP_EOL; fclose($fp); } else { echo '✗ Backend server is NOT RUNNING' . PHP_EOL; echo '  Starting Laravel server...' . PHP_EOL; }"

echo.
echo Step 2: Checking database connection...
php artisan db:show --no-interaction 2>nul
if %errorlevel% neq 0 (
    echo ✗ Database connection failed
    echo Please check your .env file
) else (
    echo ✓ Database connected
)

echo.
echo Step 3: Checking admin users...
php artisan tinker --execute="echo 'Admin users count: ' . \App\Models\User::where('role', 'admin')->count() . PHP_EOL;"

echo.
echo Step 4: Checking total users...
php artisan tinker --execute="echo 'Total users: ' . \App\Models\User::count() . PHP_EOL;"

echo.
echo Step 5: Checking appointments...
php artisan tinker --execute="echo 'Total appointments: ' . \App\Models\Appointment::count() . PHP_EOL;"

echo.
echo Step 6: Testing API routes...
php artisan route:list --path=admin --columns=method,uri

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If all checks passed, your backend is ready.
echo Start the frontend with: npm run dev
echo.
pause
