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
        { href: '/home', name: t('Home'), id: 'home' },
        { href: '/projects', name: t('Projects'), id: 'projects' },
        { href: '/components', name: t('Components'), id: 'components' },
        { href: '/licenses', name: t('Licenses'), id: 'licenses' },
        { href: '/ecc', name: t('ECC'), id: 'ecc' },
        { href: '/vulnerabilities', name: t('Vulnerabilities'), id: 'vulnerabilities' },
        { href: '/requests', name: t('Requests'), id: 'requests' },
        { href: '/search', name: t('Search'), id: 'search' },
        {
            href: '/admin',
            name: t('Admin'),
            id: 'admin',
            visibility: 'ADMIN',
            childs: [
                { href: '#', name: t('User'), id: 'admin_user' },
                { href: '/admin/vendors', name: t('Vendors'), id: 'admin_vendors' },
                { href: '#', name: t('Bulk Release Edit'), id: 'admin_bulk_edit' },
                { href: '#', name: t('Licenses'), id: 'admin_licenses' },
                { href: '#', name: t('Obligations'), id: 'admin_obligations' },
                { href: '#', name: t('Schedule'), id: 'admin_schedule' },
                { href: '#', name: t('Fossology'), id: 'admin_fossology' },
                { href: '#', name: t('Import Export'), id: 'admin_import_export' },
                { href: '#', name: t('Database Sanitation'), id: 'admin_database_sanitation' },
                { href: '#', name: t('Attachment Cleanup'), id: 'admin_attachment_cleanup' },
                { href: '#', name: t('OAuth Client'), id: 'admin_oauth_client' },
                { href: '#', name: t('License Types'), id: 'admin_license_types' },
                { href: '#', name: t('Department'), id: 'admin_department' },
            ],
        },
        {
            href: '/preferences',
            name: t('Preferences'),
            id: 'preferences',
        },
    ]

    // NavItems receives an array of links with possible entries:
    // href: the link (mandatory)
    // name: the name of the link (mandatory)
    // id: the id of the link (mandatory)
    // visibility: the userGroup that is allowed to see the link (optional)
    // childs: an array of links that are shown as dropdown menu (optional)

    const NavItems = () => (
        <BSNavbar expand='lg'>
            <Container fluid>
                <Nav variant='underline' className='ms-5' activeKey='home'>
                    {navlist.map((item) => {
                        if ('visibility' in item) {
                            if (status === 'authenticated' && session.user.userGroup !== item.visibility) {
                                return
                            }
                        }
                        if ('childs' in item) {
                            return (
                                <NavDropdown
                                    title={item.name}
                                    id={item.id}
                                    show={show}
                                    onMouseEnter={() => setShow(true)}
                                    onMouseLeave={() => setShow(false)}
                                    key={item.name}
                                    onClick={(e) => {
                                        // hack to route to /admin when clicked on dropdown title
                                        if ((e.target as HTMLElement).attributes[0].name === 'id') {
                                            e.preventDefault()
                                            router.push(item.href)
                                        }
                                    }}
                                >
                                    {item.childs.map((child) => (
                                        <NavDropdown.Item href={child.href} key={child.id}>
                                            {child.name}
                                        </NavDropdown.Item>
                                    ))}
                                </NavDropdown>
                            )
                        } else {
                            return (
                                <Nav.Item key={item.name}>
                                    <Link
                                        className={`nav-link`}
                                        href={item.href}
                                        onClick={() => setHeading(item.href[-1])}
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
