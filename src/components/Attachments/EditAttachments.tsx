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
import Attachment from '@/object-types/Attachment'
import { Table, _ } from '@/components/sw360'
import { Form } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import SelectAttachment from './SelectAttachment'
import DeleteAttachment from './DeleteAttachment'
import EnterCreatedCommentDialog from './EnterCreatedCommentDialog'
import EnterCheckedCommentDialog from './EnterCheckedCommentDialog'

interface Props {
    documentId: string
    session: Session
    documentType: string
}

const EditAttachments = ({ documentId, session, documentType }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [attachmentData, setAttachmentData] = useState([])
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
                const attachmentDatas = attachments['_embedded']['sw360:attachmentDTOes'].map((item: Attachment) => [
                    item.filename,
                    item.attachmentType,
                    item.createdComment,
                    item.createdTeam,
                    item.createdBy,
                    item.createdOn,
                    item.checkStatus,
                    item.checkedComment,
                    item.checkedTeam,
                    item.checkedBy,
                    item.checkedOn,
                    item.attachmentContentId,
                ])
                setAttachmentData(attachmentDatas)
                setTotalRows(attachmentDatas.length)
            }
        })
    }, [documentId, documentType, fetchData])

    const handleClickDelete = (id: string) => {
        let data: any = attachmentData
        data = attachmentData.filter((item) => !item.includes(id))
        setAttachmentData(data)
    }

    const columns = [
        {
            name: 'Attachments',
            width: '800px',
            columns: [
                {
                    name: 'Filename',
                    sort: true,
                },
                {
                    name: 'Type',
                    formatter: (item: any) =>
                        _(
                            <Form.Select name='typeComponent'>
                                <option value='SOURCE'>{t('Source file')}</option>
                                <option value='CLEARING_REPORT'>{t('Clearing report')}</option>
                                <option value='COMPONENT_LICENSE_INFO_XML'>
                                    {t('Component license information (XML)')}
                                </option>
                                <option value='COMPONENT_LICENSE_INFO_COMBINED'>
                                    {t('Component license information (Combined)')}
                                </option>
                                <option value='DOCUMENT'>{t('Document')}</option>
                                <option value='DESIGN'>{t('Design document')}</option>
                                <option value='REQUIREMENT'>{t('Requirement document')}</option>
                                <option value='SCAN_RESULT_REPORT'>{t('Scan result report')}</option>
                                <option value='SCAN_RESULT_REPORT_XML'>{t('Scan result report (XML)')}</option>
                                <option value='SOURCE_SELF'>{t('Source file (Self-made)')}</option>
                                <option value='BINARY'>{t('Binaries')}</option>
                                <option value='BINARY_SELF'>{t('Binaries (Self-made)')}</option>
                                <option value='DECISION_REPORT'>{t('Decision report')}</option>
                                <option value='LEGAL_EVALUATION'>{t('Legal evaluation report')}</option>
                                <option value='LICENSE_AGREEMENT'>{t('License Agreement')}</option>
                                <option value='SCREENSHOT'>{t('Screenshot of Website')}</option>
                                <option value='OTHER'>{t('Other')}</option>
                                <option value='README_OSS'>{t('ReadMe OSS')}</option>
                                <option value='SECURITY_ASSESSMENT'>{t('Security Assessment')}</option>
                                <option value='INITIAL_SCAN_REPORT'>{t('Initial Scan Report')}</option>
                                <option value='SBOM'>{t('SBOM')}</option>
                                <option value='INTERNAL_USE_SCAN'>{t('Initial Use Scan')}</option>
                            </Form.Select>
                        ),
                    sort: true,
                },
                {
                    name: 'Upload',
                    width: '500px',
                    columns: [
                        {
                            name: 'Comment',
                            formatter: (item: any) =>
                                _(
                                    <Form.Control
                                        type='text'
                                        placeholder='Enter comment'
                                        onClick={handleClickEnterCreatedComment}
                                    />
                                ),
                            sort: true,
                        },
                        {
                            name: 'Group',
                            sort: true,
                        },
                        {
                            name: 'Name',
                            sort: true,
                            width: '100px',
                        },
                        {
                            name: 'Date',
                            width: '100px',
                            sort: true,
                        },
                    ],
                },
                {
                    name: 'Approval',
                    columns: [
                        {
                            name: 'Status',
                            formatter: (item: any) =>
                                _(
                                    <Form.Select name='statusApproval'>
                                        <option value='NOTCHECKED'>{t('NOT_CHECKED')}</option>
                                        <option value='ACCEPTED'> {t('ACCEPTED')}</option>
                                        <option value='REJECTED'>{t('REJECTED')}</option>
                                    </Form.Select>
                                ),
                            sort: true,
                        },
                        {
                            name: 'Comment',
                            formatter: (item: any) =>
                                _(
                                    <Form.Control
                                        type='text'
                                        placeholder='Enter comment'
                                        onClick={handleClickCheckedComment}
                                    />
                                ),
                            sort: true,
                        },
                        {
                            name: 'Group',
                            sort: true,
                        },
                        {
                            name: 'Name',
                            sort: true,
                        },
                        {
                            name: 'Date',
                            sort: true,
                        },
                        {
                            name: '',
                            formatter: (id: string) =>
                                _(
                                    <FaTrashAlt
                                        className={styles['delete-btn']}
                                        onClick={() => handleClickDelete(id)}
                                    />
                                ),
                        },
                    ],
                },
            ],
        },
    ]

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
                        <Table data={attachmentData} columns={columns} search={true} />
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
