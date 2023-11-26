// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useLocale } from 'next-intl'
import React, { useTransition } from 'react'
import { Dropdown } from 'react-bootstrap'

import { LOCALES } from '@/constants'
import { usePathname, useRouter } from '../../../navigation'

interface Option {
    i18n: string
    flag: string
}

function LocaleSwitcher() {
    const [, startTransition] = useTransition()
    const router = useRouter()
    const locale = useLocale()
    const pathname = usePathname()

    const [, setSelectedOption] = React.useState<Option | null>(null)

    function getCurrentFlag() {
        const current = LOCALES.find((cur) => cur.i18n === locale)
        return current ? current.flag : undefined
    }

    function getLanguageName(lang: string) {
        const langName = new Intl.DisplayNames([locale], { type: 'language' })
        return langName.of(lang)
    }
    const handleSelect = (selectedId: string) => {
        const option = LOCALES.find((option) => option.i18n === selectedId)
        const nextLocale = option.i18n
        setSelectedOption(option || null)

        startTransition(() => {
            router.replace(pathname, { locale: nextLocale })
        })
        setSelectedOption(option)
    }

    return (
        <Dropdown onSelect={handleSelect}>
            <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
                <span className={`fi fi-${getCurrentFlag()}`} />
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {LOCALES.map((option) => (
                    <Dropdown.Item eventKey={option.i18n} key={option.i18n} className='dropdown-item'>
                        <span className={`fi fi-${option.flag}`} />
                        {/* <span>{regionName.of(option.i18n)}</span> */}
                        <span>{getLanguageName(option.i18n)}</span>
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default LocaleSwitcher
