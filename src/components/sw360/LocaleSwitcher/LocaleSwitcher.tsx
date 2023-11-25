// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useLocale } from 'next-intl'
import { useState, useTransition } from 'react'

import { LOCALES } from '@/constants'
import { usePathname, useRouter } from '../../../navigation'

function LocaleSwitcher() {
    const [, startTransition] = useTransition()
    const router = useRouter()
    const locale = useLocale()
    const pathname = usePathname()

    interface Option {
        i18n: string
        flag: string
    }

    interface DropdownProps {
        options: Option[]
    }

    const Dropdown: React.FC<DropdownProps> = ({ options }) => {
        const [, setSelectedOption] = useState<Option | null>(null)
        const [isOpen, setIsOpen] = useState(false)

        const handleOptionClick = (option: Option) => {
            const nextLocale = option.i18n
            startTransition(() => {
                router.replace(pathname, { locale: nextLocale })
            })
            setSelectedOption(option)
            setIsOpen(false)
        }

        const toggleDropdown = () => {
            setIsOpen(!isOpen)
        }

        function getCurrentFlag() {
            const current = LOCALES.find((cur) => cur.i18n === locale)
            return current ? current.flag : undefined
        }

        return (
            <div>
                <span onClick={toggleDropdown} className={`fi fi-${getCurrentFlag()}`} />
                {isOpen && (
                    <div
                        className='flag'
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'absolute',
                            backgroundColor: 'white',
                            zIndex: 1,
                        }}
                    >
                        {options.map((option) => (
                            <div className='flag' key={option.i18n}>
                                <span
                                    className={`fi fi-${option.flag}`}
                                    key={option.i18n}
                                    onClick={() => handleOptionClick(option)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return <Dropdown options={LOCALES} />
}

export default LocaleSwitcher
