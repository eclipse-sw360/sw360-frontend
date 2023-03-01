#!/bin/bash
# Copyright (C) 2023 Cariad SE
# SPDX-License-Identifier: MIT

if [ -n "$http_proxy" ]; then
    npm config set proxy "${http_proxy}"
    npm config set https-proxy "$http_proxy"
elif [ -n "$HTTP_PROXY" ]; then
    npm config set proxy "$HTTP_PROXY"
    npm config set https-proxy "$HTTP_PROXY"
fi