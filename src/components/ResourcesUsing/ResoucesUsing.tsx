// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { DocumentTypes, Resources } from '@/object-types'
import { ApiUtils } from '@/utils'
import ComponentsUsing from './ComponentsUsing'
import ProjectsUsing from './ProjectsUsing'

interface Props {
    documentId: string
    documentType: DocumentTypes
    documentName: string
}

const ResoucesUsing = ({ documentId, documentType, documentName }: Props) => {
    const { data: session } = useSession()
    const [resourcesUsing, setResourceUsing] = useState<Resources>(undefined)

    useEffect(() => {
        ApiUtils.GET(`${documentType}/usedBy/${documentId}`, session.user.access_token)
            .then((res) => res.json())
            .then((resourcesUsing: Resources) => {
                setResourceUsing(resourcesUsing)
            })
            .catch((err) => console.log(err))
    }, [documentId, documentType, session])

    return (
        resourcesUsing &&
        resourcesUsing._embedded && (
            <>
                {resourcesUsing._embedded['sw360:projects'] &&
                    resourcesUsing._embedded['sw360:projects'].length > 0 && (
                        <ProjectsUsing
                            projectUsings={resourcesUsing._embedded['sw360:projects']}
                            documentName={documentName}
                            restrictedResource={resourcesUsing._embedded['sw360:restrictedResources'][0]}
                        />
                    )}
                {resourcesUsing._embedded['sw360:components'] &&
                    resourcesUsing._embedded['sw360:components'].length > 0 && (
                        <ComponentsUsing
                            componentsUsing={resourcesUsing._embedded['sw360:components']}
                            documentName={documentName}
                        />
                    )}
            </>
        )
    )
}

export default ResoucesUsing
