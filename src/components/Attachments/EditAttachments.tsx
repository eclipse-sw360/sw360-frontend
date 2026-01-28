// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useState } from 'react'

import { Attachment, Embedded } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import AttachmentRowData from './AttachmentRowData'
import SelectAttachment from './SelectAttachment/SelectAttachment'
import TableAttachment from './TableAttachment/TableAttachment'
import TitleAttachment from './TiltleAttachment/TitleAttachment'

interface Props<T> {
    documentId: string
    documentType: string
    documentPayload: T
    setDocumentPayload: React.Dispatch<React.SetStateAction<T>>
}

type EmbeddedAttachments = Embedded<Attachment, 'sw360:attachments'>

function EditAttachments<T>({ documentId, documentType, documentPayload, setDocumentPayload }: Props<T>): JSX.Element {
    const t = useTranslations('default')
    const [attachmentsData, setAttachmentsData] = useState<Array<AttachmentRowData>>([])
    const [beforeUpdateAttachmentsCheckStatus, setBeforeUpdateAttachmentsCheckStatus] = useState<Array<string>>([])
    const [dialogOpenSelectAttachment, setDialogOpenSelectAttachment] = useState(false)
    const handleClickSelectAttachment = useCallback(() => setDialogOpenSelectAttachment(true), [])
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === StatusCodes.OK) {
            const data = (await response.json()) as EmbeddedAttachments
            return data
        } else if (response.status === StatusCodes.UNAUTHORIZED) {
            return signOut()
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        const load = async () => {
            try {
                const attachments = await fetchData(`${documentType}/${documentId}/attachments`)
                if (attachments === undefined) return
                if (
                    !CommonUtils.isNullOrUndefined(attachments['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(attachments['_embedded']['sw360:attachments'])
                ) {
                    const attachmentDetails: Array<Attachment> = []
                    attachments['_embedded']['sw360:attachments'].map((item: Attachment) => {
                        attachmentDetails.push(item)
                    })
                    const existingAttachmentsRowData: Array<AttachmentRowData> = attachmentDetails.map(
                        (attachment) => ({
                            attachmentContentId: CommonUtils.getIdFromUrl(attachment._links?.self.href),
                            filename: attachment.filename,
                            attachmentType: attachment.attachmentType,
                            createdBy: attachment.createdBy,
                            createdTeam: attachment.createdTeam,
                            createdComment: attachment.createdComment,
                            createdOn: attachment.createdOn,
                            checkedTeam: attachment.checkedTeam,
                            checkedComment: attachment.checkedComment,
                            checkedOn: attachment.checkedOn,
                            checkStatus: attachment.checkStatus,
                            checkedBy: attachment.checkedBy,
                            isAddedNew: false,
                        }),
                    )
                    const beforeUpdateAttachmentsCheckStatus = attachmentDetails.map(
                        (attachment) => attachment.checkStatus ?? 'NOTCHECKED',
                    )
                    setBeforeUpdateAttachmentsCheckStatus(beforeUpdateAttachmentsCheckStatus)
                    setAttachmentsData(existingAttachmentsRowData)
                }
            } catch (err) {
                console.error(err)
            }
        }
        void load()
    }, [])

    useEffect(() => {
        const attachmentsToSave: Array<Attachment> = attachmentsData.map((attachment) => ({
            attachmentContentId: attachment.attachmentContentId,
            filename: attachment.filename,
            attachmentType: attachment.attachmentType,
            createdBy: attachment.createdBy,
            createdTeam: attachment.createdTeam,
            createdComment: attachment.createdComment,
            createdOn: attachment.createdOn,
            checkedTeam: attachment.checkedTeam,
            checkedComment: attachment.checkedComment,
            checkedOn: attachment.checkedOn,
            checkStatus: attachment.checkStatus,
            checkedBy: attachment.checkedBy,
        }))
        setDocumentPayload({
            ...documentPayload,
            attachments: attachmentsToSave,
        })
    }, [
        attachmentsData,
    ])

    return (
        <>
            <SelectAttachment
                attachmentsData={attachmentsData}
                setAttachmentsData={setAttachmentsData}
                show={dialogOpenSelectAttachment}
                setShow={setDialogOpenSelectAttachment}
            />
            <div className='col mb-3'>
                <table className='table col'>
                    <TitleAttachment />
                    <TableAttachment
                        beforeUpdateAttachmentsCheckStatus={beforeUpdateAttachmentsCheckStatus}
                        setBeforeUpdateAttachmentsCheckStatus={setBeforeUpdateAttachmentsCheckStatus}
                        attachmentsData={attachmentsData}
                        setAttachmentsData={setAttachmentsData}
                    />
                </table>
            </div>
            <div className='mb-3'>
                <button
                    type='button'
                    onClick={handleClickSelectAttachment}
                    className={`fw-bold btn btn-secondary`}
                >
                    {t('Add Attachment')}
                </button>
            </div>
        </>
    )
}

export default EditAttachments
