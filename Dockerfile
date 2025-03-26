FROM node:23.10.0-alpine

LABEL org.opencontainers.image.description="Creates a environment to host the NodeJS and NPM environment."

USER root

RUN apk add --update alpine-sdk && \
  mkdir -p /app && \
  npm install wsproxy -g

WORKDIR /app

USER 1000

EXPOSE 8000

ENTRYPOINT ["/bin/bash"]
