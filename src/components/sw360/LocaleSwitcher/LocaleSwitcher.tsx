// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useLocale } from 'next-intl'
import React, { useTransition, type JSX } from 'react';
import { NavDropdown } from 'react-bootstrap'

import { LOCALES } from '@/constants'
import { usePathname, useRouter } from '../../../navigation'

interface Option {
    i18n: string
    flag: string
}

function LocaleSwitcher(): JSX.Element {
    const [, startTransition] = useTransition()
    const router = useRouter()
    const locale = useLocale()
    const pathname = usePathname()

    const [, setSelectedOption] = React.useState<Option | undefined>(undefined)

    function getCurrentFlag() {
        const current = LOCALES.find((cur) => cur.i18n === locale)
        return current ? current.flag : undefined
    }

    function getLanguageName(lang: string) {
        const langName = new Intl.DisplayNames([locale], { type: 'language' })
        return langName.of(lang)
    }

    const handleSelect = (selectedId: string | null) => {
        if (selectedId === null) return
        const option = LOCALES.find((option) => option.i18n === selectedId)
        const nextLocale = option?.i18n
        setSelectedOption(option || undefined)

        startTransition(() => {
            router.replace(pathname, { locale: nextLocale })
        })
        setSelectedOption(option)
    }

    return (
        <NavDropdown
            onSelect={handleSelect}
            id='localeSwitcherDropdown'
            title={<span className={`fi fi-${getCurrentFlag()}`} />}
            align='end'
        >
            {LOCALES.map((option) => (
                <NavDropdown.Item eventKey={option.i18n} key={option.i18n}>
                    <span className={`fi fi-${option.flag} me-2`} />
                    <span>{getLanguageName(option.i18n)}</span>
                </NavDropdown.Item>
            ))}
        </NavDropdown>
    )
}

export default LocaleSwitcher
