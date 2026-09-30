// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { type JSX, useTransition } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { LOCALES } from '@/constants'
import { usePathname, useRouter } from '../../../navigation'

function LanguageSwitcher(): JSX.Element {
    const [, startTransition] = useTransition()
    const router = useRouter()
    const pathname = usePathname()

    interface Option {
        i18n: string
        flag: string
    }

    const handleOptionClick = (option: Option) => {
        const nextLocale = option.i18n
        startTransition(() => {
            router.replace(pathname, {
                locale: nextLocale,
            })
        })
    }

    const localeNames: Record<string, string> = {
        en: 'English',
        ja: '日本語',
        vi: 'Tiếng Việt',
        'zh-CN': '简体中文',
        'pt-BR': 'Português',
        ko: '한국어',
        de: 'Deutsch',
        es: 'Español',
        fr: 'Français',
        'zh-TW': '繁體中文',
    }

    return (
        <>
            <span className='fw-bold'>{'Supported Languages: '}</span>
            {LOCALES.map((locale) => (
                <div
                    className='flag'
                    key={locale.i18n}
                >
                    <OverlayTrigger overlay={<Tooltip>{localeNames[locale.i18n]}</Tooltip>}>
                        <span
                            className={`fi fi-${locale.flag} custom-class`}
                            onClick={() => handleOptionClick(locale)}
                        ></span>
                    </OverlayTrigger>
                </div>
            ))}
        </>
    )
}

export default LanguageSwitcher
