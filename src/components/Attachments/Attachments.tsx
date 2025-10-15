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
import { _, Table } from 'next-sw360'
import { type JSX, useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { FaDownload } from 'react-icons/fa'

import { Attachment, AttachmentTypes, Embedded } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import styles from './Attachment.module.css'

interface Props {
    documentId: string
    documentType: string
}

type EmbeddedAttachments = Embedded<Attachment, 'sw360:attachments'>

const AttachmentTypeShortName = {
    [AttachmentTypes.DOCUMENT]: 'DOC',
    [AttachmentTypes.SOURCE]: 'SRC',
    [AttachmentTypes.DESIGN]: 'DSN',
    [AttachmentTypes.REQUIREMENT]: 'RDT',
    [AttachmentTypes.CLEARING_REPORT]: 'CRT',
    [AttachmentTypes.COMPONENT_LICENSE_INFO_XML]: 'CLX',
    [AttachmentTypes.COMPONENT_LICENSE_INFO_COMBINED]: 'CLI',
    [AttachmentTypes.SCAN_RESULT_REPORT]: 'SRR',
    [AttachmentTypes.SCAN_RESULT_REPORT_XML]: 'SRX',
    [AttachmentTypes.SOURCE_SELF]: 'SRS',
    [AttachmentTypes.BINARY]: 'BIN',
    [AttachmentTypes.BINARY_SELF]: 'BIS',
    [AttachmentTypes.DECISION_REPORT]: 'DRT',
    [AttachmentTypes.LEGAL_EVALUATION]: 'LRT',
    [AttachmentTypes.LICENSE_AGREEMENT]: 'LAT',
    [AttachmentTypes.SCREENSHOT]: 'SCR',
    [AttachmentTypes.OTHER]: 'OTH',
    [AttachmentTypes.README_OSS]: 'RDM',
    [AttachmentTypes.SECURITY_ASSESSMENT]: 'SECA',
    [AttachmentTypes.INITIAL_SCAN_REPORT]: 'ISR',
    [AttachmentTypes.SBOM]: 'SBOM',
    [AttachmentTypes.INTERNAL_USE_SCAN]: 'IUS',
}

const Attachments = ({ documentId, documentType }: Props): JSX.Element => {
    const t = useTranslations('default')
    const { status } = useSession()
    const [attachmentData, setAttachmentData] = useState<(string | Attachment | string[] | JSX.Element)[][]>([])
    const [totalRows, setTotalRows] = useState(0)

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const buildAttachmentDetail = (item: Attachment) => {
        return (event: React.MouseEvent<HTMLElement>) => {
            if ((event.target as HTMLElement).className == styles.expand) {
                ;(event.target as HTMLElement).className = styles.collapse
            } else {
                ;(event.target as HTMLElement).className = styles.expand
            }
            const attachmentId = CommonUtils.getIdFromUrl(item._links?.self.href)
            const attachmentDetail = document.getElementById(attachmentId)
            if (!attachmentDetail) {
                const parent = (event.target as HTMLElement).parentElement?.parentElement?.parentElement
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
                            <td>${item.checkedOn ?? ''}</td>
                            <td>${t('Checked Comment')} : </td>
                            <td>${item.checkedComment}</td>
                            <td></td>
                            <td></td>
                            </tr>
                        </tbody>
                    </table>
                </td>`
                const tr = document.createElement('tr')
                tr.id = attachmentId
                tr.innerHTML = html

                parent?.parentNode?.insertBefore(tr, parent.nextSibling)
            } else {
                if (attachmentDetail.hidden == true) {
                    attachmentDetail.hidden = false
                } else {
                    attachmentDetail.hidden = true
                }
            }
        }
    }

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
            return {} as EmbeddedAttachments
        }
    }, [])

    const downloadAttachment = async (attachmentId: string, attachmentName: string) => {
        try {
            const session = await getSession()
            DownloadService.download(
                `${documentType}/${documentId}/attachments/${attachmentId}`,
                session,
                attachmentName,
            )
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    const downloadBundle = async () => {
        try {
            const session = await getSession()
            await DownloadService.download(
                `${documentType}/${documentId}/attachments/download`,
                session,
                'AttachmentBundle.zip',
            )
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    useEffect(() => {
        fetchData(`${documentType}/${documentId}/attachments`)
            .then((attachments: EmbeddedAttachments | undefined) => {
                if (attachments === undefined) return
                if (
                    !CommonUtils.isNullOrUndefined(attachments['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(attachments['_embedded']['sw360:attachments'])
                ) {
                    const attachmentData = attachments['_embedded']['sw360:attachments'].map((item: Attachment) => [
                        item,
                        item.filename,
                        'n/a',
                        AttachmentTypeShortName[item.attachmentType],
                        item.createdTeam ?? '',
                        item.createdBy ?? '',
                        item.checkedTeam ?? '',
                        item.checkedBy ?? '',
                        item.projectAttachmentUsage?.visible === 0 && item.projectAttachmentUsage.restricted === 0
                            ? 'n/a'
                            : _(
                                  <a
                                      href='#'
                                      title='visible / restricted'
                                      onClick={(e) => {
                                          e.preventDefault()
                                      }}
                                  >
                                      {item.projectAttachmentUsage?.visible ?? 0} /{' '}
                                      {item.projectAttachmentUsage?.restricted ?? 0}
                                  </a>,
                              ),
                        [
                            item.attachmentContentId ?? '',
                            item.filename,
                        ],
                    ])
                    setAttachmentData(attachmentData)
                    setTotalRows(attachmentData.length)
                }
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            })
    }, [
        documentId,
        documentType,
        fetchData,
    ])

    const columns = [
        {
            id: 'check',
            name: _(
                <FaDownload
                    className={styles['download-btn']}
                    style={{
                        width: '100%',
                    }}
                    onClick={downloadBundle}
                />,
            ),
            formatter: (item: Attachment) =>
                _(
                    <i
                        className={styles.collapse}
                        onClick={buildAttachmentDetail(item)}
                    ></i>,
                ),
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
                        style={{
                            width: '100%',
                        }}
                        onClick={() => downloadAttachment(attachmentId, attachmentName)}
                    />,
                ),
            sort: false,
            width: '90px',
        },
    ]

    return (
        <>
            {status === 'authenticated' && (
                <>
                    {totalRows ? (
                        <>
                            <div className={`row ${styles['attachment-table']}`}>
                                <Table
                                    data={attachmentData}
                                    columns={columns}
                                    selector={true}
                                    sort={false}
                                />
                            </div>
                        </>
                    ) : (
                        <div className='col'>
                            <Alert variant='primary'>{t('No attachments yet')}</Alert>
                        </div>
                    )}
                </>
            )}
        </>
    )
}

export default Attachments
