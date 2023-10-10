// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next-intl/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LOCALES as locales } from '@/object-types/Constants'
import { Container, Navbar as BSNavbar, Nav } from 'react-bootstrap'

function Navbar() {
    const [heading, setHeading] = useState('Home')
    const pathname = usePathname()
    const isLoginPage = locales.includes(pathname.substring(1)) || pathname.substring(1) === ''
    const t = useTranslations('default')

    const navlist = [
        { link: '/home', name: 'Home' },
        { link: '/projects', name: 'Projects' },
        { link: '/components', name: 'Components' },
        { link: '/licenses', name: 'Licenses' },
        { link: '/ecc', name: 'ECC' },
        { link: '/vulnerabilities', name: 'Vulnerabilities' },
        { link: '/requests', name: 'Requests' },
        { link: '/search', name: 'Search' },
        { link: '/preferences', name: 'Preferences' },
    ]

    const NavItems = () => (
        <BSNavbar expand='lg'>
            <Container fluid>
                <Nav variant='underline' className='ms-5' activeKey='home'>
                    {navlist.map((item) => (
                        <Nav.Item key={item.name}>
                            <Link className={`nav-link`} href={item.link} onClick={() => setHeading(item.name)}>
                                {t(item.name)}
                            </Link>
                        </Nav.Item>
                    ))}
                </Nav>
            </Container>
        </BSNavbar>
    )

    return (
        !isLoginPage && (
            <>
                <NavItems />

                <div className={`heading-div`}>
                    <div>{t(heading)}</div>
                </div>
            </>
        )
    )
}

export default Navbar
