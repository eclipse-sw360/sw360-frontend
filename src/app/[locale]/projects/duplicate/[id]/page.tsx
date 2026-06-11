// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { type JSX, use } from 'react'
import { useConfigKeyValue } from '@/contexts'
import { ConfigKeys } from '@/object-types'
import DuplicateProject from './components/DuplicateProject'

interface Context {
    params: Promise<{
        id: string
    }>
}

const ProjectDuplicatePage = ({ params }: Context): JSX.Element => {
    const resolvedParams = use(params)
    const isDependencyNetworkFeatureEnabled =
        useConfigKeyValue(ConfigKeys.ENABLE_FLEXIBLE_PROJECT_RELEASE_RELATIONSHIP) === 'true'

    return (
        <DuplicateProject
            projectId={resolvedParams.id}
            isDependencyNetworkFeatureEnabled={isDependencyNetworkFeatureEnabled}
        />
    )
}

export default ProjectDuplicatePage
