// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth/next'
import { Session } from '@/object-types'
import Projects from './components/Projects'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Projects',
}

const ProjectsList = async () => {
    const session: Session = await getServerSession(authOptions)

    return <Projects session={session} />
}

export default ProjectsList
