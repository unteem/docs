# Deploy and Configure Keycloak for Docs Application

## Installation

> \[!NOTE\]
> You can skip this section if you already have an identity provider.

> \[!CAUTION\]
> We provide those instructions as an example, for extended development or production environments, you should follow the [official documentation](https://www.keycloak.org/documentation).

### Step 1: Prepare your working environment:
```bash
mkdir keycloak
curl -o compose.yaml https://github.com/unteem/docs/blob/compose-production/docs/examples/compose/keycloak/compose.yaml
curl -o env https://github.com/unteem/docs/blob/compose-production/docs/examples/compose/keycloak/env
```

### Step 2:. Update `env` file with your own values

### Step 3: Expose keycloak instance on https

To access your Keycloak instance, it needs to be exposed on a domain with SSL termination. You can use our [example](../nginx-proxy/README.md) with an nginx proxy and Let's Encrypt companion for automated creation/renewal of Let's Encrypt certificates using [acme.sh](http://acme.sh).

If following our example, uncomment this section in compose file and update it with your values.
```yaml
version: '3'
services:
   docs:
   ...
  keycloak:
   ...
    # Uncomment and set your values if using our nginx proxy example
    # environment:
    # - VIRTUAL_HOST=https://id.example.org # used by nginx proxy 
    # - VIRTUAL_PORT=8080 # used by nginx proxy
    # - LETSENCRYPT_HOST=https://id.example.org # used by lets encrypt to generate TLS certificate
```

### Step 4: Start the service
```bash
`docker-compose up -d`
```

Your keycloak instance is now available on https://doc.example.org

## Creating an OIDC Client for Docs Application

### Step 1: Create a New Realm

1.  Log in to the Keycloak administration console.
2.  Click on the "Add Realm" button.
3.  Enter the name of the realm (e.g., "docs").
4.  Click "Create".

#### Step 2: Create a New Client

1.  Navigate to the "Clients" tab in the Keycloak administration console.
2.  Click on the "Create client" button.
3.  Enter the client ID (e.g., "docs").
4.  Choose "openid-connect" as the client protocol.
5.  Click "Save".

#### Step 3: Configure Client Settings

1.  Go to the "Settings" tab.
2.  Set the "Client Protocol" to "openid-connect".
3.  Set the "Access Type" to "confidential".
4.  Set the "Standard Flow Enabled" to "ON".
5.  Set the "Direct Access Grants Enabled" to "ON".
6.  Set the "Web Origins" to the URL of your docs application (e.g., "<https://docs.example.com>").
7.  Click "Save".

#### Step 4: Configure OIDC Settings

1.  Go to the "OpenID Connect Settings" tab.
2.  Set the "Redirect URI" to the URL of your docs application (e.g., "<https://docs.example.com/login/callback>").
3.  Set the "Logout Redirect URI" to the URL of your docs application (e.g., "<https://docs.example.com/logout/callback>").
4.  Click "Save".

#### Step 5: Get Client Credentials

1.  Go to the "Credentials" tab.
2.  Copy the client ID and client secret.
