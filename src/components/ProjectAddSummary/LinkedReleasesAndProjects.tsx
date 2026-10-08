// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import type { JSX } from 'react'
import { LinkedReleaseData, ProjectPayload } from '@/object-types'
import EditDependencyNetwork from '../EditDepedencyNetwork/EditDependencyNetwork'
import LinkedProjects from './component/LinkedReleasesAndProjects/LinkedProjects'
import LinkedReleases from './component/LinkedReleasesAndProjects/LinkedReleases'

interface Props {
    projectId?: string
    projectPayload: ProjectPayload
    existingReleaseData?: Record<string, LinkedReleaseData>
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    isDependencyNetworkFeatureEnabled: boolean
    isReleaseLoading?: boolean
}

export default function LinkedReleasesAndProjects({
    projectId,
    projectPayload,
    existingReleaseData,
    setProjectPayload,
    isDependencyNetworkFeatureEnabled,
    isReleaseLoading = false,
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
                        existingReleaseData={existingReleaseData}
                        projectPayload={projectPayload}
                        setProjectPayload={setProjectPayload}
                        isReleaseLoading={isReleaseLoading}
                    />
                )}
            </div>
        </>
    )
}
