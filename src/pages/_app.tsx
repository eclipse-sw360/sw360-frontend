/*
 * Copyright (C) TOSHIBA CORPORATION, 2023.
 * Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023.
 * SPDX-License-Identifier: EPL-2.0
 * License-Filename: LICENSE
 */

import '@/styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/auth.css'
import type { AppProps } from 'next/app'
import Layout from '../components/layout'
import PublicContextProvider from '../contexts/public.context';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PublicContextProvider>
      <Layout session={pageProps.session}>
        <Component {...pageProps} />
      </Layout>
    </PublicContextProvider>
  )
}
