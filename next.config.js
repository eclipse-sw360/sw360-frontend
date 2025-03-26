// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createNextIntlPlugin = require('next-intl/plugin')
const withNextIntl = createNextIntlPlugin()

const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: false,
    },
}

module.exports = withNextIntl(nextConfig)
