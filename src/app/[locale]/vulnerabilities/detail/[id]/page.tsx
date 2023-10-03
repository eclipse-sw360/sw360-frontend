// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth/next'
import { Metadata } from 'next'

import { Session } from '@/object-types'
import VulnerabilityDetailsTab from './components/VulnerabilityDetailsTab'

export const metadata: Metadata = {
    title: 'Vulnerabilites',
}

interface Context {
    params: { id: string }
}

const Detail = async ({ params }: Context) => {
    const session: Session = await getServerSession(authOptions)

    return <VulnerabilityDetailsTab session={session} vulnerabilityId={params.id} />
}

export default Detail
