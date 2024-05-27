// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE


'use client'

import { useTranslations } from 'next-intl'
import { Component,
         HttpStatus,
         ModerationRequestDetails,
         Project,
         ReleaseDetail } from '@/object-types'
import styles from '../moderationRequestDetail.module.css'
import { useCallback, useEffect, useState } from 'react'
import { RequestDocumentTypes } from '@/object-types'
import TableHeader from './TableHeader'
import { Table } from 'next-sw360'
import { ApiUtils } from '@/utils/index'
import { signOut, useSession } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { AUTH_TOKEN } from '@/utils/env'


interface interimDataType {
    [k: string]: string,
}

export default function ProposedChanges({ moderationRequestData }:
                                        { moderationRequestData: ModerationRequestDetails }) {

    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const dafaultTitle = t('BASIC FIELD CHANGES')
    const attachmentTitle = t('ATTACHMENTS')
    const [requestAdditionType, setRequestAdditionType] = useState<string>('')
    const [requestDeletionType, setRequestDeletionType] = useState<string>('')
    const [proposedBasicChangesData, setProposedBasicChangesData] = useState([])
    // const [documentData, setDocumentData] = useState<interimDataType>({})
    const [proposedAttachmentChangesData] = useState([])
    const columns = [
        {
            id: 'proposedChanges.fieldName',
            name: t('Field Name'),
            sort: true,
        },
        {
            id: 'proposedChanges.currentValue',
            name: t('Current Value'),
            sort: true,
        },
        {
            id: 'proposedChanges.formerValue',
            name: t('Former Value'),
            sort: true,
        },
        {
            id: 'proposedChanges.suggestedValue',
            name: t('Suggested Value'),
            sort: true,
        }
    ]

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, AUTH_TOKEN)
            if (response.status == HttpStatus.OK) {
                const data = await response.json()
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[session]
    )

    const dataExtractor = (data: interimDataType) => {

        const documentAdditions = moderationRequestData[requestAdditionType as keyof 
                                                            ModerationRequestDetails] as interimDataType
        const documentDeletions = moderationRequestData[requestDeletionType as keyof
                                                            ModerationRequestDetails] as interimDataType
        console.log(data)
        const differingKeys: Array<any> = [];
        for (const key in documentAdditions) {
            if (key in documentAdditions && key in documentDeletions) {
                if (documentAdditions[key] !== documentDeletions[key]) {
                    differingKeys.push([key, data[key], documentDeletions[key], documentAdditions[key]])
                }
            }
        }

        // This part of code needs refactor once rest api is refactored
        setProposedBasicChangesData(differingKeys)
    }

    useEffect(() => {
        if (moderationRequestData.documentType == RequestDocumentTypes.COMPONENT){
            setRequestAdditionType(RequestDocumentTypes.COMPONENT_ADDITION)
            setRequestDeletionType(RequestDocumentTypes.COMPONENT_DELETION)
            console.log(requestAdditionType, requestDeletionType)
            void fetchData(`components/${moderationRequestData.documentId}`).then(
                            (componentDetail: Component) => {
                                // The double type assertion is introduced to make the code more
                                // generic and to access the keys (i.e. data[keys]) in the dataExtractor
                                // function in line (differingKeys.push([key, data[key], documentDeletions[key],
                                // documentAdditions[key]])) of response type be component, or project,
                                // or even release in one go. Although for safety purpose we are already
                                // doign the type checking in previous line (i.e. in api response)
                                const interimData = componentDetail as unknown as interimDataType
                                dataExtractor(interimData)
            })
        }
        else if (moderationRequestData.documentType == RequestDocumentTypes.LICENSE){
            setRequestAdditionType(RequestDocumentTypes.LICENSE_ADDITION)
            setRequestDeletionType(RequestDocumentTypes.LICENSE_DELETION)
        }
        else if (moderationRequestData.documentType == RequestDocumentTypes.PROJECT){
            setRequestAdditionType(RequestDocumentTypes.PROJECT_ADDITION)
            setRequestDeletionType(RequestDocumentTypes.PROJECT_DELETION)
            void fetchData(`projects/${moderationRequestData.documentId}`).then(
                            (projectDetail: Project) => {
                                // The double type assertion is introduced to make the code more
                                // generic and to access the keys (i.e. data[keys]) in the dataExtractor
                                // function in line (differingKeys.push([key, data[key], documentDeletions[key],
                                // documentAdditions[key]])) of response type be component, or project,
                                // or even release in one go. Although for safety purpose we are already
                                // doign the type checking in previous line (i.e. in api response)
                                const interimData = projectDetail as unknown as interimDataType
                                dataExtractor(interimData)
            })
        }
        else if (moderationRequestData.documentType == RequestDocumentTypes.RELEASE){
            setRequestAdditionType(RequestDocumentTypes.RELEASE_ADDITION)
            setRequestDeletionType(RequestDocumentTypes.RELEASE_DELETION)
            void fetchData(`releases/${moderationRequestData.documentId}`).then(
                            (releaseDetail: ReleaseDetail) => {
                                // The double type assertion is introduced to make the code more
                                // generic and to access the keys (i.e. data[keys]) in the dataExtractor
                                // function in line (differingKeys.push([key, data[key], documentDeletions[key],
                                // documentAdditions[key]])) of response type be component, or project,
                                // or even release in one go. Although for safety purpose we are already
                                // doign the type checking in previous line (i.e. in api response)
                                const interimData = releaseDetail as unknown as interimDataType
                                dataExtractor(interimData)
            })
        }
    }, [moderationRequestData])


    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <>
        {proposedBasicChangesData.length === 0 ? (
                <>
                    <TableHeader title={dafaultTitle} />
                    <div className='subscriptionBox'>
                        {t('No changes in basic details')}
                    </div>
                </>
            ) : (
                <div>
                    <TableHeader title={dafaultTitle} />
                    <div className = {`${styles}`}>
                        <Table columns={columns}
                               data={proposedBasicChangesData}
                               pagination={{ limit: 5 }}
                               selector={false}/>
                    </div>
                </div>
            )}
        {proposedAttachmentChangesData.length === 0 ? (
                <div>
                    <TableHeader title={attachmentTitle} />
                    <div className='subscriptionBox'>
                        {t('No changes in attachments')}
                    </div>
                </div>
            ) : (
                <div>
                    <TableHeader title={attachmentTitle} />
                        <Table columns={columns}
                               data={proposedAttachmentChangesData}
                               pagination={{ limit: 5 }}
                               selector={false}/>
                </div>
            )}
        </>
    )}
}
