// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
    let locale: string | undefined = await requestLocale

    if (locale == null || !routing.locales.includes(locale)) {
        locale = routing.defaultLocale
    }

    return {
        locale,
        messages: (
            (await import(`../../messages/${locale}.json`)) as {
                default: Record<string, string>
            }
        ).default,
    }
})
