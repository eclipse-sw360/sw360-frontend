// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import EditProject from './components/EditProject'

import authOptions from '@/app/api/auth/[...nextauth]/authOptions'
import { ConfigKeys, Configuration } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { getServerSession } from 'next-auth/next'
import type { JSX } from 'react'
interface Context {
    params: Promise<{ id: string }>
}

const ProjectEditPage = async (props: Context): Promise<JSX.Element> => {
    const params = await props.params
    const projectId = params.id
    const session = await getServerSession(authOptions)
    if (CommonUtils.isNullOrUndefined(session)) {
        return <></>
    }
    const response = await ApiUtils.GET('configurations', session.user.access_token)
    const config = (await response.json()) as Configuration
    const isDependencyNetworkFeatureEnabled = config[ConfigKeys.ENABLE_FLEXIBLE_PROJECT_RELEASE_RELATIONSHIP] == 'true'
    return (
        <EditProject
            projectId={projectId}
            isDependencyNetworkFeatureEnabled={isDependencyNetworkFeatureEnabled}
        />
    )
}

export default ProjectEditPage
