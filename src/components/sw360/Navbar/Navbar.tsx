// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useSelectedLayoutSegment } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LocaleSwitcher, Logo, NavItems, ProfileDropdown, ThemeSwitcher } from 'next-sw360'
import type { JSX } from 'react'
import { Navbar as BSNavbar, Container, Form, Nav } from 'react-bootstrap'

function Navbar(): JSX.Element {
  // NavItems receives an array of links with possible entries:
  // href: the link (mandatory)
  // name: the name of the link (mandatory)
  // id: the id of the link (mandatory)
  // visibility: the userGroup that is allowed to see the link (optional)
  // childs: an array of links that are shown as dropdown menu (optional)
  const selectedLayoutSegment = useSelectedLayoutSegment()
  const pathname = selectedLayoutSegment !== null ? `/${selectedLayoutSegment}` : '/'
  const { data: session } = useSession()
  const usergroup = session?.user.userGroup

  return (
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
          {pathname !== '/' && (
            <Nav
              className='me-auto my-2 my-lg-0'
              navbarScroll
            >
              <NavItems usergroup={usergroup} pathname={pathname} />
            </Nav>
          )}
          {pathname !== '/' && (
            <Form className='d-flex gap-3'>
              <Form.Control
                type='text'
                placeholder='Search'
                className='me-2'
              />
              <ThemeSwitcher />
              <ProfileDropdown />
              <LocaleSwitcher />
            </Form>
          )}
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar
