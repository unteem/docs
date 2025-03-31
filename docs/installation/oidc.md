# OIDC Configuration

The following variable are used to configure Docs with OIDC. It is need for users' authentification.

| Option                                          | Description                                                                                   | default                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| OIDC_CREATE_USER                                | Enables or disables automatic user creation during authentication                                                                           | true                                                   |
| OIDC_RP_SIGN_ALGO                               | Sets the algorithm the IdP uses to sign ID tokens                                                       | RS256                                                   |
| OIDC_RP_CLIENT_ID                               | OpenID Connect client ID provided by your OP                                                                       | impress                                                 |
| OIDC_RP_CLIENT_SECRET                           | OpenID Connect client secret provided by your OP                                                                   |                                                         |
| OIDC_OP_JWKS_ENDPOINT                           | URL of your OpenID Connect provider JWKS (JSON Web Key Sets) endpoint                                                                       |                                                         |
| OIDC_OP_AUTHORIZATION_ENDPOINT                  | URL of your OpenID Connect provider authorization endpoint                                                               |                                                         |
| OIDC_OP_TOKEN_ENDPOINT                          | URL of your OpenID Connect provider token endpoint                                                                       |                                                         |
| OIDC_OP_USER_ENDPOINT                           | URL of your OpenID Connect provider userinfo endpoint                                                                        |                                                         |
| OIDC_OP_LOGOUT_ENDPOINT                         | Logout endpoint for OIDC   // TODO                                                                    |                                                         |
| OIDC_AUTH_REQUEST_EXTRA_PARAMS                  | Additional parameters to include in the initial authorization request                                                                    | {}                                                      |
| OIDC_RP_SCOPES                                  | The OpenID Connect scopes to request during login                                                                     | openid email                                            |
| LOGIN_REDIRECT_URL                              | Path to redirect to on successful login. If you don’t specify this, the default Django value will be used.                                                                            |                                                         |
| LOGIN_REDIRECT_URL_FAILURE                      | Path to redirect to on an unsuccessful login attempt.                                                                 |                                                         |
| LOGOUT_REDIRECT_URL                             | After the logout view has logged the user out, it redirects to this url path.                                                                           |                                                         |
| OIDC_USE_NONCE                                  | Controls whether the OpenID Connect client uses nonce verification                                                                            | true                                                    |
| OIDC_REDIRECT_REQUIRE_HTTPS                     | Require https for OIDC redirect url         TODO                                                  | false                                                   |
| OIDC_REDIRECT_ALLOWED_HOSTS                     | Allowed hosts for OIDC redirect url         TODO                                                  | \[\]                                                    |
| OIDC_STORE_ID_TOKEN                             | Controls whether the OpenID Connect client stores the OIDC id_token in the user session. The session key used to store the data is oidc_id_token.                                                                              | true                                                    |
| OIDC_FALLBACK_TO_EMAIL_FOR_IDENTIFICATION       | faillback to email for identification  TODO                                                       | true                                                    |
| OIDC_ALLOW_DUPLICATE_EMAILS                     | Allow dupplicate emails        TODO                                                               | false                                                   |
| USER_OIDC_ESSENTIAL_CLAIMS                      | essential claims in OIDC token         TODO                                                       | \[\]                                                    |
| USER_OIDC_FIELDS_TO_FULLNAME                    | OIDC token claims to create full name TODO                                                        | \["first_name", "last_name"\]                           |
| USER_OIDC_FIELD_TO_SHORTNAME                    | OIDC token claims to create shortname     TODO                                                    | first_name                                              |
| ALLOW_LOGOUT_GET_METHOD                         | Allow using GET method to logout user                                                                       | true                                                    |

## Example with Keycloak

OIDC_OP_JWKS_ENDPOINT=https://<your_keycloak_url>/realms/impress/protocol/openid-connect/certs
OIDC_OP_AUTHORIZATION_ENDPOINT=https://<your_keycloak_url>/realms/impress/protocol/openid-connect/auth
OIDC_OP_TOKEN_ENDPOINT=https://<your_keycloak_url>/realms/impress/protocol/openid-connect/token
OIDC_OP_USER_ENDPOINT=https://<your_keycloak_url>/realms/impress/protocol/openid-connect/userinfo
OIDC_OP_LOGOUT_ENDPOINT=https://<your_keycloak_url>/realms/impress/protocol/openid-connect/logout
OIDC_RP_CLIENT_ID=<your_client_id>
OIDC_RP_CLIENT_SECRET=<your_client_secret>
OIDC_RP_SIGN_ALGO=RS256
OIDC_RP_SCOPES="openid email"
// TODO
USER_OIDC_FIELD_TO_SHORTNAME="given_name"
// TODO
USER_OIDC_FIELDS_TO_FULLNAME="given_name,usual_name"

LOGIN_REDIRECT_URL=https://<your_docs_url>
LOGIN_REDIRECT_URL_FAILURE=https://<your_docs_url>
LOGOUT_REDIRECT_URL=https://<your_docs_url>

OIDC_REDIRECT_ALLOWED_HOSTS=["https://<your_docs_url>"]

## Example with Gitlab
