# Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/

# SPDX-License-Identifier: EPL-2.0
# License-Filename: LICENSE

ARG VARIANT=22-slim
FROM node:${VARIANT}

ARG USERNAME=devel
ARG HOMEDIR=/home/devel
ENV HOME=$HOMEDIR

# Install base utilities
RUN DEBIAN_FRONTEND=noninteractive apt update -qq \
    && DEBIAN_FRONTEND=noninteractive apt install -y --no-install-recommends \
    git \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Run with non privileged user
RUN useradd \
    --shell /bin/bash \
    --home-dir $HOMEDIR \
    --create-home $USERNAME

# sudo support
RUN echo "$USERNAME ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Add pnpm
RUN npm install -g pnpm

USER ${USERNAME}
WORKDIR $HOMEDIR

COPY scripts/nodejs.sh /usr/local/bin/set_npm_proxy
RUN  sudo chmod +x /usr/local/bin/set_npm_proxy

# Expose port 3000
EXPOSE 3000
