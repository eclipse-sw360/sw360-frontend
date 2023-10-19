// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { FaDownload } from 'react-icons/fa'

import { Attachment, HttpStatus, LinkedAttachments } from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { Table, _ } from 'next-sw360'
import styles from './Attachment.module.css'

interface Props {
    documentId: string
    documentType: string
}

const Attachments = ({ documentId, documentType }: Props) => {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const [attachmentData, setAttachmentData] = useState([])
    const [totalRows, setTotalRows] = useState(0)

    const buildAttachmentDetail = (item: Attachment) => {
        return (event: React.MouseEvent<HTMLElement>) => {
            if ((event.target as HTMLElement).className == styles.expand) {
                ;(event.target as HTMLElement).className = styles.collapse
            } else {
                ;(event.target as HTMLElement).className = styles.expand
            }

            const attachmentDetail = document.getElementById(item.attachmentContentId)
            if (!attachmentDetail) {
                const parent = (event.target as HTMLElement).parentElement.parentElement.parentElement
                const html = `<td colspan="10">
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
                            <td>${item.checkedOn ? item.checkedOn : ''}</td>
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

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as LinkedAttachments
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                return {} as LinkedAttachments
            }
        },
        [session.user.access_token]
    )

    const downloadAttachment = (attachmentId: string, attachmentName: string) => {
        DownloadService.download(`${documentType}/${documentId}/attachments/${attachmentId}`, session, attachmentName)
    }

    const downloadBundle = () => {
        DownloadService.download(`${documentType}/${documentId}/attachments/download`, session, 'AttachmentBundle.zip')
    }

    useEffect(() => {
        fetchData(`${documentType}/${documentId}/attachments`)
            .then((attachments: LinkedAttachments) => {
                if (
                    !CommonUtils.isNullOrUndefined(attachments['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(attachments['_embedded']['sw360:attachmentDTOes'])
                ) {
                    const attachmentData = attachments['_embedded']['sw360:attachmentDTOes'].map((item: Attachment) => [
                        item,
                        item.filename,
                        'n/a',
                        item.attachmentType,
                        item.createdTeam,
                        item.createdBy,
                        item.checkedTeam,
                        item.checkedBy,
                        item.usageAttachment.visible === 0 && item.usageAttachment.restricted == 0 ? (
                            'n/a'
                        ) : (
                            <a href='javascript:;' title='visible / restricted'>
                                {item.usageAttachment.visible} / {item.usageAttachment.restricted}
                            </a>
                        ),
                        [item.attachmentContentId, item.filename],
                    ])
                    setAttachmentData(attachmentData)
                    setTotalRows(attachmentData.length)
                }
            })
            .catch((err) => console.error(err))
    }, [documentId, documentType, fetchData])

    const columns = [
        {
            id: 'check',
            name: _(
                <FaDownload className={styles['download-btn']} style={{ width: '100%' }} onClick={downloadBundle} />
            ),
            formatter: (item: Attachment) =>
                _(<i className={styles.collapse} onClick={buildAttachmentDetail(item)}></i>),
            sort: false,
            width: '60px',
        },
        {
            id: 'fileName',
            name: t('File name'),
            sort: true,
        },
        {
            id: 'size',
            name: t('Size'),
            sort: true,
        },
        {
            id: 'type',
            name: t('Type'),
            sort: true,
        },
        {
            id: 'group',
            name: t('Group'),
            sort: true,
        },
        {
            id: 'uploadedBy',
            name: t('Uploaded By'),
            sort: true,
        },
        {
            id: 'group',
            name: t('Group'),
            sort: true,
        },
        {
            id: 'checkedBy',
            name: t('Checked By'),
            sort: true,
        },
        {
            id: 'usage',
            name: t('Usage'),
        },
        {
            id: 'action',
            name: t('Action'),
            formatter: ([attachmentId, attachmentName]: Array<string>) =>
                _(
                    <FaDownload
                        className={styles['download-btn']}
                        style={{ width: '100%' }}
                        onClick={() => downloadAttachment(attachmentId, attachmentName)}
                    />
                ),
            sort: false,
            width: '60px',
        },
    ]

    return (
        <>
            {totalRows ? (
                <>
                    <div className={`row ${styles['attachment-table']}`}>
                        <Table data={attachmentData} columns={columns} search={true} selector={true} />
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
