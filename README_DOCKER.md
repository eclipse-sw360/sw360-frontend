# SW360 Frontend - Docker

This guide covers running the SW360 Frontend using Docker/Podman containers.
For backend-specific configuration, refer to the
[SW360 Backend Docker documentation](https://github.com/eclipse-sw360/sw360/blob/main/README_DOCKER.md).

## Table of Contents

* [Prerequisites](#prerequisites)
* [Quick Start](#quick-start)
* [Customizing and Building](#customizing-and-building)
* [Configuration](#configuration)
  * [Frontend Environment Variables](#frontend-environment-variables)
  * [Authentication Providers](#authentication-providers)
  * [Backend Environment and Secrets](#backend-environment-and-secrets)
  * [CouchDB Configuration](#couchdb-configuration)
* [Full Stack Setup](#full-stack-setup)
  * [Keycloak (Authentication)](#keycloak-authentication)
  * [PostgreSQL (Keycloak Database)](#postgresql-keycloak-database)
  * [Nginx (Reverse Proxy)](#nginx-reverse-proxy)
* [Networking](#networking)
* [Volumes and Persistence](#volumes-and-persistence)
* [FOSSology Integration](#fossology-integration)

## Prerequisites

* Docker (with Compose V2) or Podman (with `podman-compose`)
* The SW360 backend image: `ghcr.io/eclipse-sw360/sw360`

## Quick Start

1. Start the basic stack (backend + CouchDB + frontend):

    ```sh
    docker compose up -d
    ```

2. Access the frontend at [http://localhost:3000](http://localhost:3000) and
   the backend API at [http://localhost:8080](http://localhost:8080). You can
   play with Swagger UI hosted at
   [http://localhost:8080/resource/swagger-ui/index.html](http://localhost:8080/resource/swagger-ui/index.html).

To view logs:

```sh
docker compose logs -f sw360-frontend
```

## Customizing and building

The frontend application expects a base API URL for backend at build time using
the variable `NEXT_PUBLIC_SW360_API_URL`. With the default image available at
ghcr.io, this defaults to `http://localhost:8080`. To use a different backend,
you need to customize your image and build it locally using Docker Compose. To
override the default backend URL (`http://localhost:8080`):

```sh
NEXT_PUBLIC_SW360_API_URL=https://sw360.example.org docker compose build
```

> [!IMPORTANT]
> `NEXT_PUBLIC_SW360_API_URL` is a Next.js public variable that gets embedded
> in the client-side JavaScript bundle during `pnpm build`. Changing it after
> the build has **no effect** - the image must be rebuilt.

### Secure build
The docker image also uses secrets like `AUTH_SECRET` and
`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` which should be rotated between builds. You
can provide the values for the same in your environment variable with
recommended random values (or equivalent predefined values).

```shell
export AUTH_SECRET=$(openssl rand -base64 32)
export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$(openssl rand -base64 32)
docker compose build
```

## Configuration

### Frontend Environment Variables

Frontend runtime configuration is stored in
[config/front-end/.env.frontend](config/front-end/.env.frontend).

| Variable | Description | Default |
|---|---|---|
| `AUTH_SECRET` | Secret used to encrypt session tokens. **Change this in production.** | `secret` |
| `NEXTAUTH_URL` | Public URL where the frontend is accessed | `http://localhost:3000` |
| `NEXTAUTH_URL_INTERNAL` | Internal URL for server-side auth callbacks (Docker network) | `http://sw360-frontend:3000` |
| `NEXT_PUBLIC_SW360_API_URL` | Backend REST API URL (client-side, set at build time) | `http://localhost:8080` |
| `NEXT_PUBLIC_SW360_AUTH_PROVIDER` | Authentication provider to use (see below) | `sw360basic` |

### Authentication Providers

The frontend supports three authentication providers, configured via
`NEXT_PUBLIC_SW360_AUTH_PROVIDER`:

#### `sw360basic` - Built-in Basic Auth

Uses the SW360 backend's built-in authentication. No additional configuration
is required beyond the defaults. This is the simplest setup for development and
testing. The default credentials for the same in backend are:
Username: `setup@sw360.org`
Password: `sw360fossie`

They can be overriden in [config/sw360/.env.backend](config/sw360/.env.backend)
with the variables `COUCHDB_ADMIN_EMAIL` and `COUCHDB_ADMIN_PASSWORD`.

#### `sw360oauth` - SW360 OAuth2

Uses the SW360 backend's built-in OAuth2 authorization server. Set these
additional variables in
[config/front-end/.env.frontend](config/front-end/.env.frontend):

| Variable | Description | Default |
|---|---|---|
| `SW360_REST_CLIENT_ID` | OAuth2 client ID | `authorization-id` |
| `SW360_REST_CLIENT_SECRET` | OAuth2 client secret | `autorization-secret` |
| `AUTH_ISSUER` | OAuth2 issuer URL | _(commented out)_ |

Check backend documentations for more details.

#### `keycloak` - Keycloak OpenID Connect

Uses an external Keycloak instance for authentication. **This is the
recommended setup for production.** See [Full Stack Setup](#full-stack-setup)
for running Keycloak alongside the frontend.

Set these additional variables in
[config/front-end/.env.frontend](config/front-end/.env.frontend):

| Variable | Description | Default |
|---|---|---|
| `SW360_KEYCLOAK_CLIENT_ID` | Keycloak client ID | `sw360ui` |
| `SW360_KEYCLOAK_CLIENT_SECRET` | Keycloak client secret | `myoidcsecret` |
| `AUTH_ISSUER` | Keycloak realm URL, e.g. `http://keycloak:8083/kc/realms/sw360` | _(commented out)_ |

### Backend Environment and Secrets

The SW360 backend container is configured via
[config/sw360/.env.backend](config/sw360/.env.backend). See the
[backend Docker documentation](https://github.com/eclipse-sw360/sw360/blob/main/README_DOCKER.md#environment-variables)
for a full list of variables.

Sensitive backend values are stored as Docker secrets in
[config/sw360/default_secrets](config/sw360/default_secrets).

### CouchDB Configuration

CouchDB credentials are stored in
[config/couchdb/default_secrets](config/couchdb/default_secrets). Additional
CouchDB settings are mounted as `.ini` files:

* [sw360_setup.ini](config/couchdb/sw360_setup.ini) - Node setup and admin
  credentials
* [sw360_log.ini](config/couchdb/sw360_log.ini) - Logging level
* [nouveau.ini](config/couchdb/nouveau.ini) - Nouveau full-text search
  configuration (connects to the `couchdb-nouveau` sidecar)
* [nouveau.yaml](config/couchdb/nouveau.yaml) - Fix for CouchDB h2c connections.

## Full Stack Setup

The [docker-compose-full.yml](docker-compose-full.yml) extends the basic setup
with Keycloak, PostgreSQL, and a Nginx reverse proxy. This is the **recommended
setup for production-like deployments**.

```sh
docker compose -f docker-compose-full.yml up -d
```

### Keycloak (Authentication)

Keycloak provides OpenID Connect authentication for both the frontend and the
backend API. It is configured via
[config/keycloak/.env.keycloak](config/keycloak/.env.keycloak) and uses
PostgreSQL as its backing database.

In the full stack setup, Keycloak is accessible at `https://localhost/kc` via
the Nginx reverse proxy.

When using Keycloak, update `NEXT_PUBLIC_SW360_AUTH_PROVIDER=keycloak` in
[config/front-end/.env.frontend](config/front-end/.env.frontend) and uncomment
the `AUTH_ISSUER` line with the appropriate realm URL.

> [!IMPORTANT]
> Keycloak requires a one-time realm and client setup. An OpenTofu/Terraform
> script is available at
> [eclipse-sw360/sw360/third-party/keycloak-tf](https://github.com/eclipse-sw360/sw360/tree/main/third-party/keycloak-tf).
> See the
> [setup instructions](https://github.com/eclipse-sw360/sw360/blob/main/third-party/keycloak-tf/README.md)
> for details.

### PostgreSQL (Keycloak Database)

PostgreSQL serves as the database for Keycloak. It is configured via
[config/postgres/.env.postgres](config/postgres/.env.postgres), and the
database password is stored in
[config/postgres/postgresql_password](config/postgres/postgresql_password).

### Nginx (Reverse Proxy)

The Nginx service acts as an SSL-terminating reverse proxy, consolidating all
services behind a single HTTPS endpoint on port 443.

The proxy configuration at
[config/nginx/rev_proxy.template](config/nginx/rev_proxy.template) uses Nginx's
`envsubst` template mechanism and routes traffic as follows:

| Path | Upstream | Description |
|---|---|---|
| `/` | `sw360-frontend:3000` | Next.js frontend |
| `/resource` | `sw360:8080` | SW360 REST API |
| `/authorization` | `sw360:8080` | SW360 OAuth2 endpoints |
| `/kc` | `keycloak:8533` | Keycloak admin and auth |

The template also a self-signed snakeoil certificate for TLS. For production,
replace the certificate paths with your own.

The server domain is set via `SERVER_DOMAIN` in
[config/nginx/.env.web](config/nginx/.env.web).

Common proxy headers (X-Forwarded-For, X-Forwarded-Proto, etc.) are defined in
[config/nginx/proxy_params](config/nginx/proxy_params).

## Networking

All services run in a shared external Docker network called `sw360net`.

Using an external network allows other containers (e.g. FOSSology) to join the
same network and communicate with the SW360 services.

## Volumes and Persistence

| Volume | Mount Point | Description |
|---|---|---|
| `couchdb` | `/opt/couchdb/data` | CouchDB database files |
| `etc` | `/etc/sw360` | SW360 backend generated configuration |
| `postgres_storage` | `/var/lib/postgresql` | Keycloak database (full stack only) |

## FOSSology Integration

FOSSology integration is handled on the backend side. Refer to the
[SW360 Backend Docker documentation](https://github.com/eclipse-sw360/sw360/blob/main/README_DOCKER.md#fossology-integration)
for setup instructions.
