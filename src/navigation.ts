// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Re-export navigation helpers from the canonical next-intl routing config.
 * Must use the same `localePrefix: 'never'` settings as middleware (`src/proxy.ts`).
 */
export { Link, redirect, usePathname, useRouter } from './i18n/routing'
