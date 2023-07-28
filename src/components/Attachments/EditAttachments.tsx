// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Alert from 'react-bootstrap/Alert'
import { useEffect, useState, useCallback } from 'react'
import CommonUtils from '@/utils/common.utils'
import styles from './Attachment.module.css'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import ApiUtils from '@/utils/api/api.util'
import { Session } from '@/object-types/Session'
import { signOut } from 'next-auth/react'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { notFound } from 'next/navigation'
import { Table, _ } from '@/components/sw360'
import SelectAttachment from './SelectAttachment'
import DeleteAttachment from './DeleteAttachment'
import EnterCreatedCommentDialog from './EnterCreatedCommentDialog'
import EnterCheckedCommentDialog from './EnterCheckedCommentDialog'
import TableAttachment from './TableAttachment'
import TiltleAttachment from './TitleAttachment'
import AttachmentDetail from '@/object-types/AttachmentDetail'

interface Props {
    documentId: string
    session: Session
    documentType: string
}

const EditAttachments = ({ documentId, session, documentType }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [attachmentData, setAttachmentData] = useState<AttachmentDetail[]>([])
    const [reRender, setReRender] = useState(false)
    const handleReRender = () => {
        setReRender(!reRender)
    }
    const [totalRows, setTotalRows] = useState(0)
    const [createdComment, setCreatedComment] = useState()
    const [checkedComment, setCheckedComment] = useState()
    const [dialogOpenCreatedComment, setDialogOpenCreatedComment] = useState(false)
    const [dialogOpenCheckedComment, setDialogOpenCheckedComment] = useState(false)
    const [dialogDeleteAttachment, setDialogDeleteAttachment] = useState(false)
    const [dialogOpenSelectAttachment, setDialogOpenSelectAttachment] = useState(false)
    const handleClickEnterCreatedComment = useCallback(() => setDialogOpenCreatedComment(true), [])
    const handleClickCheckedComment = useCallback(() => setDialogOpenCheckedComment(true), [])
    const handleClickSelectAttachment = useCallback(() => setDialogOpenSelectAttachment(true), [])
    const fetchData: any = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json()
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                signOut()
            } else {
                notFound()
            }
        },
        [session.user.access_token]
    )

    useEffect(() => {
        fetchData(`${documentType}/${documentId}/attachments`).then((attachments: any) => {
            if (
                !CommonUtils.isNullOrUndefined(attachments['_embedded']) &&
                !CommonUtils.isNullOrUndefined(attachments['_embedded']['sw360:attachmentDTOes'])
            ) {
                const attachmentDetails: AttachmentDetail[] = []
                attachments['_embedded']['sw360:attachmentDTOes'].map((item: any) => {
                    attachmentDetails.push(item)
                })
                setAttachmentData(attachmentDetails)
                setTotalRows(attachmentDetails.length)
            }
        })
    }, [documentId, documentType, fetchData])

    return (
        <>
            <SelectAttachment
                attachmentUpload={attachmentData}
                setAttachmentFromUpload={setAttachmentData}
                show={dialogOpenSelectAttachment}
                setShow={setDialogOpenSelectAttachment}
                session={session}
                onReRender={handleReRender}
            />
            {totalRows ? (
                <>
                    <div className={`row ${styles['attachment-table']}`}>
                        <TiltleAttachment />
                        <TableAttachment data={attachmentData} setAttachmentData={setAttachmentData} />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                    <DeleteAttachment
                        show={dialogDeleteAttachment}
                        setShow={setDialogDeleteAttachment}
                        session={session}
                    />
                    <EnterCreatedCommentDialog
                        show={dialogOpenCreatedComment}
                        setShow={setDialogOpenCreatedComment}
                        createdComment={createdComment}
                        setCreatedComment={setCreatedComment}
                    />
                    <EnterCheckedCommentDialog
                        show={dialogOpenCheckedComment}
                        setShow={setDialogOpenCheckedComment}
                        checkedComment={checkedComment}
                        setCheckedComment={setCheckedComment}
                    />
                </>
            ) : (
                <div className='col'>
                    <Alert variant='primary'>{t('No attachments yet')}</Alert>
                </div>
            )}
            <div>
                <button
                    type='button'
                    onClick={handleClickSelectAttachment}
                    className={`fw-bold btn btn-light button-plain`}
                >
                    {t('Add Attachment')}
                </button>
            </div>
        </>
    )
}

export default EditAttachments
