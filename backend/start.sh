#!/bin/bash
set -e

# Run migrations
php artisan migrate --force 2>/dev/null || true

# Seed roles and admin user (only if tables are empty)
php artisan db:seed --class=RolePermissionSeeder --force 2>/dev/null || true
php artisan db:seed --class=DatabaseSeeder --force 2>/dev/null || true

# Cache config
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true

# Start the server
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
