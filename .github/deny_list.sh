# Copyright (C) 2023 SW360 Project Authors (see <https://github.com/eclipse-sw360/sw360-frontend/NOTICE>)
#
# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/
#
# SPDX-License-Identifier: EPL-2.0

#!/bin/bash

set -e

# Check for files not intented to be present
declare -a denyfiles=("yarn.lock" "package-lock.json" "pnpm-lock.yaml")
declare -a denyextensions=("png" "jpg" "jpeg" "tiff")

for file in "${denyfiles[@]}"; do
    if [[ -n $(find * -name "$file" -mmin -5) ]]; then
        echo "File $file is not permitted in this codebase."
        exit 1
    fi
done

for extension in "${denyextensions[@]}"; do
    if [[ -n $(find * -iname \*."$extension" -mmin -5) ]]; then
        echo "Files with $file type are not permitted in this codebase."
        exit 1
    fi
done
