#!/bin/bash
set -e

# Re-apply permissions on every boot (safety net)
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 777 /var/www/storage
chmod -R 777 /var/www/bootstrap/cache

# Force logging to stderr so errors show in Render logs
export LOG_CHANNEL=stderr

# Start PHP-FPM in the background
php-fpm -D

# Run Laravel setup
php artisan package:discover --ansi || true
php artisan config:clear
php artisan cache:clear
php artisan migrate --force --seed || echo "Migration failed, check database connection"
php artisan view:cache
php artisan route:cache

# Start Nginx in the foreground (keeps container alive)
nginx -g "daemon off;"
