// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE


'use client'

import { useTranslations } from 'next-intl'
import { ModerationRequestDetails } from '@/object-types'
import styles from '../moderationRequestDetail.module.css'
import { useEffect, useState } from 'react'
import { RequestDocumentTypes } from '@/object-types'
import TableHeader from './TableHeader'
import { Table } from 'next-sw360'


export default function ProposedChanges({ data }: { data: ModerationRequestDetails }) {

    const t = useTranslations('default')
    const dafaultTitle = t('BASIC FIELD CHANGES')
    const attachmentTitle = t('ATTACHMENTS')
    const [requestAdditionType, setRequestAdditionType] = useState('')
    const [requestDelitionType, setRequestDelitionType] = useState('')
    const [proposedBasicChangesData, setProposedBasicChangesData] = useState([])
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

    useEffect(() => {
        if (data.documentType == RequestDocumentTypes.COMPONENT){
            setRequestAdditionType(RequestDocumentTypes.COMPONENT_ADDITION)
            setRequestDelitionType(RequestDocumentTypes.COMPONENT_DELETION)
            console.log(requestAdditionType, requestDelitionType)
        }
        else if (data.documentType == RequestDocumentTypes.LICENSE){
            setRequestAdditionType(RequestDocumentTypes.LICENSE_ADDITION)
            setRequestDelitionType(RequestDocumentTypes.LICENSE_DELETION)
        }
        else if (data.documentType == RequestDocumentTypes.PROJECT){
            setRequestAdditionType(RequestDocumentTypes.PROJECT_ADDITION)
            setRequestDelitionType(RequestDocumentTypes.PROJECT_DELETION)
        }
        else if (data.documentType == RequestDocumentTypes.RELEASE){
            setRequestAdditionType(RequestDocumentTypes.RELEASE_ADDITION)
            setRequestDelitionType(RequestDocumentTypes.RELEASE_DELETION)
        }

        // This part of code needs refactor once rest api is refactored
        setProposedBasicChangesData(
            [['visibility',
            'old_data',
            'new_Data',
            'newest data']]
        )
        }, [data])


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
                        <Table columns={columns} data={proposedBasicChangesData} pagination={{ limit: 5 }} selector={false}/>
                    </div>
                </div>
            )}
        {proposedAttachmentChangesData.length === 0 ? (
                <div>
                    <TableHeader title={attachmentTitle} />
                    <div className='subscriptionBox'>{t('No changes in attachments')}</div>
                </div>
            ) : (
                <div>
                    <TableHeader title={attachmentTitle} />
                        <Table columns={columns} data={proposedAttachmentChangesData} pagination={{ limit: 5 }} selector={false}/>
                </div>
            )}
        </>
    )
}
