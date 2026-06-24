# ===============================
# Stage 1: Build frontend assets
# ===============================
FROM node:20-alpine AS node-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ===============================
# Stage 2: PHP + Nginx + Supervisor
# ===============================
FROM php:8.3-fpm-alpine

WORKDIR /var/www/html

# System dependencies (ላይብረሪዎች እንዳይጠፉ ጠብቀን እንጭናለን)
RUN apk add --no-cache \
    git curl zip unzip \
    libpng libpng-dev \
    libxml2 libxml2-dev \
    oniguruma-dev libzip-dev \
    freetype-dev libjpeg-turbo-dev libwebp-dev \
    icu-dev icu-data-full \
    mysql-client \
    pcre-dev \
    $PHPIZE_DEPS \
    nginx supervisor

# PHP extensions ማስተናገጃ
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip xml intl

# Redis extension ጭነት (ላይብረሪዎችን ሳናጠፋ በንጹህ እናስቀምጣለን)
RUN pecl install redis \
    && docker-php-ext-enable redis

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy app code
COPY . .
COPY --from=node-builder /app/public/build public/build

# Install PHP dependencies (Laravel-safe)
RUN composer install --no-dev --no-interaction --optimize-autoloader

# Laravel permissions
RUN mkdir -p \
    storage/logs \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# PHP-FPM config
RUN rm -f /usr/local/etc/php-fpm.d/www.conf.default \
    && printf "[www]\nuser=www-data\ngroup=www-data\nlisten=127.0.0.1:9000\npm=dynamic\npm.max_children=20\npm.start_servers=5\npm.min_spare_servers=2\npm.max_spare_servers=10\n" \
       > /usr/local/etc/php-fpm.d/www.conf

# PHP limits
RUN printf "upload_max_filesize=40M\npost_max_size=40M\nmemory_limit=256M\nmax_execution_time=600\n" \
    > /usr/local/etc/php/conf.d/limits.ini

# Nginx main config
RUN printf "user nginx;\nworker_processes auto;\nerror_log /dev/stderr warn;\npid /run/nginx.pid;\n\nevents { worker_connections 1024; }\n\nhttp { include /etc/nginx/mime.types; default_type application/octet-stream; sendfile on; keepalive_timeout 65; include /etc/nginx/http.d/*.conf; }\n\ndaemon off;\n" \
    > /etc/nginx/nginx.conf

# Nginx site config
RUN mkdir -p /run/nginx \
    && printf "server {\n    listen 80;\n    root /var/www/html/public;\n    index index.php index.html;\n    location / {\n        try_files \$uri \$uri/ /index.php?\$query_string;\n    }\n    location ~ \\.php$ {\n        fastcgi_index index.php;\n        fastcgi_pass 127.0.0.1:9000;\n        include fastcgi_params;\n        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;\n    }\n    location ~ /\.(?!well-known).* { deny all; }\n}\n" > /etc/nginx/http.d/default.conf

# Supervisor config
RUN mkdir -p /etc/supervisor/conf.d \
    && printf "[supervisord]\nnodaemon=true\nlogfile=/dev/stdout\nlogfile_maxbytes=0\n\n[program:php-fpm]\ncommand=php-fpm -F\nautostart=true\nautorestart=true\n\n[program:nginx]\ncommand=nginx\nautostart=true\nautorestart=true\n" > /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

# Entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -f http://localhost/ || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]