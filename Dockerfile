# syntax=docker/dockerfile:experimental
# DOCKER_BUILDKIT=1 docker build --ssh default -t registry.digitalocean.com/titanro-docr/robrowserlegacy . && docker image push registry.digitalocean.com/titanro-docr/robrowserlegacy

FROM php:8-apache

RUN apt-get update -y && apt-get install -y libpng-dev
RUN docker-php-ext-install pdo pdo_mysql mysqli gd
RUN a2enmod rewrite

COPY ./AI /var/www/html/AI
COPY ./client /var/www/html/client
COPY ./src /var/www/html/src
COPY ./tools /var/www/html/tools
COPY ./index.html ./api.html ./api.js ./manifest.json ./manifest.webapp ./package.js ./package.json /var/www/html/

RUN chown -R www-data:www-data /var/www
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
