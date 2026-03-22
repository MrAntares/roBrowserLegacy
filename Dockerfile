FROM node:20.10.0 AS builder

LABEL org.opencontainers.image.description="Builds roBrowserLegacy JS bundles and HTML."

USER root

RUN apt-get update -y -qq && \
    apt-get install -y -qq build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (layer-cached separately from source)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build:all

# Copy Config.local.js into the dist output so it's served alongside index.html.
# NOTE: Config.local.js is excluded from the build context via .dockerignore to
# prevent accidental secret baking. It must always be mounted at runtime.
# See applications/pwa/Config.local.js.example for the template.

# ---

FROM node:20.10.0 AS dev

LABEL org.opencontainers.image.description="Creates a environment to host the NodeJS and NPM environment."

USER root

RUN apt-get update -y -qq && \
    apt-get install -y -qq build-essential && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /app && \
    npm install wsproxy -g

WORKDIR /app

EXPOSE 8000

# Fixed: previously was ["/bin/bash", "-l", "-c", "sleep", "360h"] which passes
# "sleep" as the -c script and "360h" as $0, causing bash to exit immediately.
ENTRYPOINT ["/bin/bash", "-c", "sleep 360h"]

# ---

FROM php:8.3-apache AS dist-server

LABEL org.opencontainers.image.description="Creates a environment to serve the dist files using Apache"

WORKDIR /var/www/html

USER root

RUN apt-get update -y -qq && \
    a2enmod rewrite && \
    a2enmod headers && \
    a2dissite 000-default && \
    rm -rf /var/lib/apt/lists/*

# For some IDEs this line is treated as wrongly configured, but this is a bug !
# This heredoc format is supported by Docker.
RUN cat <<EOF > /etc/apache2/sites-enabled/dist.conf
<VirtualHost *:8080>
    ServerAdmin webmaster@robrowser.legacy
    DocumentRoot /var/www/html

    # Disable directory listing
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    # Set default file
    DirectoryIndex index.html

    # MIME types for JavaScript and other files
    AddType application/javascript .js

    # Enable CORS
    <IfModule mod_headers.c>
        Header set Access-Control-Allow-Origin "*"
    </IfModule>
</VirtualHost>
EOF

RUN echo "Listen 8080" >> /etc/apache2/ports.conf

# Copy the built dist files from the builder stage
COPY --from=builder --chown=www-data:www-data /app/dist/Web /var/www/html

EXPOSE 8080

USER www-data
