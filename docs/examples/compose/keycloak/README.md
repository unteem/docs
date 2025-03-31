# Deploy Keycloak with docker compose

## Installation

> \[!NOTE\]
> You can skip this section if you already have an identity provider.

> \[!CAUTION\]
> We provide those instructions as an example, for extended development or production environments, you should follow the [official documentation](https://www.keycloak.org/documentation).

1. Copy Keycloak docker compose file:

```
curl -o compose.yaml https://github.com/suitenumerique/docs/tree/main/docs/examples/compose/keycloak/compose.yaml
```

2. Copy the environment variables files:

```
curl -o env https://github.com/suitenumerique/docs/tree/main/docs/examples/compose/keycloak/env
```

3. Edit `env` file and change the values with your own

4. Run the service with `docker-compose up -d`

Your keycloak instances needs to be exposed on a domain with SSL/TLS termination. You can use our example with nginx let's encrypt companion for an automated creation/renewal of Let's Encrypt certificates using acme.sh.

> \[!NOTE\]
> You will need a proxy to access your keycloak and to get TLS/SSL HTTPS, and [exemple with nginx proxy is available](../nginx-proxy/README.md). Need to set variable VIRTUAL_HOST, VIRTUAL_PORT, LETS_ENCRYPT_HOST to work

Your keycloak instance should now be available on https://\<your_keycloak_url>

## Configuration

### Step 1: Create a New Realm

1.  Log in to the Keycloak administration console.
2.  Click on the "Add Realm" button.
3.  Enter the name of the realm (e.g., "docs").
4.  Click "Create".

### Creating an OIDC Client for Docs Application

#### Step 1: Create a New Client

1.  Navigate to the "Clients" tab in the Keycloak administration console.
2.  Click on the "Create client" button.
3.  Enter the client ID (e.g., "docs-client").
4.  Choose "openid-connect" as the client protocol.
5.  Click "Save".

#### Step 2: Configure Client Settings

1.  Go to the "Settings" tab.
2.  Set the "Client Protocol" to "openid-connect".
3.  Set the "Access Type" to "confidential".
4.  Set the "Standard Flow Enabled" to "ON".
5.  Set the "Direct Access Grants Enabled" to "ON".
6.  Set the "Web Origins" to the URL of your docs application (e.g., "<https://docs.example.com>").
7.  Click "Save".

#### Step 3: Configure OIDC Settings

1.  Go to the "OpenID Connect Settings" tab.
2.  Set the "Redirect URI" to the URL of your docs application (e.g., "<https://docs.example.com/login/callback>").
3.  Set the "Logout Redirect URI" to the URL of your docs application (e.g., "<https://docs.example.com/logout/callback>").
4.  Click "Save".

#### Step 4: Get Client Credentials

1.  Go to the "Credentials" tab.
2.  Copy the client ID and client secret.
