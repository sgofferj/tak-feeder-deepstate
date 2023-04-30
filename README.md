[![Build and publish the container image](https://github.com/sgofferj/tak-feeder-gdacs/actions/workflows/actions.yml/badge.svg)](https://github.com/sgofferj/tak-feeder-gdacs/actions/workflows/actions.yml)

# tak-feeder-gdacs
Feed current GDACS disaster data into your TAK server

(C) 2023 Stefan Gofferje

Licensed under the GNU General Public License V3 or later.

## Description
### What is GDACS?
GDACS or Global Disaster Alert and Coordination System (https://www.gdacs.org) is a cooperation framework between the United Nations and the European Commission. It includes disaster managers and disaster information systems worldwide and aims at filling the information and coordination gaps in the first phase after major disasters.

GDACS provides real-time access to web‐based disaster information systems and related coordination tools.
A more detailed description of GDACS purpose, content and guidelines, agreed and approved by the steering committee can be found [here](https://www.gdacs.org/Documents/GDACS%20Guidelines%202014_-_FINAL.PDF).


### TAK server feeder
This feeder pulls the RSS feeds from GDACS, converts the current events to CoT messages and sends them to a TAK server. ATAK, WinTAK and WebTAK will show the events with icons corresponding to the type of event and the severity (WinTAK doesn't show the color, though).

**Please note that neither the author nor this software project are in any way affiliated with GDACS.**
## Configuration
The following values are supported and can be provided either as environment variables or through an .env-file.

| Variable | Default | Purpose |
|----------|---------|---------|
| REMOTE_SERVER_URL | empty | (mandatory) TAK server full URL, e.g. ssl://takserver:8089 |
| REMOTE_SSL_USER_CERTIFICATE | empty | (mandatory for ssl) User certificate in PEM format |
| REMOTE_SSL_USER_KEY | empty | (mandatory for ssl) User certificate key file (xxx.key) |
| GDACS_PULL_INTERVAL | 60 | (optional) Update intervall in seconds |
| LOGCOT | false | (optional) Log created CoTs to the console |
| UUID | empty | (optional) Set feeder UID - if not set, the feeder will create one |

Note: At the moment, only SSL TCP connections are supported.
## Certificates
These are the server-issued certificate and key files. Before using, the password needs to be removed from the key file with `openssl rsa -in cert.key -out cert-nopw.key`. OpenSSL will ask for the key password which usually is "atakatak".

## Container use
First, get your certificate and key and copy them to a suitable folder which needs to be added as a volume to the container.
### Image
The image is built for AMD64 and ARM64 and pushed to ghcr.io: *ghcr.io/sgofferj/tak-feeder-gdacs:latest*
### Docker
First, rename .env.example to .env and edit according to your needs \
Create and start the container:
```
docker run -d --env-file .env -v <path-to-certificate-directory>:/certs:ro --name tak-feeder-gdacs --restart always ghcr.io/sgofferj/tak-feeder-gdacs:latest
```

### Docker compose
Here is an example for a docker-compose.yml file:
```
version: '2.0'

services:
  gdacs:
    image: ghcr.io/sgofferj/tak-feeder-gdacs:latest
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
The following example is for using the container with compose on the same machine as the TAK server. Submitted by [atakhq](https://github.com/atakhq).

```
version: '2.0'

services:
  gdacs:
    image: ghcr.io/sgofferj/tak-feeder-gdacs:latest
    restart: always
    network_mode: host
    volumes:
      - ~/tak-server/certs:/certs:ro
    environment:
      - REMOTE_SERVER_URL=ssl://127.0.0.1:8089
      - REMOTE_SSL_USER_CERTIFICATE=/certs/gdacs.pem
      - REMOTE_SSL_USER_KEY=/certs/gdacs-nopw.key
      - GDACS_PULL_INTERVAL=60
      - LOGCOT=false
```
