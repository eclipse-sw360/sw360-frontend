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
import { Table, _ } from 'next-sw360'
import { ApiUtils } from '@/utils/index'
import { signOut, useSession } from 'next-auth/react'
import { notFound } from 'next/navigation'


interface interimDataType extends Record<string,any> {
    [k: string]: any,
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
            formatter: ([currentValue, isObject]:  [currentValue: string[], isObject: boolean]) =>
                _( isObject === true ? (currentValue.map((item: string) =>
                        <>
                            {<li>{`${item}`}</li>}
                        </>
                    )): (
                        <>
                            {currentValue}
                        </>
                    )
                )
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
            formatter: ([suggestedValue, isObject]:  [suggestedValue: string[], isObject: boolean]) =>
                _( isObject === true ? (suggestedValue.map((item: string) =>
                    <>
                        {<li>{`${item}`}</li>}
                    </>
                )): (
                    <>
                        {suggestedValue}
                    </>
                )
            )
        }
    ]

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
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

    const dataExtractor = (interimData: Component | Project | ReleaseDetail) => {

        const documentAdditions = moderationRequestData[requestAdditionType as keyof 
                                                            ModerationRequestDetails] as interimDataType
        const documentDeletions = moderationRequestData[requestDeletionType as keyof
                                                            ModerationRequestDetails] as interimDataType
        const changedData: Array<any> = [];
        let isObject:boolean = false

        // Condition when the existing data is modified
        for ( const key in documentDeletions) {
            if (key in documentAdditions) {
                if (documentDeletions[key] != documentAdditions[key]) {
                    if (typeof documentAdditions[key] === "object" && 
                        typeof documentDeletions[key] === "object" &&
                        Object.keys(documentAdditions[key]).length !== 0 &&
                        Object.keys(documentDeletions[key]).length === 0) {
                            isObject = true
                            for (const k in documentAdditions[key]) {
                                changedData.push([ `${key}[${k}]:`,
                                    ((interimData as interimDataType)[key] != null && 
                                    (interimData as interimDataType)[key][k]) ?
                                    [(interimData as interimDataType)[key][k], isObject] : ['', isObject],
                                    t('n a modified list'),
                                    [documentAdditions[key][k], isObject]])
                            }
                    }
                else if (typeof documentAdditions[key] === "object" && 
                         typeof documentDeletions[key] === "object" &&
                         Object.keys(documentDeletions[key]).length !== 0 &&
                         Object.keys(documentAdditions[key]).length === 0) {
                            isObject = true
                            for (const k in documentDeletions[key]) {
                                 const filteredData = (interimData as interimDataType)[key]
                                                    .filter((item: interimDataType) => {
                                    return !(item[k] === (interimData as interimDataType)[key][k])
                                })
                                changedData.push([ `${key}[${k}]:`,
                                    ((interimData as interimDataType)[key] != null && 
                                    (interimData as interimDataType)[key][k]) ?
                                    [(interimData as interimDataType)[key][k], isObject] : ['', isObject],
                                    t('n a modified list'),
                                    [filteredData[k]], isObject])
                        }}
                else 
                    changedData.push([key,
                                     [(interimData as interimDataType)[key], isObject],
                                     documentDeletions[key],
                                     [documentAdditions[key], isObject]])
                }
            }
        }

        // Condition when the new data are added  
        for (const key in documentAdditions) {
            if (!(key in documentDeletions) && (documentAdditions[key] !== '')) {
                isObject = false
                changedData.push([key,
                                 ((interimData as interimDataType)[key] != null && 
                                 (interimData as interimDataType)[key]) ?
                                 [(interimData as interimDataType)[key], isObject] : ['', isObject],
                                 '',
                                 [documentAdditions[key], isObject]])
            }
        }

        setProposedBasicChangesData(changedData)
    }

    useEffect(() => {
        if (moderationRequestData.documentType == RequestDocumentTypes.COMPONENT){
            setRequestAdditionType(RequestDocumentTypes.COMPONENT_ADDITION)
            setRequestDeletionType(RequestDocumentTypes.COMPONENT_DELETION)
            console.log(requestAdditionType, requestDeletionType)
            void fetchData(`components/${moderationRequestData.documentId}`).then(
                            (componentDetail: Component) => {
                                dataExtractor(componentDetail)
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
                                dataExtractor(projectDetail)
            })
        }
        else if (moderationRequestData.documentType == RequestDocumentTypes.RELEASE){
            setRequestAdditionType(RequestDocumentTypes.RELEASE_ADDITION)
            setRequestDeletionType(RequestDocumentTypes.RELEASE_DELETION)
            void fetchData(`releases/${moderationRequestData.documentId}`).then(
                            (releaseDetail: ReleaseDetail) => {
                                dataExtractor(releaseDetail)
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
