[![Build and publish the container image](https://github.com/sgofferj/tak-feeder-deepstate/actions/workflows/actions.yml/badge.svg)](https://github.com/sgofferj/tak-feeder-deepstate/actions/workflows/actions.yml)

# tak-feeder-deepstate
Feed the latest data from deepstatemap.live into your TAK server

(C) 2023 Stefan Gofferje

Licensed under the GNU General Public License V3 or later.

**This project and its use of the deepstatemap.live API has been officially authorized by the deepstatemap.live team, however, I am not affiliated with or part of that team.**

## Description
### What is deepstatemap.live?
deepstatemap.live is a website which provides a tactical map of the Ukraine conflict. Their data is gained from OSINT sources, processed by AI and then presented as a map. The wesbite is https://deepstatemap.live


### TAK server feeder
This feeder pulls the data from the deepstatemap.live API, converts the latest set of objects to CoT messages and sends them to a TAK server.

## Configuration
The following values are supported and can be provided either as environment variables or through an .env-file.

| Variable | Default | Purpose |
|----------|---------|---------|
| REMOTE_SERVER_URL | empty | (mandatory) TAK server full URL, e.g. ssl://takserver:8089 |
| REMOTE_SSL_USER_CERTIFICATE | empty | (mandatory for ssl) User certificate in PEM format |
| REMOTE_SSL_USER_KEY | empty | (mandatory for ssl) User certificate key file (xxx.key) |
| PULL_INTERVAL | 300 | (optional) Update intervall in seconds |
| LOGCOT | false | (optional) Log created CoTs to the console |
| UUID | empty | (optional) Set feeder UID - if not set, the feeder will create one |

Note: At the moment, only SSL TCP connections are supported.
## Certificates
These are the server-issued certificate and key files. Before using, the password needs to be removed from the key file with `openssl rsa -in cert.key -out cert-nopw.key`. OpenSSL will ask for the key password which usually is "atakatak".

## Container use
First, get your certificate and key and copy them to a suitable folder which needs to be added as a volume to the container.
### Image
The image is built for AMD64 and ARM64 and pushed to ghcr.io: *ghcr.io/sgofferj/tak-feeder-deepstate:latest*
### Docker
First, rename .env.example to .env and edit according to your needs \
Create and start the container:
```
docker run -d --env-file .env -v <path-to-certificate-directory>:/certs:ro --name tak-feeder-deepstate --restart always ghcr.io/sgofferj/tak-feeder-deepstate:latest
```

### Docker compose
Here is an example for a docker-compose.yml file:
```
version: '2.0'

services:
  deepstate:
    image: ghcr.io/sgofferj/tak-feeder-deepstate:latest
    restart: always
    networks:
      - default
    volumes:
      - <path to certificate-directory>:/certs:ro
    environment:
      - REMOTE_SERVER_URL=ssl://tak-server:8089
      - REMOTE_SSL_USER_CERTIFICATE=cert.pem
      - REMOTE_SSL_USER_KEY=key.pem
      - GDACS_PULL_INTERVAL=60
      - LOGCOT=false

networks:
  default:
```