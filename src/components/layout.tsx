/*
 * Copyright (C) TOSHIBA CORPORATION, 2023.
 * Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023.
 * SPDX-License-Identifier: EPL-2.0
 * License-Filename: LICENSE
 */

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