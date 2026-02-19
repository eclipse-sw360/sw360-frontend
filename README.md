# Eclipse SW360 Frontend

This is the main UI interface for SW360 project.

The current implementation is now in test stage and can be used in companion with SW360 20.0.0 beta release.

Please read our code [Code of Conduct](./CODE_OF_CONDUCT.md) before to help with the well being of the community.

For new contributors, please read the [contributing guideline](./CONTRIBUTING.md)


## Deployment of a test environment
Before testing, create a local build with your defined changes in both files:

`docker-compose.yaml`
```yaml
environment:
  - NEXTAUTH_URL=http://localhost:3000
  - NEXT_PUBLIC_SW360_API_URL=http://localhost:8080
  - SW360_API_URL=http://localhost:8080
  - AUTH_SECRET=<YourSecret>
```

`configs/couchdb/default_secrets`
```toml
COUCHDB_URL=http://couchdb:5984
COUCHDB_USER=sw360
COUCHDB_PASSWORD=sw360fossie
```

You can use docker compose to build the test container:

```bash
docker compose build
```

This will create an image that now can be started with the necessary dependencies, like sw360 backend, couchdb and nouveau containers.

Everything will run with an internal docker network called `sw360` and ports 3000 ( for frontend ) and 8080 ( for backend ) will be available

```bash
docker compose up -d
```
