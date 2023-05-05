#!/bin/bash

# Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/

# SPDX-License-Identifier: EPL-2.0
# License-Filename: LICENSE

if [ -n "$http_proxy" ]; then
    npm config set proxy "${http_proxy}"
    npm config set https-proxy "$http_proxy"
elif [ -n "$HTTP_PROXY" ]; then
    npm config set proxy "$HTTP_PROXY"
    npm config set https-proxy "$HTTP_PROXY"
fi