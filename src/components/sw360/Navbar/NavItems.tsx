// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Nav, NavDropdown } from 'react-bootstrap'
import { NavList, type UserGroupType } from '@/object-types'

interface Props {
    pathname: string
    usergroup: UserGroupType | undefined
}

function NavItems({ pathname, usergroup }: Props) {
    const param = useParams()
    const router = useRouter()

    const [show, setShow] = useState(false)
    const locale = (param.locale as string) || 'en'
    const navlist = NavList()
    const getLocalizedPath = (path: string) => {
        if (path === '#' || path === '/') return path
        return `/${locale}${path}`
    }

    return (
        <>
            {navlist.map((item) => {
                if ('visibility' in item) {
                    if (
                        usergroup === undefined ||
                        !Array.isArray(item.visibility) ||
                        !item.visibility.includes(usergroup)
                    ) {
                        return null
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
                            key={item.id}
                            className={`${pathname === item.href ? 'active' : ''}`}
                            active={pathname === item.href}
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
                            key={item.id}
                            className={`${pathname === item.href ? 'active' : ''}`}
                            href={localizedHref}
                        >
                            {item.name}
                        </Nav.Link>
                    )
                }
            })}
        </>
    )
}

export default NavItems
