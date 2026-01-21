// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { type JSX, useTransition } from 'react'
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

    return (
        <>
            {LOCALES.map((locale) => (
                <div
                    className='flag'
                    key={locale.i18n}
                >
                    <span
                        className={`fi fi-${locale.flag} custom-class`}
                        key={locale.i18n}
                        onClick={() => handleOptionClick(locale)}
                    />
                </div>
            ))}
        </>
    )
}

export default LanguageSwitcher
