// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import LicenseIndex from './LicenseIndex'
import { Metadata } from 'next'
import { Session } from '@/object-types/Session'

export const metadata: Metadata = {
    title: 'Licenses',
}

async function LicensesPage() {
    const session: Session = await getServerSession(authOptions)
    return <LicenseIndex session={session} />
}

export default LicensesPage
