FROM php:8.3-cli-alpine

# Install extensions
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    bash \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip bcmath opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy entire backend
COPY backend/ .

# Storage permissions first
RUN mkdir -p storage/framework/{cache/data,sessions,views} storage/logs bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Make start script executable
RUN chmod +x start.sh

EXPOSE 8000

CMD ["bash", "start.sh"]
