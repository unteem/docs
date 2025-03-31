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

In this example we assume that we have the following services:
- OIDC provider on https://id.govsloveopensource.eu
- Object Storage on https://storage.govsloveopensource.eu
- Docs on https://docs.govsloveopensource.eu

### Configuration

All the configuration files are in the directory `env.d/production`. You have to edit all the variables

#### OIDC

Authentification in Docs is managed through Open ID Connect protocol, you will need a working Identity Provider that implements this protocol.

You can follow our [example to deploy Keycloak](../examples/compose/keycloak/README.md)

If you are using Keycloak here is an example of the variables that you will set:
```
OIDC_OP_JWKS_ENDPOINT=https://id.govsloveopensource.eu/realms/docs/protocol/openid-connect/certs
OIDC_OP_AUTHORIZATION_ENDPOINT=https://id.govsloveopensource.eu/realms/docs/protocol/openid-connect/auth
OIDC_OP_TOKEN_ENDPOINT=https://id.govsloveopensource.eu/realms/docs/protocol/openid-connect/token
OIDC_OP_USER_ENDPOINT=https://id.govsloveopensource.eu/realms/docs/protocol/openid-connect/userinfo
OIDC_OP_LOGOUT_ENDPOINT=https://id.govsloveopensource.eu/docs/impress/protocol/openid-connect/logout
OIDC_RP_CLIENT_ID=<your_client_id>
OIDC_RP_CLIENT_SECRET=<your_client_secret>
OIDC_RP_SIGN_ALGO=RS256
OIDC_RP_SCOPES="openid email"
USER_OIDC_FIELD_TO_SHORTNAME="given_name"
USER_OIDC_FIELDS_TO_FULLNAME="given_name,usual_name"

LOGIN_REDIRECT_URL=https://docs.govsloveopensource.eu
LOGIN_REDIRECT_URL_FAILURE=https://docs.govsloveopensource.eu
LOGOUT_REDIRECT_URL=https://docs.govsloveopensource.eu

OIDC_REDIRECT_ALLOWED_HOSTS=["https://docs.govsloveopensource.eu"]
```

#### Object Storage

Files and medias are stored on an Object Store that needs to implement the S3 API. 

You can follow our [on how to deploy Minio](../examples/compose/minio/README.md)

Here is an example of the values you will set if you followed our examples:
```
STORAGES_STATICFILES_BACKEND=django.contrib.staticfiles.storage.StaticFilesStorage # to use the Django static files storage backend.
AWS_S3_ENDPOINT_URL=https://storage.govsloveopensource.eu
AWS_S3_ACCESS_KEY_ID=<s3 access key>
AWS_S3_SECRET_ACCESS_KEY=<s3 secret key>
AWS_STORAGE_BUCKET_NAME=docs-media
MEDIA_BASE_URL=https://docs.govsloveopensource.eu
```

#### Postgresql

Docs is using Postgresql as a database, in our example we provide a way to deploy Postgresql but you can use an external postgresql, you will need to fill the values of the following variables:
```
DB_HOST=postgresql
DB_NAME=docs
DB_USER=docs
DB_PASSWORD=<Set postgresql password>
DB_PORT=5432
```

#### Y Provider

The Y provider service is used to enable collaboration through websockets. You will need to fill the values of the following variables:

```
COLLABORATION_LOGGING=true
Y_PROVIDER_API_KEY=<generate an api key>
COLLABORATION_API_URL=https://docs.govsloveopensource.eu/collaboration/api/
COLLABORATION_SERVER_ORIGIN=https://docs.govsloveopensource.eu
COLLABORATION_SERVER_SECRET=<generate a secret>
```

#### Docs

Docs backend is based on Django and the Django Rest Framework.

```
DJANGO_ALLOWED_HOSTS=https://docs.govsloveopensource.eu
DJANGO_SECRET_KEY=<generate a secret>
DJANGO_SETTINGS_MODULE=impress.settings
DJANGO_SUPERUSER_PASSWORD=<generate password>

# Logging
# Set to DEBUG level for dev only
LOGGING_LEVEL_HANDLERS_CONSOLE=ERROR
LOGGING_LEVEL_LOGGERS_ROOT=INFO
LOGGING_LEVEL_LOGGERS_APP=INFO

# Python
PYTHONPATH=/app
```
#### Mail 

The following variables are used by the mail service that is used to send invitations. 

```
DJANGO_EMAIL_BACKEND: # The email backend to use for sending emails.
DJANGO_EMAIL_HOST=<you mail host> # The email host to use for sending emails.
DJANGO_EMAIL_HOST_USER=<your mail user> # The email host user to use for sending emails.
DJANGO_EMAIL_HOST_PASSWORD<your mail password> # The email host password to use for sending emails.
DJANGO_EMAIL_PORT=1025 # The email port to use for sending emails.
DJANGO_EMAIL_FROM:<your email address> The default from email address to use for sending emails.

DJANGO_EMAIL_USE_TLS: A flag to enable or disable TLS for email sending.
DJANGO_EMAIL_USE_SSL: A flag to enable or disable SSL for email sending.


DJANGO_EMAIL_BRAND_NAME="La Suite Numérique" # The brand name to use in email templates.
DJANGO_EMAIL_LOGO_IMG=" https://docs.govsloveopensource.eu/assets/logo-suite-numerique.png" # The logo image to use in email templates.
```
#### AI

Built-in AI actions let users generate, summarize, translate, and correct content, helping teams work faster and smarter.
```
AI_BASE_URL=https://openaiendpoint.com
AI_API_KEY=password
AI_MODEL=llama
```

#### Frontend theme

You can either use the default theme that is provided, build your own with cuningham framework or provide a custom css.
```
FRONTEND_THEME=default
FRONTEND_CSS_URL=https://storage.govsloveopensource.eu/themes/custom.css
```

## Start Docs 

curl [compose file](../examples/compose/docs/compose.yaml)
start service with docker-compose up -d

explain how to configure TLS/SSL Https with [nginx-proxy](../examples/compose/nginx-proxy/)
