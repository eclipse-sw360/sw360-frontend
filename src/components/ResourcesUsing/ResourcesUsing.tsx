// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState, type JSX } from 'react'

import { DocumentTypes, Resources } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import ComponentsUsing from './ComponentsUsing'
import ProjectsUsing from './ProjectsUsing'

interface Props {
    documentId: string
    documentType: DocumentTypes
    documentName: string
}

const ResourcesUsing = ({ documentId, documentType, documentName }: Props): JSX.Element => {
    const { data: session } = useSession()
    const [resourcesUsing, setResourceUsing] = useState<Resources | undefined>(undefined)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    useEffect(() => {
        if (CommonUtils.isNullOrUndefined(session)) return
        ApiUtils.GET(`${documentType}/usedBy/${documentId}`, session.user.access_token)
            .then((res) => res.json())
            .then((resourcesUsing: Resources) => {
                setResourceUsing(resourcesUsing)
            })
            .catch((err) => console.log(err))
    }, [documentId, documentType, session])

    return (
        <>
            {' '}
            {resourcesUsing !== undefined && (
                <>
                    {!CommonUtils.isNullEmptyOrUndefinedArray(resourcesUsing._embedded['sw360:projects']) && (
                        <ProjectsUsing
                            projectUsings={resourcesUsing._embedded['sw360:projects']}
                            documentName={documentName}
                            restrictedResource={
                                !CommonUtils.isNullOrUndefined(resourcesUsing._embedded['sw360:restrictedResources'])
                                    ? resourcesUsing._embedded['sw360:restrictedResources'][0]
                                    : undefined
                            }
                        />
                    )}
                    {!CommonUtils.isNullEmptyOrUndefinedArray(resourcesUsing._embedded['sw360:components']) && (
                        <ComponentsUsing
                            componentsUsing={resourcesUsing._embedded['sw360:components']}
                            documentName={documentName}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default ResourcesUsing
