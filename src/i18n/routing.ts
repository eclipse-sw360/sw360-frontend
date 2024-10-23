// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

import { locales } from '../object-types/Constants'

export const routing = defineRouting({
    locales: locales,
    defaultLocale: 'en',
    localePrefix: {
        mode: 'never',
    },
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
