// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { signOut, useSession } from 'next-auth/react'
import { type JSX, useEffect, useState } from 'react'

import { DocumentTypes, ErrorDetails, HttpStatus, Resources } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import ComponentsUsing from './ComponentsUsing'
import ProjectsUsing from './ProjectsUsing'

interface Props {
    documentId: string
    documentType: DocumentTypes
    documentName: string
}

const ResourcesUsing = ({ documentId, documentType, documentName }: Props): JSX.Element => {
    const [resourcesUsing, setResourceUsing] = useState<Resources | undefined>(undefined)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                setShowProcessing(true)
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(
                    `${documentType}/usedBy/${documentId}`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== HttpStatus.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as Resources
                setResourceUsing(data)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        documentId,
        documentType,
        session,
    ])

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
                            showProcessing={showProcessing}
                        />
                    )}
                    {!CommonUtils.isNullEmptyOrUndefinedArray(resourcesUsing._embedded['sw360:components']) && (
                        <ComponentsUsing
                            componentsUsing={resourcesUsing._embedded['sw360:components']}
                            documentName={documentName}
                            showProcessing={showProcessing}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default ResourcesUsing
