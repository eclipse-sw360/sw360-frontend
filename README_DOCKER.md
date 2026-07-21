# SW360 Frontend - Docker

This guide covers running the SW360 Frontend, together with a complete SW360
stack, using Docker (Compose V2) or Podman. For backend-specific configuration,
refer to the
[SW360 Backend Docker documentation](https://github.com/eclipse-sw360/sw360/blob/main/README_DOCKER.md).

> [!WARNING]
> **This is a reference/starter setup, not a turn-key production deployment.**
> Every secret, password, certificate, hostname and URL shipped here is a
> non-secret placeholder meant to get you running quickly. You **must** review
> and adapt the compose files, environment files and secrets to fit your own
> network, security policy and availability requirements before exposing this to
> anyone. Treat the files under `config/` as templates you own and edit.

## Table of Contents

* [Prerequisites](#prerequisites)
* [Stack Overview](#stack-overview)
* [Quick Start](#quick-start)
* [Stack Setup](#stack-setup)
  * [1. Generate Secrets](#1-generate-secrets)
  * [2. Choose Build-Time Values and Build](#2-choose-build-time-values-and-build)
  * [3. Start the Stack](#3-start-the-stack)
  * [4. Initialize Keycloak (One-Time)](#4-initialize-keycloak-one-time)
  * [5. Wire the Keycloak Client Secret](#5-wire-the-keycloak-client-secret)
* [Build-Time Variables (Important)](#build-time-variables-important)
* [Configuration Reference](#configuration-reference)
  * [Frontend Environment Variables](#frontend-environment-variables)
  * [Authentication Providers](#authentication-providers)
  * [Backend Environment and Secrets](#backend-environment-and-secrets)
  * [CouchDB Configuration](#couchdb-configuration)
* [Secrets and Credential Generation](#secrets-and-credential-generation)
* [Security Hardening](#security-hardening)
* [Services in the Stack](#services-in-the-stack)
  * [Keycloak (Authentication)](#keycloak-authentication)
  * [PostgreSQL (Keycloak Database)](#postgresql-keycloak-database)
  * [Nginx (Reverse Proxy)](#nginx-reverse-proxy)
* [Networking](#networking)
* [Volumes and Persistence](#volumes-and-persistence)
* [FOSSology Integration](#fossology-integration)
* [Rootless Port 443](#rootless-port-443)

## Prerequisites

* Docker (with Compose V2) **or** Podman (with `podman compose` /
  `podman-compose`)
* Outbound access to pull images:
  * `ghcr.io/eclipse-sw360/sw360` (backend)
  * `ghcr.io/eclipse-sw360/sw360-frontend` (frontend, or build locally)
  * `ghcr.io/eclipse-sw360/sw360/keycloak` (Keycloak)
  * upstream `couchdb`, `postgres` and `nginx` images
* A machine with a few GB of free RAM; the backend and Keycloak are the heaviest
  services.

The commands below use `docker compose`. For Podman substitute
`podman compose` (or `podman-compose`) — the compose files are engine-agnostic.

## Stack Overview

This repository now ships a single compose stack:

| File | Services | Auth |
|---|---|---|
| [`docker-compose.yml`](docker-compose.yml) | backend, CouchDB (+ Nouveau), frontend, Keycloak, PostgreSQL, Nginx | `keycloak` (recommended) |

It is a complete reference stack intended as a starting point for local and
production-like environments.

## Quick Start

1. Start the stack:

    ```sh
    docker compose up -d
    ```

2. Access the frontend at [http://localhost:3000](http://localhost:3000) and the
   backend API at [http://localhost:8080](http://localhost:8080). The Swagger UI
   is at
   [http://localhost:8080/resource/swagger-ui/index.html](http://localhost:8080/resource/swagger-ui/index.html).

   For Keycloak login, bootstrap realm/client first (see step 4 below).

To view logs:

```sh
docker compose logs -f sw360-frontend
```

> [!NOTE]
> The frontend needs the `NEXTAUTH_SECRET` Docker secret (it encrypts session
> cookies). The compose file mounts it from
> [config/front-end/nextauth_secret](config/front-end/nextauth_secret). Replace
> that placeholder with your own value (see
> [Secrets and Credential Generation](#secrets-and-credential-generation)).

## Stack Setup

The [docker-compose.yml](docker-compose.yml) file includes Keycloak,
PostgreSQL and an Nginx reverse proxy. Everything is reachable behind a single
HTTPS endpoint.

The bring-up is a five-step sequence. Read
[Build-Time Variables (Important)](#build-time-variables-important) before you
build.

### 1. Generate Secrets

The repository ships placeholder secrets so the stack starts out of the box.
**Regenerate all of them before any real use** — see
[Secrets and Credential Generation](#secrets-and-credential-generation) for the
full list and commands. At minimum, generate a fresh session secret:

```sh
openssl rand -base64 32 | tr -d '\n' > config/front-end/nextauth_secret
```

### 2. Choose Build-Time Values and Build

The frontend bakes two values into its client bundle **at build time**
(see [Build-Time Variables](#build-time-variables-important)). For this stack,
edit the `sw360-frontend` service's `build.args` in
[docker-compose.yml](docker-compose.yml):

```yaml
  sw360-frontend:
    build:
      context: .
      args:
        NEXT_PUBLIC_SW360_API_URL: https://localhost        # your public API URL
        NEXT_PUBLIC_SW360_AUTH_PROVIDER: keycloak           # keycloak | sw360oauth | sw360basic
        NEXTAUTH_URL: https://localhost
```

Then build the frontend image:

```sh
docker compose -f docker-compose.yml build sw360-frontend
```

### 3. Start the Stack

```sh
docker compose -f docker-compose.yml up -d
```

Once healthy, the whole stack is served through Nginx over HTTPS:

| URL | Service |
|---|---|
| `https://localhost/` | Frontend |
| `https://localhost/resource` | SW360 REST API |
| `https://localhost/authorization` | SW360 OAuth2 endpoints |
| `https://localhost/kc` | Keycloak |

The default certificate is a self-signed snakeoil cert — your browser will warn.
Replace it for anything beyond local testing (see
[Nginx (Reverse Proxy)](#nginx-reverse-proxy)).

After this point, you should be good to use the stack with basic auth and
visit the frontend at <https://localhost/>. The default credentials are `setup@sw360.org`
/ `sw360fossie`.

If you need to use the stack with Keycloak, continue with the next steps.

### 4. Initialize Keycloak (One-Time)

Keycloak needs a one-time realm and client bootstrap. Use the upstream
OpenTofu/Terraform script and follow its guide:

* Script: [eclipse-sw360/sw360 · third-party/keycloak-tf](https://github.com/eclipse-sw360/sw360/tree/main/third-party/keycloak-tf)
* Guide: [third-party/keycloak-tf/README.md](https://github.com/eclipse-sw360/sw360/blob/main/third-party/keycloak-tf/README.md)

This creates the `sw360` realm and the frontend (UI) client. The
[config/keycloak/.env.keycloak](config/keycloak/.env.keycloak) file sets the
Keycloak admin bootstrap credentials and points Keycloak at the bundled
`postgres` service — change the admin password before running.

> [!NOTE]
> If OpenTofu fails during provider login with a certificate mismatch on local
> self-signed TLS (for example, cert is not valid for `localhost`), you can
> temporarily disable TLS verification in `provider.tf`:
>
> ```hcl
> provider "keycloak" {
>   # ... existing settings ...
>   tls_insecure_skip_verify = true
> }
> ```
>
> Use this only for local bootstrap/testing. For real deployments, replace the
> default cert with one whose SAN/CN matches your Keycloak URL and keep TLS
> verification enabled.

### 5. Wire the Keycloak Client Secret

After Keycloak is initialized, goto Keycloak console and navigate to the `sw360`
realm → Clients → `sw360ui` → Credentials. Copy the **Client Secret** value.

Then write it, with no trailing newline, to the frontend Keycloak secret file:

```sh
printf '%s' 'PASTE-UI-CLIENT-SECRET-HERE' > config/keycloak/sw360_frontend_kc_secret
```

Make sure the frontend is pointed at Keycloak in
[config/front-end/.env.frontend](config/front-end/.env.frontend):

```env
NEXT_PUBLIC_SW360_AUTH_PROVIDER=keycloak
SW360_KEYCLOAK_CLIENT_ID=sw360ui
AUTH_ISSUER=https://localhost/kc/realms/sw360
```

Then rebuild the frontend image since we are changing the auth provider, and it
is a build time variable:

```sh
export NEXT_PUBLIC_SW360_AUTH_PROVIDER=keycloak
docker compose -f docker-compose.yml build sw360-frontend
```

Then recreate the containers for frontend and web so its entrypoint re-reads the
mounted secret and regenerates the runtime `.env`:

```sh
docker compose -f docker-compose.yml up -d --force-recreate sw360-frontend web
```

> [!IMPORTANT]
> `SW360_KEYCLOAK_CLIENT_SECRET` is delivered to the frontend as the
> `SW360_FRONTEND_KC_SECRET` Docker secret and consumed by
> [config/front-end/entrypoint.sh](config/front-end/entrypoint.sh) at container
> start. Updating the secret file therefore requires a **container restart**, not
> just an env change. Because `NEXT_PUBLIC_SW360_AUTH_PROVIDER` is build-time, if
> you changed it you must also **rebuild** the image (step 2).

## Build-Time Variables (Important)

Two frontend variables are Next.js *public* variables. They are embedded into
the client-side JavaScript bundle during `pnpm build` and **cannot be changed at
runtime**:

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_SW360_API_URL` | Base URL of the backend REST API, as seen by the browser |
| `NEXT_PUBLIC_SW360_AUTH_PROVIDER` | Auth provider: `sw360basic`, `sw360oauth`, or `keycloak` |

Because they are baked in, setting them only in an env file has **no effect** on
an already-built image. To use different values you must:

1. Edit the `build.args` for the `sw360-frontend` service in the compose file.
2. Rebuild the image:

   ```sh
   docker compose -f docker-compose.yml build sw360-frontend
   ```

3. Recreate the container:

   ```sh
   docker compose -f docker-compose.yml up -d sw360-frontend
   ```

The prebuilt image published on ghcr.io defaults to
`NEXT_PUBLIC_SW360_API_URL=http://localhost:8080` and
`NEXT_PUBLIC_SW360_AUTH_PROVIDER=sw360basic`. Any deployment with a different API
URL or auth provider must build its own image.

## Configuration Reference

### Frontend Environment Variables

Frontend runtime configuration lives in
[config/front-end/.env.frontend](config/front-end/.env.frontend).

| Variable | Description | Default |
|---|---|---|
| `NEXTAUTH_URL` | Public URL where the frontend is accessed | `http://localhost:3000` |
| `NEXTAUTH_URL_INTERNAL` | Internal URL for server-side auth callbacks (Docker network) | `http://sw360-frontend:3000` |
| `NEXT_PUBLIC_SW360_API_URL` | Backend REST API URL (**build-time**, client-side) | `http://localhost:8080` |
| `NEXT_PUBLIC_SW360_AUTH_PROVIDER` | Authentication provider (**build-time**, see below) | `sw360basic` |
| `SW360_SESSION_REFETCH_INTERVAL_SECONDS` | Background token refresh interval (seconds) | `300` |
| `SW360_API_URL` | Backend REST API URL (**run-time**, server-side) | `http://sw360:8080` |

The session secret (`NEXTAUTH_SECRET`) and the Keycloak client secret are **not**
set here — they are delivered as Docker secrets (see
[Secrets and Credential Generation](#secrets-and-credential-generation)).

> [!NOTE]
> The frontend communicates with the backend at two locations. One is at the
> client-side, i.e., the browser. This communication uses the address from
> `NEXT_PUBLIC_SW360_API_URL`, which must be set at the build time of the image.
> The other is at the server-side (primarily for auth), which can be set at
> runtime via `SW360_API_URL`. Depending on your setup, the values may differ
> for the variables.

### Authentication Providers

The frontend supports three providers, selected via the build-time
`NEXT_PUBLIC_SW360_AUTH_PROVIDER`:

#### `sw360basic` — Built-in Basic Auth

Uses the SW360 backend's built-in authentication. No extra configuration beyond
the defaults; simplest for development and testing. Default credentials:

* Username: `setup@sw360.org`
* Password: `sw360fossie`

Override with `COUCHDB_ADMIN_EMAIL` / `COUCHDB_ADMIN_PASSWORD` in
[config/sw360/.env.backend](config/sw360/.env.backend).

#### `sw360oauth` — SW360 OAuth2

Uses the SW360 backend's built-in OAuth2 authorization server. Set these in
[config/front-end/.env.frontend](config/front-end/.env.frontend):

| Variable | Description | Default |
|---|---|---|
| `SW360_REST_CLIENT_ID` | OAuth2 client ID | `authorization-id` |
| `SW360_REST_CLIENT_SECRET` | OAuth2 client secret | `autorization-secret` |
| `AUTH_ISSUER` | OAuth2 issuer URL | _(commented out)_ |

Refer to the backend documentation for details.

#### `keycloak` — Keycloak OpenID Connect

Uses an external/bundled Keycloak instance. **Recommended for production-like
setups** in this stack. Set in
[config/front-end/.env.frontend](config/front-end/.env.frontend):

| Variable | Description | Default |
|---|---|---|
| `SW360_KEYCLOAK_CLIENT_ID` | Keycloak client ID | `sw360ui` |
| `AUTH_ISSUER` | Keycloak realm URL, e.g. `https://localhost/kc/realms/sw360` | _(commented out)_ |

The client secret is provided via the `SW360_FRONTEND_KC_SECRET` Docker secret
([config/keycloak/sw360_frontend_kc_secret](config/keycloak/sw360_frontend_kc_secret)),
not in this env file. See
[5. Wire the Keycloak Client Secret](#5-wire-the-keycloak-client-secret).

### Backend Environment and Secrets

The backend container is configured via
[config/sw360/.env.backend](config/sw360/.env.backend). See the
[backend Docker documentation](https://github.com/eclipse-sw360/sw360/blob/main/README_DOCKER.md#environment-variables)
for the full variable list.

Keep the backend trusted-issuer list aligned with the token issuers used by the
selected auth provider:

```env
SW360_SECURITY_JWT_ISSUERS_0_ISSUER_URI=http://localhost:8080/authorization
SW360_SECURITY_JWT_ISSUERS_1_ISSUER_URI=https://localhost/kc/realms/sw360
# optional direct JWKS endpoint override:
# SW360_SECURITY_JWT_ISSUERS_1_JWK_SET_URI=https://localhost/kc/realms/sw360/protocol/openid-connect/certs
```

Issuer `*_ISSUER_URI` values must exactly match the JWT `iss` claim and must be
reachable from the `sw360` container for OIDC discovery / JWKS lookup. The same
trusted-issuer list is used by both the `/resource` and `/authorization` Bearer
JWT validation paths. Add the Keycloak realm issuer when
`NEXT_PUBLIC_SW360_AUTH_PROVIDER=keycloak`, or when integrations call the REST
API with Keycloak-issued Bearer tokens.

Sensitive backend values are stored as Docker secrets in
[config/sw360/default_secrets](config/sw360/default_secrets).

### CouchDB Configuration

CouchDB bootstrap credentials are stored in
[config/couchdb/default_secrets](config/couchdb/default_secrets) (the CouchDB
image reads env vars, not Docker secrets). Additional settings are mounted as
files:

* [sw360_setup.ini](config/couchdb/sw360_setup.ini) — node setup and admin
  credentials
* [sw360_log.ini](config/couchdb/sw360_log.ini) — logging level
* [nouveau.ini](config/couchdb/nouveau.ini) — Nouveau full-text search
  configuration (connects to the `couchdb-nouveau` sidecar)

## Secrets and Credential Generation

The files shipped under `config/` contain **demo placeholders**. Generate your
own before exposing the stack. Keep generated secrets out of version control.

| Secret | File | Consumed by |
|---|---|---|
| Session encryption key | `config/front-end/nextauth_secret` | Frontend (`NEXTAUTH_SECRET`) |
| Keycloak UI client secret | `config/keycloak/sw360_frontend_kc_secret` | Frontend (`SW360_FRONTEND_KC_SECRET`) |
| PostgreSQL password | `config/postgres/postgresql_password` | PostgreSQL + Keycloak |
| CouchDB credentials | `config/couchdb/default_secrets` | CouchDB + backend |
| Backend secrets | `config/sw360/default_secrets` | Backend (JWT key, API-token salt, …) |
| JWT signing keystore | `config/sw360/jwt-keystore.jks` | Backend |

Example generation:

```sh
# Frontend session secret
openssl rand -base64 32 | tr -d '\n' > config/front-end/nextauth_secret

# PostgreSQL password (must also match KC_DB_PASSWORD in config/keycloak/.env.keycloak)
openssl rand -base64 24 | tr -d '\n' > config/postgres/postgresql_password

# Keycloak UI client secret: paste the value emitted by the keycloak-tf run
printf '%s' 'PASTE-UI-CLIENT-SECRET-HERE' > config/keycloak/sw360_frontend_kc_secret
```

For the backend [config/sw360/default_secrets](config/sw360/default_secrets),
replace the demo values:

```env
JWT_SECRETKEY=<a-long-random-string>
REST_APITOKEN_HASH_SALT='$2a$04$<22-char-bcrypt-salt>'
```

You can generate a bcrypt-style salt tail with:

```sh
REST_APITOKEN_HASH_SALT='$2a$04$'"$(openssl rand -hex 16 | head -c 22)"
echo "$REST_APITOKEN_HASH_SALT"
```

> [!IMPORTANT]
> `REST_APITOKEN_HASH_SALT` must stay **stable** after deployment. Changing it
> invalidates every already-issued REST API token.

CouchDB credentials in
[config/couchdb/default_secrets](config/couchdb/default_secrets)
(`COUCHDB_USER`, `COUCHDB_PASSWORD`, `COUCHDB_SECRET`) must be kept in sync with
the backend's `COUCHDB_USER` in
[config/sw360/.env.backend](config/sw360/.env.backend) and the CouchDB admin
entry in [config/couchdb/sw360_setup.ini](config/couchdb/sw360_setup.ini).

For the JWT signing keystore and (optional) SVM trust store, follow the upstream
security guides:

* JWT signing keystore: <https://eclipse.dev/sw360/docs/administrationguide/securing-sw360/#2-jwt-signing-keystore>
* General SW360 security guide: <https://eclipse.dev/sw360/docs/administrationguide/securing-sw360/>

## Security Hardening

The defaults favour a frictionless first run, **not** security. Before any real
deployment, at least:

* **Rotate every credential**: `nextauth_secret`, Keycloak admin password
  (`KC_BOOTSTRAP_ADMIN_PASSWORD`), Keycloak UI client secret, `JWT_SECRETKEY`,
  PostgreSQL password, and CouchDB `COUCHDB_PASSWORD` / `COUCHDB_SECRET`.
* **Disable HTTP Basic auth** once Keycloak/OAuth is in place: set
  `SW360_SECURITY_HTTP_BASIC_ENABLED=false` in
  [config/sw360/.env.backend](config/sw360/.env.backend).
* **Restrict CORS**: replace `SW360_CORS_ALLOWED_ORIGIN=*` with your explicit
  origin(s).
* **Use a real TLS certificate**: replace the self-signed snakeoil cert in the
  Nginx service with a certificate issued for your domain, and set
  `SERVER_DOMAIN` in [config/nginx/.env.web](config/nginx/.env.web).
* **Keep `REST_APITOKEN_HASH_SALT` stable** (see above) but non-default.
* **Pin image tags**: set `SW360_VERSION` / `SW360_FRONTEND_VERSION` (and the
  supporting image tags) to specific, validated tags or digests instead of
  `main`/`latest`.
* **Minimize exposed ports**: in production, publish only the Nginx `443` port
  and drop the direct `8080`/`3000`/`5984`/`5432`/`8083` mappings, so all
  traffic flows through the reverse proxy.
* **Keep trusted JWT issuers tight and reachable**, matching only the issuers you
  actually use.
* **Never commit real secrets.** The values in this repo are placeholders; treat
  your generated secrets as sensitive.

This list is a starting point — extend it to match your own threat model and
compliance requirements.

## Services in the Stack

### Keycloak (Authentication)

Keycloak provides OpenID Connect authentication for both the frontend and the
backend API. It is configured via
[config/keycloak/.env.keycloak](config/keycloak/.env.keycloak) and uses the
bundled PostgreSQL as its database. Behind the reverse proxy it is reachable at
`https://localhost/kc`.

Its one-time realm/client bootstrap is described in
[4. Initialize Keycloak (One-Time)](#4-initialize-keycloak-one-time).

### PostgreSQL (Keycloak Database)

PostgreSQL is the database for Keycloak. It is configured via
[config/postgres/.env.postgres](config/postgres/.env.postgres); the password is a
Docker secret at
[config/postgres/postgresql_password](config/postgres/postgresql_password) and
must match `KC_DB_PASSWORD` in
[config/keycloak/.env.keycloak](config/keycloak/.env.keycloak).

### Nginx (Reverse Proxy)

The Nginx service is an SSL-terminating reverse proxy that consolidates all
services behind a single HTTPS endpoint on port 443.

The proxy template
[config/nginx/rev_proxy.template](config/nginx/rev_proxy.template) uses Nginx's
`envsubst` mechanism and routes traffic as follows:

| Path | Upstream | Description |
|---|---|---|
| `/` | `sw360-frontend:3000` | Next.js frontend |
| `/resource` | `sw360:8080` | SW360 REST API |
| `/authorization` | `sw360:8080` | SW360 OAuth2 endpoints |
| `/kc` | `keycloak:8083` | Keycloak admin and auth |

The template installs a self-signed snakeoil certificate for TLS. **For
production, replace it with your own certificate.** The public domain is set via
`SERVER_DOMAIN` in [config/nginx/.env.web](config/nginx/.env.web). Common proxy
headers are defined in [config/nginx/proxy_params](config/nginx/proxy_params).

## Networking

All services run in a shared external Docker network called `sw360net`. Using an
external network lets other containers (e.g. FOSSology) join the same network and
communicate with the SW360 services.

## Volumes and Persistence

| Volume | Mount Point | Description |
|---|---|---|
| `couchdb` | `/opt/couchdb/data` | CouchDB database files |
| `etc` | `/etc/sw360` | SW360 backend generated configuration |
| `postgres_storage` | `/var/lib/postgresql` | Keycloak database |

## FOSSology Integration

FOSSology integration is handled on the backend side. Refer to the
[SW360 Backend Docker documentation](https://github.com/eclipse-sw360/sw360/blob/main/README_DOCKER.md#fossology-integration)
for setup instructions.

## Rootless Port 443

Rootless containers cannot bind privileged ports (<1024) by default. Either:

### Podman
```bash
# allow the podman binary to bind privileged ports
sudo setcap CAP_NET_BIND_SERVICE=+eip "$(which podman)"
# or lower the unprivileged-port floor system-wide
sudo sysctl -w net.ipv4.ip_unprivileged_port_start=443
```

### Docker
```bash
# allow the docker binary to bind privileged ports
sudo setcap CAP_NET_BIND_SERVICE=+eip "$(which docker)"
# or lower the unprivileged-port floor system-wide
sudo sysctl -w net.ipv4.ip_unprivileged_port_start=443
```
