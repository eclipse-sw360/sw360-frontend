// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { ProjectPayload } from '@/object-types'
import EditDependencyNetwork from '../EditDepedencyNetwork/EditDependencyNetwork'
import LinkedProjects from './component/LinkedReleasesAndProjects/LinkedProjects'
import LinkedReleases from './component/LinkedReleasesAndProjects/LinkedReleases'

import type { JSX } from 'react'

interface Props {
    projectId?: string
    projectPayload: ProjectPayload
    existingReleaseData?: Map<string, LinkedReleaseData>
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    isDependencyNetworkFeatureEnabled: boolean
}

interface LinkedReleaseData {
    comment: string
    mainlineState: string
    name: string
    releaseRelation: string
    version: string
}

export default function LinkedReleasesAndProjects({
    projectId,
    projectPayload,
    setProjectPayload,
    existingReleaseData,
    isDependencyNetworkFeatureEnabled,
}: Props): JSX.Element {
    return (
        <>
            <div className='ms-1'>
                <LinkedProjects
                    projectPayload={projectPayload}
                    setProjectPayload={setProjectPayload}
                />
                {isDependencyNetworkFeatureEnabled === true ? (
                    <EditDependencyNetwork
                        projectId={projectId}
                        projectPayload={projectPayload}
                        setProjectPayload={setProjectPayload}
                    />
                ) : (
                    <LinkedReleases
                        projectPayload={projectPayload}
                        setProjectPayload={setProjectPayload}
                        existingReleaseData={existingReleaseData}
                    />
                )}
            </div>
        </>
    )
}
