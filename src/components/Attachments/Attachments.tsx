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
import { FaDownload } from 'react-icons/fa'
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
import DownloadService from '@/services/download.service'

interface Props {
    documentId: string
    session: Session
    documentType: string
}

const Attachments = ({ documentId, session, documentType }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [attachmentData, setAttachmentData] = useState([])
    const [totalRows, setTotalRows] = useState(0)

    const buildAttachmentDetail = (item: any) => {
        return (event: any) => {
            if (event.target.className == styles.expand) {
                event.target.className = styles.collapse
            } else {
                event.target.className = styles.expand
            }

            const attachmentDetail = document.getElementById(item.attachmentContentId)
            if (!attachmentDetail) {
                const parent = event.target.parentElement.parentElement.parentElement
                const html =
                `<td colspan="10">
                    <table class="table table-borderless">
                        <tbody>
                            <tr>
                            <td>SHA1 : </td>
                            <td>${item.sha1}</td>
                            <td>${t('Uploaded On')} : </td>
                            <td>${item.createdOn}</td>
                            <td>${t('Uploaded Comment')} : </td>
                            <td>${item.createdComment}</td>
                            </tr>
                            <tr>
                            </tr>
                            <tr>
                            <td>${t('Checked On')} : </td>
                            <td>${item.checkedOn}</td>
                            <td>${t('Checked Comment')} : </td>
                            <td>${item.checkedComment}</td>
                            <td></td>
                            <td></td>
                            </tr>
                        </tbody>
                    </table>
                </td>`
                const tr = document.createElement('tr')
                tr.id = item.attachmentContentId
                tr.innerHTML = html

                parent.parentNode.insertBefore(tr, parent.nextSibling)
            } else {
                if (attachmentDetail.hidden == true) {
                    attachmentDetail.hidden = false
                } else {
                    attachmentDetail.hidden = true
                }
            }
        }
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

    const downloadAttachment = (attachmentId: string, attachmentName: string) => {
        DownloadService.download(
            `${documentType}/${documentId}/attachments/${attachmentId}`, session, attachmentName)
    }

    const downloadBundle = () => {
        DownloadService.download(
            `${documentType}/${documentId}/attachments/download`, session, 'AttachmentBundle.zip')
    }

    useEffect(() => {
        fetchData(`${documentType}/${documentId}/attachments`).then((attachments: any) => {
            if (
                !CommonUtils.isNullOrUndefined(attachments['_embedded']) &&
                !CommonUtils.isNullOrUndefined(attachments['_embedded']['sw360:attachmentDTOes'])
            ) {
                const attachmentData = attachments['_embedded']['sw360:attachmentDTOes'].map((item: Attachment) => [
                    item,
                    item.filename,
                    'n/a',
                    item.attachmentType,
                    '',
                    '',
                    '',
                    '',
                    '',
                    [item.attachmentContentId, item.filename],
                ])
                setAttachmentData(attachmentData)
                setTotalRows(attachmentData.length)
            }
        })
    }, [documentId, documentType, fetchData])

    const columns = [
        {
            name: _(<FaDownload className={styles['download-btn']} style={{ width: '100%' }} onClick={downloadBundle}/>),
            formatter: (item: any) => _(<i className={styles.collapse} onClick={buildAttachmentDetail(item)}></i>),
            sort: false,
            width: '60px'
        },
        {
            name: t('File name'),
            sort: true,
        },
        {
            name: t('Size'),
            sort: true,
        },
        {
            name: t('Type'),
            sort: true,
        },
        {
            name: t('Group'),
            sort: true,
        },
        {
            name: t('Uploaded By'),
            sort: true,
        },
        {
            name: t('Group'),
            sort: true,
        },
        {
            name: t('Checked By'),
            sort: true,
        },
        {
            name: t('Usage'),
        },
        {
            name: t('Action'),
            formatter: ([attachmentId, attachmentName]: Array<string>) => _
                                    (<FaDownload className={styles['download-btn']} style={{ width: '100%' }} 
                                     onClick={() => downloadAttachment(attachmentId, attachmentName)}
                                    />),
            sort: false,
            width: '60px',
        },
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
        </>
    )
}

export default Attachments
