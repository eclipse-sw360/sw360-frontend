// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { LOCALES as locales } from '@/constants'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next-intl/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Navbar as BSNavbar, Container, Nav, NavDropdown } from 'react-bootstrap'

function Navbar() {
    const [heading, setHeading] = useState('home')
    const router = useRouter()
    const pathname = usePathname()
    const isLoginPage = locales.includes(pathname.substring(1)) || pathname.substring(1) === ''
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [show, setShow] = useState(false)

    const navlist = [
        { link: '/home', name: t('Home') },
        { link: '/projects', name: t('Projects') },
        { link: '/components', name: t('Components') },
        { link: '/licenses', name: t('Licenses') },
        { link: '/ecc', name: t('ECC') },
        { link: '/vulnerabilities', name: t('Vulnerabilities') },
        { link: '/requests', name: t('Requests') },
        { link: '/search', name: t('Search') },
        { link: '/admin', name: t('Admin') },
        { link: '/preferences', name: t('Preferences') },
    ]

    const NavItems = () => (
        <BSNavbar expand='lg'>
            <Container fluid>
                <Nav variant='underline' className='ms-5' activeKey='home'>
                    {navlist.map((item) => {
                        if (item.name === 'Admin') {
                            if (status === 'authenticated' && session.user.userGroup === 'ADMIN') {
                                return (
                                    <NavDropdown
                                        title={item.name}
                                        id='admin-dropdown'
                                        show={show}
                                        onMouseEnter={() => setShow(true)}
                                        onMouseLeave={() => setShow(false)}
                                        key={item.name}
                                        onClick={(e) => {
                                            // hack to route to /admin when clicked on dropdown title
                                            if ((e.target as HTMLElement).attributes[0].name === 'id') {
                                                e.preventDefault()
                                                router.push(item.link)
                                            }
                                        }}
                                    >
                                        <NavDropdown.Item href='#'>{t('User')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('Vendors')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('Bulk Release Edit')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('Licenses')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('Obligations')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('Schedule')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('Fossology')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('Import Export')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('Database Sanitation')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('Attachment Cleanup')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('OAuth Client')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('License Types')}</NavDropdown.Item>
                                        <NavDropdown.Item href='#'>{t('Department')}</NavDropdown.Item>
                                    </NavDropdown>
                                )
                            }
                        } else {
                            return (
                                <Nav.Item key={item.name}>
                                    <Link
                                        className={`nav-link`}
                                        href={item.link}
                                        onClick={() => setHeading(item.link[-1])}
                                    >
                                        {item.name}
                                    </Link>
                                </Nav.Item>
                            )
                        }
                    })}
                </Nav>
            </Container>
        </BSNavbar>
    )

    return (
        !isLoginPage && (
            <>
                <NavItems />

                <div className={`heading-div`}>
                    <div>{heading}</div>
                </div>
            </>
        )
    )
}

export default Navbar
