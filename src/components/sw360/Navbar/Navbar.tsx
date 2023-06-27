// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Link from 'next/link'
import navbarStyles from './navbar.module.css'
import { usePathname } from 'next/navigation'
import { LOCALES as locales } from '@/object-types/Constants'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

function Navbar() {
    const pathname = usePathname()
    const isLoginPage = locales.includes(pathname.substring(1))
    const heading = pathname.split('/').slice(-1)[0].charAt(0).toUpperCase() + pathname.split('/').slice(-1)[0].slice(1)
    const t = useTranslations(COMMON_NAMESPACE)

    return (
        !isLoginPage && (
            <div>
                <nav className='navbar navbar-expand-lg'>
                    <div className='container-fluid'>
                        <div
                            className={`collapse navbar-collapse ${navbarStyles.navbarCollapse}`}
                            id='navbarSupportedContent'
                        >
                            <ul className='navbar-nav me-auto '>
                                <li className='nav-item mx-2'>
                                    <Link className={`nav-link`} href='/home'>
                                        <b>{t('Home')}</b>
                                    </Link>
                                    <div className={navbarStyles.underline}></div>
                                </li>
                                <li className='nav-item mx-1'>
                                    <Link className={`nav-link`} href='/projects'>
                                        <b>{t('Projects')}</b>
                                    </Link>
                                    <div className={navbarStyles.underline}></div>
                                </li>
                                <li className='nav-item mx-1'>
                                    <Link className={`nav-link`} href='/components'>
                                        <b>{t('Components')}</b>
                                    </Link>
                                    <div className={navbarStyles.underline}></div>
                                </li>
                                <li className='nav-item mx-1'>
                                    <Link className={`nav-link`} href='/licenses'>
                                        <b>{t('Licenses')}</b>
                                    </Link>
                                    <div className={navbarStyles.underline}></div>
                                </li>
                                <li className='nav-item mx-1'>
                                    <Link className={`nav-link`} href='/ecc'>
                                        <b>{t('ECC')}</b>
                                    </Link>
                                    <div className={navbarStyles.underline}></div>
                                </li>
                                <li className='nav-item mx-1'>
                                    <Link className={`nav-link`} href='/vulnerabilities'>
                                        <b>{t('Vulnerabilities')}</b>
                                    </Link>
                                    <div className={navbarStyles.underline}></div>
                                </li>
                                <li className='nav-item mx-1'>
                                    <Link className={`nav-link`} href='/requests'>
                                        <b>{t('Requests')}</b>
                                    </Link>
                                    <div className={navbarStyles.underline}></div>
                                </li>
                                <li className='nav-item mx-1'>
                                    <Link className={`nav-link`} href='/search'>
                                        <b>{t('Search')}</b>
                                    </Link>
                                    <div className={navbarStyles.underline}></div>
                                </li>
                                <li className='nav-item mx-1'>
                                    <Link className={`nav-link`} href='/preferences'>
                                        <b>{t('Preferences')}</b>
                                    </Link>
                                    <div className={navbarStyles.underline}></div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <div className={navbarStyles.headingDiv}>
                    <div>{heading}</div>
                </div>
            </div>
        )
    )
}

export default Navbar
