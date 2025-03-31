# Installation with docker compose

We provide an example of a configuration for running Docs using docker compose. This configuration is experimental, the official way to deploy Docs in production is to use [k8s](docs/installation/k8s.md)

## Requirements

- A modern version of Docker and its Compose plugin.
- A domain name.
- An Identity Provider that implements Open ID Connect protocol - we provide [an example to deploy Keycloak](../examples/compose/keycloak/README.md).
- An Object Storage that implements S3 API - we provide [an example to deploy Minio](../examples/compose/minio/README.md).
- A Postgresql database
- A Redis database

## Software Requirements

Ensure you have Docker Compose(v2) installed on your host server. Follow the official guidelines for a reliable setup:

Docker Compose is included with Docker Engine:

- **Docker Engine:** We suggest adhering to the instructions provided by Docker
  for [installing Docker Engine](https://docs.docker.com/engine/install/).

For older versions of Docker Engine that do not include Docker Compose:

- **Docker Compose:** Install it as per the [official documentation](https://docs.docker.com/compose/install/).

> \[!NOTE\]
> `docker-compose` may not be supported. You are advised to use `docker compose` instead.

## Installation

### Configuration

All the configuration files are in the directory `env.d/production`. You have to edit all the files to complete them.

#### OIDC

Authentification in Docs is managed through Open ID Connect protocol, you will need a working Identity Provider that implements this protocol.

[Configure your Open ID Connect client](oidc.yaml) for Docs

#### Object Storage

Files and medias are stored on an Object Store that needs to implement S3 API. 

```
STORAGES_STATICFILES_BACKEND=django.contrib.staticfiles.storage.StaticFilesStorage
AWS_S3_ENDPOINT_URL=<s3 url>
AWS_S3_ACCESS_KEY_ID=<s3 access key>
AWS_S3_SECRET_ACCESS_KEY=<s3 secret key
AWS_STORAGE_BUCKET_NAME=<bucket name>
MEDIA_BASE_URL=<your docs url>
```

#### Postgresql

Explain how to configure following variables, with example to generate secrets.

```
DB_HOST=postgresql
DB_NAME=docs
DB_USER=docs
DB_PASSWORD=<Set postgresql password>
DB_PORT=5432
```


#### Y Provider

Explain how to configure following variables, with example to generate secrets.
```
COLLABORATION_LOGGING=true
Y_PROVIDER_API_KEY=<Set y provider api key>
COLLABORATION_API_URL=https://impress.127.0.0.1.nip.io/collaboration/api/
COLLABORATION_SERVER_ORIGIN=https://impress.127.0.0.1.nip.io
COLLABORATION_SERVER_SECRET=<Set collaboration secret>
```

#### Docs

Explain how to configure following variables, with example to generate secrets.
```
## Django
DJANGO_ALLOWED_HOSTS=impress.127.0.0.1.nip.io,keycloack.127.0.0.1.nip.io
DJANGO_SECRET_KEY=ThisIsAnExampleKeyForDevPurposeOnly
DJANGO_SETTINGS_MODULE=impress.settings
DJANGO_SUPERUSER_PASSWORD=ThisIsAnExamplePassword

# Logging
# Set to DEBUG level for dev only
LOGGING_LEVEL_HANDLERS_CONSOLE=ERROR
LOGGING_LEVEL_LOGGERS_ROOT=INFO
LOGGING_LEVEL_LOGGERS_APP=INFO

# Python
PYTHONPATH=/app

# impress settings

# Mail
DJANGO_EMAIL_BRAND_NAME="La Suite Numérique"
DJANGO_EMAIL_HOST="mailcatcher"
DJANGO_EMAIL_LOGO_IMG="https://impress.127.0.0.1.nip.io/assets/logo-suite-numerique.png"
DJANGO_EMAIL_PORT=1025

# AI
AI_BASE_URL=https://openaiendpoint.com
AI_API_KEY=password
AI_MODEL=llama

# Frontend
FRONTEND_THEME=dsfr
```

## Start Docs 

curl [compose file](../examples/compose/docs/compose.yaml)
start service with docker-compose up -d

explain how to configure TLS/SSL Https with [nginx-proxy](../examples/compose/nginx-proxy/)
