# syntax=docker/dockerfile:1.4

# Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/

# SPDX-License-Identifier: EPL-2.0
# License-Filename: LICENSE

ARG VARIANT=22-alpine
FROM node:${VARIANT} as build
WORKDIR /frontend

# Prepare the build environment
COPY package.json .
RUN npm install
COPY . .
RUN npm run build --production

# Runtime
ARG VARIANT=20-alpine
FROM node:${VARIANT}
WORKDIR /frontend

COPY --from=build /frontend/package.json .
COPY --from=build /frontend/package-lock.json .
COPY --from=build /frontend/next.config.js .
COPY --from=build /frontend/public ./public
COPY --from=build /frontend/.next/standalone ./
COPY --from=build /frontend/.next/static ./.next/static

CMD ["node", "server.js"]
EXPOSE 3000

