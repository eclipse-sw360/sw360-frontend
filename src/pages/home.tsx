// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getServerSession } from "next-auth/next"
import { authOptions } from './api/auth/[...nextauth]'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

const Home = () => {
  return <h1>Home page</h1>
}


export async function getServerSideProps({ req, res, locale }: any) {
  return {
      props: {
          session: await getServerSession(req, res, authOptions),
          ...(await serverSideTranslations(locale, ['common'])),
      }
  }
}

export default Home