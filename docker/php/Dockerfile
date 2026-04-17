FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl

RUN docker-php-ext-install pdo pdo_pgsql pgsql zip bcmath opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

COPY backend/composer.json backend/composer.lock* ./

RUN composer install --no-dev --optimize-autoloader --no-scripts || true

COPY backend/ .

RUN chown -R www-data:www-data /var/www/backend/storage /var/www/backend/bootstrap/cache || true

EXPOSE 9000

CMD ["php-fpm"]
