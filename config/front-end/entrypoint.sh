#!/usr/bin/env bash
# Part of the SW360 frontend Project.
# SPDX-License-Identifier: EPL-2.0

set -o errexit -o nounset -o pipefail

# Docker secrets are mounted as raw values, so read file contents directly.
if [ -f "/run/secrets/NEXTAUTH_SECRET" ]; then
  NEXTAUTH_SECRET="$(< /run/secrets/NEXTAUTH_SECRET)"
fi
if [ -f "/run/secrets/SW360_FRONTEND_KC_SECRET" ]; then
  SW360_KEYCLOAK_CLIENT_SECRET="$(< /run/secrets/SW360_FRONTEND_KC_SECRET)"
fi

: "${NEXTAUTH_SECRET:?NEXTAUTH_SECRET secret is required}"

WORKDIR="/frontend"

pushd "$WORKDIR" > /dev/null

# Generate .env file for SW360 frontend
printf 'NEXTAUTH_SECRET=%s\n' \
"$NEXTAUTH_SECRET" > .env

if [ -z ${SW360_KEYCLOAK_CLIENT_SECRET+x} ];
then
  echo "SW360_KEYCLOAK_CLIENT_SECRET is not set, skipping..."
else
  printf 'SW360_KEYCLOAK_CLIENT_SECRET=%s\n' \
       "$SW360_KEYCLOAK_CLIENT_SECRET" >> .env
fi

# Start the configured container command after generating .env
exec "$@"
