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
import EnterCommentDialog from './EnterCommentDialog'
import { FaTrashAlt } from 'react-icons/fa'

interface Props {
    documentId: string
    session: Session
    documentType: string
}

const EditAttachments = ({ documentId, session, documentType }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [attachmentData, setAttachmentData] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [dialogOpenEnterComment, setDialogOpenEnterComment] = useState(false)
    const handleClickEnterComment = useCallback(() => setDialogOpenEnterComment(true), [])
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
                const attachmentData = attachments['_embedded']['sw360:attachmentDTOes'].map((item: Attachment) => [
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
                ])
                setAttachmentData(attachmentData)
                setTotalRows(attachmentData.length)
            }
        })
    }, [documentId, documentType, fetchData])

    const handleClickDelete = (attachmentContentId: any) => {
        // setDeletingComponent(componentId)
        // setDeleteDialogOpen(true)
    }

    const columns = [
        { 
            name: 'Attachments',
            width: '800px',
            columns: [
                {
                    name: 'Filename',
                    sort: true,
                }, {
                    name: 'Type',
                    formatter: (item: any) =>
                    _(<Form.Select name='typeComponent'>                                
                        <option value='SOURCE'>{t('SOURCE')}</option>
                        <option value='DESIGN'> {t('DESIGN')}</option>
                        <option value='REQUIREMENT'>{t('REQUIREMENT')}</option>
                        <option value='CLEARING_REPORT'>{t('CLEARING REPORT')}</option>
                        <option value='COMPONENT_LICENSE_INFO_XML'>{t('COMPONENT LICENSE INFO XML')}</option>
                        <option value='COMPONENT_LICENSE_INFO_COMBINED'>{t('COMPONENT LICENSE INFO COMBINED')}</option>
                        <option value='SCAN_RESULT_REPORT'>{t('SCAN RESULT REPORT')}</option>
                        <option value='SCAN_RESULT_REPORT_XML'>{t('SCAN RESULT REPORT')}</option>
                        <option value='SOURCE_SELF'> {t('SOURCE SELF')}</option>
                        <option value='BINARY'>{t('BINARY')}</option>
                        <option value='BINARY_SELF'>{t('BINARY SELF')}</option>
                    </Form.Select>),
                    sort: true,
                }, {
                    name: 'Upload',
                    width: '500px',
                    columns: [
                        {
                            name: 'Comment',
                            formatter: (item: any) =>
                            _(<Form.Control type="text" placeholder="Enter comment" onClick={handleClickEnterComment}/>),
                            sort: true,
                        }, {
                            name: 'Group',
                            sort: true,
                        }, {
                            name: 'Name',
                            sort: true,
                            width: '100px',
                        }, {
                            name: 'Date',
                            width: '100px',
                            sort: true,
                        }
                    ]
                }, {
                    name: 'Approval',
                    columns: [
                        {
                            name: 'Status',
                            formatter: (item: any) =>
                            _(<Form.Select name='statusApproval'>                           
                                <option value='NOTCHECKED'>{t('NOT_CHECKED')}</option>
                                <option value='ACCEPTED'> {t('ACCEPTED')}</option>
                                <option value='REJECTED'>{t('REJECTED')}</option>
                            </Form.Select>),
                            sort: true,
                        }, {
                            name: 'Comment',
                            formatter: (item: any) =>
                            _(
                            <Form.Control type="text" placeholder="Enter comment" onClick={handleClickEnterComment}/>
                            ),
                            sort: true,
                        }, {
                            name: 'Group',
                            sort: true,
                        }, {
                            name: 'Name',
                            sort: true,
                        }, {
                            name: 'Date',
                            sort: true,
                        }, {
                            name: '',
                            formatter: (id: string) =>
                            _(
                                <FaTrashAlt className={styles['delete-btn']} onClick={() => handleClickDelete(id)} />
                            ),
                        }
                    ]
                }
            ]
        }
    ]  

    return (
        <>
            {totalRows ? (
                <>
                    <div className={`row ${styles['attachment-table']}`}>
                        <Table data={attachmentData} columns={columns} search={true} />
                    </div>
                </>
            ) : (
                <div className='col'>
                    <Alert variant='primary'>{t('No attachments yet')}</Alert>
                </div>
            )}
            <EnterCommentDialog show={dialogOpenEnterComment}
            setShow={setDialogOpenEnterComment}
            session={session} />
        </>
    )
}

export default EditAttachments
