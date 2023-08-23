// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

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
import { _ } from '@/components/sw360'
import SelectAttachment from './SelectAttachment/SelectAttachment'
import TableAttachment from './TableAttachment/TableAttachment'
import AttachmentDetail from '@/object-types/AttachmentDetail'
import ComponentPayload from '@/object-types/ComponentPayLoad'
import TitleAttachment from './TiltleAttachment/TitleAttachment'

interface Props {
    documentId: string
    session: Session
    documentType: string
    componentData: ComponentPayload
    setComponentData: React.Dispatch<React.SetStateAction<ComponentPayload>>
}

const EditAttachments = ({ documentId, session, documentType, componentData, setComponentData }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [attachmentData, setAttachmentData] = useState<AttachmentDetail[]>([])
    const [reRender, setReRender] = useState(false)
    const handleReRender = () => {
        setReRender(!reRender)
    }
    const [dialogOpenSelectAttachment, setDialogOpenSelectAttachment] = useState(false)
    const handleClickSelectAttachment = useCallback(() => setDialogOpenSelectAttachment(true), [])

    const setAttachmentToComponentData = (attachmentDatas: AttachmentDetail[]) => {
        setComponentData({
            ...componentData,
            attachmentDTOs: attachmentDatas,
        })
    }

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
                setComponentData({
                    ...componentData,
                    attachmentDTOs: attachmentDetails,
                })
            }
        })
    }, [documentId, documentType, fetchData])

    return (
        <>
            <SelectAttachment
                componentData={componentData}
                setComponentData={setComponentData}
                attachmentUpload={attachmentData}
                setAttachmentFromUpload={setAttachmentData}
                show={dialogOpenSelectAttachment}
                setShow={setDialogOpenSelectAttachment}
                session={session}
                onReRender={handleReRender}
            />
            <div className={`row ${styles['attachment-table']}`} style={{padding:'25px'}}>
                <TitleAttachment />
                <TableAttachment
                    data={attachmentData}
                    setAttachmentData={setAttachmentData}
                    setAttachmentToComponentData={setAttachmentToComponentData}
                />
            </div>

            <div>
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
