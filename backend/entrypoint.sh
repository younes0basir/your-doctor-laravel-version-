#!/bin/bash

# Start PHP-FPM in the background
php-fpm -D

# Run migrations if needed
php artisan migrate --force

# Clear and cache settings
php artisan config:clear
php artisan cache:clear
php artisan view:cache
php artisan route:cache

# Start Nginx in the foreground
nginx -g "daemon off;"
