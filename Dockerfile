# syntax=docker/dockerfile:1.4

# Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/

# SPDX-License-Identifier: EPL-2.0
# License-Filename: LICENSE

ARG VARIANT=24-slim@sha256:b506e7321f176aae77317f99d67a24b272c1f09f1d10f1761f2773447d8da26c
FROM node:${VARIANT} AS build

ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

# define run-time args
ARG NEXT_PUBLIC_SW360_API_URL
ARG NEXT_PUBLIC_SW360_AUTH_PROVIDER=sw360basic

# define build-time args
ARG NEXTAUTH_URL=http://localhost:3000
ARG AUTH_SECRET=mysecret
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=""
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y  \
    git=1:2.39.5-0+deb12u3  \
 && rm -rf /var/lib/apt/lists/* \
 && npm config set registry $NPM_CONFIG_REGISTRY \
 && npm install -g pnpm@10.33.0

WORKDIR /frontend

# Prepare the build environment
COPY . .

RUN pnpm install \
 && pnpm exec next telemetry disable
RUN --mount=type=bind,source=.git,target=/frontend/.git \
    pnpm reproducible-build

# Runtime
ARG VARIANT=24-slim@sha256:b506e7321f176aae77317f99d67a24b272c1f09f1d10f1761f2773447d8da26c
FROM node:${VARIANT}

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /frontend

ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

COPY --from=build /frontend/public ./public
COPY --from=build /frontend/.next/standalone ./
COPY --from=build /frontend/.next/static ./.next/static

# Final bit-for-bit normalization of directory and file timestamps
RUN /bin/bash -o pipefail -c "find . -depth -print0 | xargs -0 touch -ht 197001010000.00"

# Runtime ENV to configure
ARG AUTH_SECRET=mysecret
ENV AUTH_SECRET=$AUTH_SECRET
ENV SW360_REST_CLIENT_ID=""
ENV SW360_REST_CLIENT_SECRET=""
ENV SW360_KEYCLOAK_CLIENT_ID=""
ENV SW360_KEYCLOAK_CLIENT_SECRET=""
ENV AUTH_ISSUER=""

# ENVs used at build time, not runtime
ENV NEXT_PUBLIC_SW360_API_URL=""
ENV NEXT_PUBLIC_SW360_AUTH_PROVIDER=""

CMD ["node", "server.js"]
EXPOSE 3000
