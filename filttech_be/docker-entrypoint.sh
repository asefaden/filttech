#!/bin/sh
set -e

echo "Starting Laravel application..."

APP_DIR=/var/www/html

# --------------------------------------------------
# Fix permissions (required for Laravel)
# --------------------------------------------------
echo "Fixing permissions..."
mkdir -p $APP_DIR/storage/logs
chown -R www-data:www-data $APP_DIR/storage $APP_DIR/bootstrap/cache
chmod -R 775 $APP_DIR/storage $APP_DIR/bootstrap/cache

# --------------------------------------------------
# Wait for database (Kubernetes-safe)
# --------------------------------------------------
if [ -n "$DB_HOST" ]; then
    echo "Waiting for database at $DB_HOST:${DB_PORT:-3306}..."
    until nc -z "$DB_HOST" "${DB_PORT:-3306}"; do
        sleep 2
    done
    echo "Database is ready."
fi

# --------------------------------------------------
# Validate APP_KEY (must be provided via env)
# --------------------------------------------------
if [ -z "$APP_KEY" ]; then
    echo "ERROR: APP_KEY is not set. Exiting."
    exit 1
fi

# --------------------------------------------------
# Create storage symlink (idempotent)
# --------------------------------------------------
if [ ! -L "$APP_DIR/public/storage" ]; then
    echo "Creating storage link..."
    php artisan storage:link || true
fi

# --------------------------------------------------
# Clear old caches (safe on restart)
# --------------------------------------------------
echo "Clearing old caches..."
php artisan optimize:clear

# --------------------------------------------------
# Cache config, routes & views (production)
# --------------------------------------------------
echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Caching views..."
php artisan view:cache

echo "Laravel setup completed successfully."

exec "$@"
