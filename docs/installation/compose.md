# Installation with docker compose
We provide a sample configuration for running Docs using Docker Compose. Please note that this configuration is experimental, and the official way to deploy Docs in production is to use [k8s](../installation/k8s.md)

## Requirements
- A modern version of Docker and its Compose plugin.
- A domain name and DNS configured to your server.
- An Identity Provider that supports OpenID Connect protocol - we provide [an example to deploy Keycloak](../examples/compose/keycloak/README.md).
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

## Configuration

Docs configuration is achieved through environment variables. A detailed description of all variables can be found [here](../env.md)

In this example, we assume the following services:
- OIDC provider on https://id.example.org
- Object Storage on https://storage.example.org
- Docs on https://docs.example.org

### OIDC

Authentification in Docs is managed through Open ID Connect protocol. A functional Identity Provider implementing this protocol is required.

For guidance, refer to our [Keycloak deployment example](../examples/compose/keycloak/README.md)

If using Keycloak, the following environment variables need to be set:
```env
OIDC_OP_JWKS_ENDPOINT=https://id.example.org/realms/docs/protocol/openid-connect/certs
OIDC_OP_AUTHORIZATION_ENDPOINT=https://id.example.org/realms/docs/protocol/openid-connect/auth
OIDC_OP_TOKEN_ENDPOINT=https://id.example.org/realms/docs/protocol/openid-connect/token
OIDC_OP_USER_ENDPOINT=https://id.example.org/realms/docs/protocol/openid-connect/userinfo
OIDC_OP_LOGOUT_ENDPOINT=https://id.example.org/docs/docs/protocol/openid-connect/logout
OIDC_RP_CLIENT_ID=<client_id>
OIDC_RP_CLIENT_SECRET=<client secret>
OIDC_RP_SIGN_ALGO=RS256
OIDC_RP_SCOPES="openid email"
USER_OIDC_FIELD_TO_SHORTNAME="given_name"
USER_OIDC_FIELDS_TO_FULLNAME="given_name,usual_name"

LOGIN_REDIRECT_URL=https://docs.example.org
LOGIN_REDIRECT_URL_FAILURE=https://docs.example.org
LOGOUT_REDIRECT_URL=https://docs.example.org

OIDC_REDIRECT_ALLOWED_HOSTS=["https://docs.example.org"]
```

### Object Storage

Files and media are stored in an Object Store that supports the S3 API.

For guidance, refer to our [Minio deployment example](../examples/compose/minio/README.md)

The following environment variables must be set:
```env
AWS_S3_ENDPOINT_URL=https://storage.example.org
AWS_S3_ACCESS_KEY_ID=<s3 access key>
AWS_S3_SECRET_ACCESS_KEY=<s3 secret key>
AWS_STORAGE_BUCKET_NAME=<bucket name>
MEDIA_BASE_URL=https://docs.example.org
```

### Postgresql

Docs uses PostgreSQL as its database. Although an external PostgreSQL can be used, our example provides a deployment method.

The following environment variables must be set:
```env
DB_HOST=<database host> 
DB_NAME=<database name> 
DB_USER=<username to connect to db> 
DB_PASSWORD=<postgresql password> 
DB_PORT=<database port> 
```

### Redis

Docs uses Redis for caching. While an external Redis can be used, our example provides a deployment method.

Set the following environment variable:
```env
REDIS_URL=<redis URL> # set to redis in our example
```

### Y Provider

The Y provider service enables collaboration through websockets.

Set the following environment variables:
```env
COLLABORATION_LOGGING=true
Y_PROVIDER_API_KEY=<generate a random key>
COLLABORATION_API_URL=https://docs.example.org/collaboration/api/
COLLABORATION_SERVER_ORIGIN=https://docs.example.org
COLLABORATION_SERVER_SECRET=<generate a random key>
```

### Docs

The Docs backend is built on the Django Framework.

Set the following environment variables:
```env
DJANGO_ALLOWED_HOSTS=https://docs.example.org
DJANGO_SECRET_KEY=<generate a random key>
DJANGO_SETTINGS_MODULE=impress.settings
DJANGO_SUPERUSER_PASSWORD=<generate a random key>

# Logging
# Set to DEBUG level for dev only
LOGGING_LEVEL_HANDLERS_CONSOLE=ERROR
LOGGING_LEVEL_LOGGERS_ROOT=INFO
LOGGING_LEVEL_LOGGERS_APP=INFO

# Python
PYTHONPATH=/app
```
### Mail 

The following environment variables are required for the mail service to send invitations:
```env
DJANGO_EMAIL_HOST=<smtp host> 
DJANGO_EMAIL_HOST_USER=<smtp user> 
DJANGO_EMAIL_HOST_PASSWORD<smtp password>
DJANGO_EMAIL_PORT=<smtp port> 
DJANGO_EMAIL_FROM:<your email address>

DJANGO_EMAIL_USE_TLS: A flag to enable or disable TLS for email sending.
DJANGO_EMAIL_USE_SSL: A flag to enable or disable SSL for email sending.


DJANGO_EMAIL_BRAND_NAME=<brand name used in email templates> # eg. "La Suite Numérique"
DJANGO_EMAIL_LOGO_IMG=<logo image to use in email templates.> # eg. "https://docs.example.org/assets/logo-suite-numerique.png" 
```
### AI

Built-in AI actions let users generate, summarize, translate, and correct content. 

AI is disabled by default. To enable it, the following environment variables must be set:
```env
AI_BASE_URL=https://openaiendpoint.com
AI_API_KEY=<API key>
AI_MODEL=<model used> eg. llama
```

### Frontend theme

You can use the default theme, build a custom theme with the cuningham framework, or provide a custom CSS.

```env
FRONTEND_THEME=default # name of your theme built with cuningham
FRONTEND_CSS_URL=https://storage.example.org/themes/custom.css # custom css
```

## Reverse proxy and SSL/TLS
> \[!WARNING\]
> In a production environment, configure SSL/TLS termination to run your instance on https.

Follow our [example](../examples/compose/nginx-proxy/README.md) for automatic generation and renewal of certificate with Let's Encrypt and nginx-proxy. If you have your own certificates and proxy setup, you can skip this part. 
You will then need to set the following environment variables:
```env
VIRTUAL_HOST=https://docs.example.org
VIRTUAL_PORT=8080
LETSENCRYPT_HOST=https://docs.example.org
```

## Start Docs
You are ready to start your Docs application ! 
```bash
curl -o compose.yaml https://github.com/suitenumerique/docs/tree/main/docs/docs/examples/compose/compose.yaml
docker-compose up -d
```

Your docs instance is now avalailable on the domain you defined, eg. https://docs.example.org
