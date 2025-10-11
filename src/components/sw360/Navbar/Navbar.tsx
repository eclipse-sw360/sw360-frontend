// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation'
import { useState, type JSX } from 'react'
import { Navbar as BSNavbar, Container, Form, Nav, NavDropdown } from 'react-bootstrap'

import { NavList } from '@/object-types'
import { LocaleSwitcher, Logo, ProfileDropdown } from 'next-sw360'

function Navbar(): JSX.Element {
    const router = useRouter()
    const param = useParams()
    const locale = (param.locale as string) || 'en'

    const { data: session } = useSession()
    const [show, setShow] = useState(false)
    const selectedLayoutSegment = useSelectedLayoutSegment()
    const pathname = selectedLayoutSegment !== null ? `/${selectedLayoutSegment}` : '/'

    const navlist = NavList()

    const getLocalizedPath = (path: string) => {
        if (path === '#' || path === '/') return path
        return `/${locale}${path}`
    }
    // NavItems receives an array of links with possible entries:
    // href: the link (mandatory)
    // name: the name of the link (mandatory)
    // id: the id of the link (mandatory)
    // visibility: the userGroup that is allowed to see the link (optional)
    // childs: an array of links that are shown as dropdown menu (optional)

    const NavItems = () => (
        <>
            {navlist.map((item) => {
                if ('visibility' in item) {
                    const userGroupData = session?.user.userGroup
                    if (
                        userGroupData === undefined ||
                        !Array.isArray(item.visibility) ||
                        !item.visibility.includes(userGroupData)
                    ) {
                        return
                    }
                }

                const localizedHref = getLocalizedPath(item.href)
                if ('childs' in item) {
                    return (
                        <NavDropdown
                            title={item.name}
                            id={item.id}
                            show={show}
                            onMouseEnter={() => setShow(true)}
                            onMouseLeave={() => setShow(false)}
                            key={item.name}
                            className={`${pathname == item.href ? 'active' : ''}`}
                            active={pathname == item.href}
                            onClick={(e) => {
                                // hack to route to /admin when clicked on dropdown title
                                if ((e.target as HTMLElement).attributes[0].name === 'id') {
                                    e.preventDefault()
                                    router.push(localizedHref)
                                }
                            }}
                        >
                            {item.childs?.map((child) => (
                                <NavDropdown.Item
                                    href={getLocalizedPath(child.href)}
                                    key={child.id}
                                >
                                    {child.name}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                    )
                } else {
                    return (
                        <Nav.Link
                            key={item.name}
                            className={`${pathname == item.href ? 'active' : ''}`}
                            href={localizedHref}
                        >
                            {item.name}
                        </Nav.Link>
                    )
                }
            })}
        </>
    )

    return (
        <>
            <BSNavbar
                expand='lg'
                className='bg-body-tertiary'
            >
                <Container fluid>
                    <BSNavbar.Brand href='/'>
                        <Logo
                            src={process.env.NEXT_PUBLIC_CUSTOM_LOGO ?? undefined}
                            alt='SW360 Logo'
                        />
                    </BSNavbar.Brand>
                    <BSNavbar.Toggle aria-controls='navbarScroll' />
                    <BSNavbar.Collapse id='navbarScroll'>
                        {pathname != '/' && (
                            <Nav
                                className='me-auto my-2 my-lg-0'
                                navbarScroll
                            >
                                <NavItems />
                            </Nav>
                        )}
                        {pathname != '/' && (
                            <Form className='d-flex gap-3'>
                                <Form.Control
                                    type='text'
                                    placeholder='Search'
                                    className='me-2'
                                />
                                <ProfileDropdown />
                                <LocaleSwitcher />
                            </Form>
                        )}
                    </BSNavbar.Collapse>
                </Container>
            </BSNavbar>
        </>
    )
}

export default Navbar
