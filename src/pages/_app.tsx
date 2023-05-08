// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css'
import '@/styles/auth.css'
import type { AppProps } from 'next/app'
import Layout from '../components/layout'
import { appWithTranslation } from 'next-i18next'
import { SessionProvider } from 'next-auth/react'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

const AppWithTranslation = appWithTranslation(App);

const Sw360App = (props: AppProps) => {
  return (
    <SessionProvider session={props.pageProps.session}>
      <AppWithTranslation {...props} />
    </SessionProvider>
  )
}

export default Sw360App
