#!/usr/bin/env bash
# Code taken from Public Domain
# https://www.polarsignals.com/blog/posts/2025/07/23/reproducible-builds-with-next-js-a-practical-guide

# Copyright (C) SW360 Contributors.

# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/

# SPDX-License-Identifier: EPL-2.0
# License-Filename: LICENSE

# This script helps produce reproducible builds by:
# 1. Setting a constant NEXT_SERVER_ACTIONS_ENCRYPTION_KEY if not provided.
# 2. Setting the NODE_ENV to production.
# 3. Running remove-preview-field.js recursively on all manifests.
# 4. Sorting JSON files for predictability.
# 5. Cleaning up traces and volatile cache metadata.
# 6. Normalizing file and directory timestamps to 1970.

# 1. Provide a dummy key if not present (Base64 of 32 bytes)
# This is explicitly named to be recognizable as a placeholder for reproducible builds.
export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=${NEXT_SERVER_ACTIONS_ENCRYPTION_KEY:-"NextJsDeterministicBuildDummyKeyForActions="}

# 2. Run the build with tracing disabled
NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production pnpm build || exit 1

# 3. Recursive manifest patching
node scripts/remove-preview-field.js

# 4. Sort the JSON files
pnpm jsonsort ".next/**/*.json"

# 5. Clean up non-deterministic files
# Remove trace files (purely for build comparison/debugging, not for production distribution)
rm -f .next/trace .next/trace-build
# Delete volatile cache metadata containing timestamps or random secrets
rm -f .next/cache/.previewinfo .next/cache/.rscinfo

# 6. Normalize timestamps
find .next -depth -print0 | xargs -0 touch -ht 197001010000.00

echo "Deterministic build complete."
