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

RUN npm config set registry $NPM_CONFIG_REGISTRY \
 && npm install -g pnpm@latest-10

WORKDIR /frontend

# Prepare the build environment
COPY . .

RUN pnpm install
RUN pnpm build --experimental-analyze --turbo --profile

# Runtime
ARG VARIANT=24-slim@sha256:b506e7321f176aae77317f99d67a24b272c1f09f1d10f1761f2773447d8da26c
FROM node:${VARIANT}
WORKDIR /frontend

ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

COPY --from=build /frontend/next.config.ts .
COPY --from=build /frontend/public ./public
COPY --from=build /frontend/.next/standalone ./
COPY --from=build /frontend/.next/static ./.next/static

# Runtime ENV to configure
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
