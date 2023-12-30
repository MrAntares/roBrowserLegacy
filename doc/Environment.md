# Setting up the environment

## Docker 

This should apply to any environment running [OCI](https://opencontainers.org/) compatible software, but we recommend using
Docker for the easy of use and extensive documentation and guides out there to help you set up your environment.

This document assumes that you already have a Docker environment running and capable of running containers.

The [Dockerfile](../Dockerfile) contains the recipe for the two images needed for the containers: the Apache Web Server image
and the Node image. The Apache Web Server is used to serve the assets when they are ready to use, also serving the [Remote Client API](../client), and the Node image is used to develop and compile the roBrowser client files.

The [docker-compose.yaml](../docker-compose.yaml) file contains the orquestration of the containers that will be used to run the project.
The containers will be serving different folders on the project. The remote-client-api container will be mapped to serve the [client](../client) folder and its files.
The Node container will be serving the whole roBrowserLegacy folder, meaning you can browse the files withing the container and move things around when developing:

![](./img/robrowser-env-docker.png)

