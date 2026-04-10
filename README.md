# Eclipse SW360 Frontend
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/10706/badge)](https://www.bestpractices.dev/projects/10706)

This is the main UI interface for SW360 project.

The current implementation is now in test stage and can be used in companion with SW360 20.0.0 beta release.

Please read our code [Code of Conduct](./CODE_OF_CONDUCT.md) before to help with the well being of the community.

For new contributors, please read the [contributing guideline](./CONTRIBUTING.md)

## Docker Deployment

For instructions on running SW360 Frontend with Docker or Podman, see
[README_DOCKER.md](README_DOCKER.md).

## Reproducible Builds

This project supports deterministic and reproducible builds. This means that
building the same source code in identical environments will result in
bit-for-bit identical output, which is essential for security auditing, supply
chain integrity, and efficient caching.

### What this build mode does:

- **Consistent Build ID**: Uses a Git-based build ID for the Next.js
  application.
- **Deterministic Encryption**: Sets a constant
  `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` for Server Actions.
- **Metadata Normalization**: Removes volatile fields (like the ephemeral
  `preview` mode data) from prerender manifests.
- **Cleanup**: Removes non-deterministic build artifacts such as traces and
  volatile cache metadata.
- **Timestamp Normalization**: Sets all file and directory timestamps in the
  `.next` directory to the Unix epoch (`1970-01-01`).

### How to use

To perform a reproducible build locally, run:

```shell
pnpm reproducible-build
```

This uses a generic placeholder key
(`NextJsDeterministicBuildDummyKeyForActions=`) to ensure the build output is
consistent by default.

### Security and Production Deployment

For production environments, you can override the encryption key used for
Server Actions by providing a secure secret during the build process:

```shell
# Generate a secure Base64 secret
export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$(openssl rand -base64 32)

# Perform the build with the secure secret
pnpm reproducible-build
```
