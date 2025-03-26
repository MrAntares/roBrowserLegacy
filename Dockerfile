FROM node:20.10.0 AS dev

LABEL org.opencontainers.image.description="Creates a environment to host the NodeJS and NPM environment."

USER root

RUN apt update -y -q && apt install build-essential -y -q && \
  mkdir -p /app && \
  npm install wsproxy -g

WORKDIR /app

EXPOSE 8000

ENTRYPOINT ["/bin/bash", "-l", "-c", "sleep", "360h"]

FROM php:8.3-apache AS dist-server

LABEL org.opencontainers.image.description="Creates a environment to serve the dist files using Apache"

WORKDIR /var/www/html

USER root

RUN apt-get update -y -qq && \
  a2enmod rewrite && \
  a2enmod headers

# For some IDEs this line is treated as wrongly configured, but this is a bug !
# This heredoc format is supported by Docker.
RUN cat <<EOF > /etc/apache2/sites-enabled/dist.conf
<VirtualHost *:8080>
    ServerAdmin webmaster@robrowser.legacy
    DocumentRoot /var/www/html

    # Allow directory access
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    <FilesMatch "\.(html|js|css|png|jpg|gif|svg|webp|ico|woff|woff2|ttf|otf|eot|mp4|webm|ogg|mp3|json)$">
        Require all granted
    </FilesMatch>

    # Set default file
    DirectoryIndex index.html

    # MIME types for JavaScript and other files
    AddType application/javascript .js

    # Enable CORS if needed
    <IfModule mod_headers.c>
        Header set Access-Control-Allow-Origin "*"
    </IfModule>
</VirtualHost>
EOF

RUN echo "Listen 8080" >> /etc/apache2/ports.conf

EXPOSE 8080

USER www-data
