// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react';
import PageHeader from './header'
import PageFooter from './footer'
import { SessionProvider } from "next-auth/react"

interface IProps {
  children: ReactNode,
  session: any
}

export default function Layout({ children, session }: IProps) {
  return (
    <SessionProvider session={session}>
      <PageHeader />
      <main>{children}</main>
      <PageFooter />
    </ SessionProvider>
  )
}