#!/bin/bash

# Fix permissions on startup
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Force logging to stderr for Docker/Render visibility
export LOG_CHANNEL=stderr

# Start PHP-FPM in the background
php-fpm -D

# Run discovery and migrations
php artisan package:discover --ansi
php artisan migrate --force

# Clear and cache settings
php artisan config:clear
php artisan cache:clear
php artisan view:cache
php artisan route:cache

# Start Nginx in the foreground
nginx -g "daemon off;"
