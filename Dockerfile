FROM node:20.10.0 as client

USER root

RUN apt update -y -qq && apt install build-essential -y -qq && mkdir -p /app

RUN npm install wsproxy -g

WORKDIR /app

EXPOSE 8000

ENTRYPOINT "/bin/bash"

FROM php:8.1-apache as server

LABEL org.opencontainers.image.description="Creates a environment to serve PHP files for the Remote Client API."

WORKDIR /var/www/html

USER root

RUN apt-get update -y -qq

RUN a2enmod rewrite && \
    a2enmod headers

EXPOSE 80

USER www-data
