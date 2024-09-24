// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export const CREDENTIAL_PROVIDER = 'credential_provider'
export const CREDENTIALS = 'credentials'
export const KEYCLOAK_PROVIDER = 'keycloak'
export const SW360OAUTH_PROVIDER = 'sw360-backend'
export const LOCALES = [
    { i18n: 'en', flag: 'gb' },
    { i18n: 'ja', flag: 'jp' },
    { i18n: 'vi', flag: 'vn' },
    { i18n: 'zh-CN', flag: 'cn' },
    { i18n: 'pt-BR', flag: 'br' },
    { i18n: 'ko', flag: 'kr' },
    { i18n: 'de', flag: 'de' },
    { i18n: 'es', flag: 'es' },
    { i18n: 'fr', flag: 'fr' },
    { i18n: 'zh-TW', flag: 'tw' },
]
export const locales = LOCALES.map((locale) => locale.i18n)
