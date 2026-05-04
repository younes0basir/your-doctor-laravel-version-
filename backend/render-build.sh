#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
composer install --no-dev --optimize-autoloader

# Run migrations (automatically in production)
php artisan migrate --force

# Cache configuration, routes, and views for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache
