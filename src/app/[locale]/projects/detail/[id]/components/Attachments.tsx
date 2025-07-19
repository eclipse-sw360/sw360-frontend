// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState, type JSX } from 'react'

import { AccessControl } from '@/components/AccessControl/AccessControl'
import CDXImportStatus from '@/components/CDXImportStatus/CDXImportStatus'
import { Table, _ } from '@/components/sw360'
import { Attachment, HttpStatus, UserGroupType } from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { BsCaretDownFill, BsCaretRightFill } from 'react-icons/bs'
import { FaInfoCircle } from 'react-icons/fa'
import { LuDownload } from 'react-icons/lu'
import ImportSummary from '../../../../../../object-types/cyclonedx/ImportSummary'

interface EmbeddedAttachments {
    _embedded?: {
        'sw360:attachments'?: Array<Attachment>
    }
}

interface AttachmentRowMeta {
    projectId: string
    attachmentId: string
    attachmentName: string
}

const handleAttachmentDownload = async ({
    projectId,
    attachmentId,
    attachmentName,
}: {
    projectId: string
    attachmentId: string
    attachmentName: string
}) => {
    try {
        const session = await getSession()
        DownloadService.download(`projects/${projectId}/attachments/${attachmentId}`, session, attachmentName)
    } catch (e) {
        console.error(e)
    }
}

function ShowAttachmentTextOnExpand({
    id,
    sha1,
    uploadedOn,
    uploadedComment,
    checkedOn,
    checkedComment,
    colLength,
}: {
    id: string
    sha1: string
    uploadedOn: string
    uploadedComment: string
    checkedOn: string
    checkedComment: string
    colLength: number
}): JSX.Element {
    const [isExpanded, setIsExpanded] = useState(false)
    useEffect(() => {
        if (isExpanded) {
            const el = document.getElementById(id)
            const par = el?.parentElement?.parentElement?.parentElement
            const tr = document.createElement('tr')
            tr.id = `${id}_text`
            const td = document.createElement('td')
            td.colSpan = colLength

            const attachmentDetailsFirstRow = document.createElement('div')
            attachmentDetailsFirstRow.className = 'row justify-content-between mx-5 my-2'

            const sha1Elem = document.createElement('div')
            sha1Elem.className = 'col'
            sha1Elem.textContent = `SHA1: ${sha1}`
            attachmentDetailsFirstRow.appendChild(sha1Elem)

            const uploadedOnElem = document.createElement('div')
            uploadedOnElem.className = 'col'
            uploadedOnElem.textContent = `Uploaded On: ${uploadedOn}`
            attachmentDetailsFirstRow.appendChild(uploadedOnElem)

            const uploadedCommentElem = document.createElement('div')
            uploadedCommentElem.className = 'col'
            uploadedCommentElem.textContent = `Uploaded Comment: ${uploadedComment}`
            attachmentDetailsFirstRow.appendChild(uploadedCommentElem)

            td.appendChild(attachmentDetailsFirstRow)

            const attachmentDetailsSecondRow = document.createElement('div')
            attachmentDetailsSecondRow.className = 'row justify-content-between mx-5 mb-2'

            const checkedOnElem = document.createElement('div')
            checkedOnElem.className = 'col'
            checkedOnElem.textContent = `Checked On: ${checkedOn}`
            attachmentDetailsSecondRow.appendChild(checkedOnElem)

            const checkedCommentElem = document.createElement('div')
            checkedCommentElem.className = 'col'
            checkedCommentElem.textContent = `Checked Comment: ${checkedComment}`
            attachmentDetailsSecondRow.appendChild(checkedCommentElem)

            td.appendChild(attachmentDetailsSecondRow)

            tr.appendChild(td)
            par?.parentNode?.insertBefore(tr, par.nextSibling)
        } else {
            const el = document.getElementById(`${id}_text`)
            if (el) {
                el.remove()
            }
        }
    }, [isExpanded])

    return (
        <>
            {isExpanded ? (
                <BsCaretDownFill
                    color='gray'
                    id={id}
                    onClick={() => setIsExpanded(!isExpanded)}
                />
            ) : (
                <BsCaretRightFill
                    color='gray'
                    id={id}
                    onClick={() => setIsExpanded(!isExpanded)}
                />
            )}
        </>
    )
}

function ProjectAttachments({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const [data, setData] = useState<(string | object)[][] | null>(null)
    const [importStatusData, setImportStatusData] = useState<ImportSummary | null>(null)

    const handleImportStatusView = async (projectId: string, attachmentId: string) => {
        try {
            const session = await getSession()
            if (!session) return signOut()

            const res = await ApiUtils.GET(
                `projects/${projectId}/attachments/${attachmentId}`,
                session.user.access_token,
            )

            if (res.status === HttpStatus.OK) {
                const data = await res.json()
                setImportStatusData(data)
            } else {
                console.error(`Failed to fetch import status. Status: ${res.status}`)
            }
        } catch (err) {
            console.error('Error fetching SBOM import status:', err)
        }
    }

    const columns = [
        {
            id: 'attachments.expand',
            formatter: ({
                id,
                sha1,
                uploadedOn,
                uploadedComment,
                checkedOn,
                checkedComment,
            }: {
                id: string
                sha1: string
                uploadedOn: string
                uploadedComment: string
                checkedOn: string
                checkedComment: string
            }) =>
                _(
                    <>
                        <ShowAttachmentTextOnExpand
                            id={id}
                            sha1={sha1}
                            uploadedOn={uploadedOn}
                            uploadedComment={uploadedComment}
                            checkedOn={checkedOn}
                            checkedComment={checkedComment}
                            colLength={columns.length}
                        />
                    </>,
                ),
            width: '4%',
        },
        {
            id: 'attachments.fileName',
            name: t('File name'),
            sort: true,
            width: '20%',
            formatter: (filename: string, row: { _id: string; _cells: { _id: string; data: unknown }[] }) => {
                const isImportStatus = filename.includes('ImportStatus_') && filename.endsWith('.json')

                const meta = row._cells[9]?.data as AttachmentRowMeta | undefined

                if (!isImportStatus || meta?.attachmentId == null) {
                    return filename
                }

                return _(
                    <span className='d-inline-flex align-items-center gap-1'>
                        {filename}
                        <span
                            role='button'
                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'black' }}
                            onClick={() => handleImportStatusView(meta.projectId, meta.attachmentId)}
                            title={t('Click to view SBOM import result')}
                        >
                            <FaInfoCircle size={14} />
                        </span>
                    </span>,
                )
            },
        },
        {
            id: 'attachments.size',
            name: t('Size'),
            sort: true,
        },
        {
            id: 'attachments.type',
            name: t('Type'),
            sort: true,
        },
        {
            id: 'attachments.createdTeam',
            name: t('Group'),
            sort: true,
        },
        {
            id: 'attachments.uploadedBy',
            name: t('Uploaded by'),
            sort: true,
        },
        {
            id: 'attachments.checkedTeam',
            name: t('Group'),
            sort: true,
        },
        {
            id: 'attachments.checkedBy',
            name: t('Checked By'),
            formatter: (email: string) =>
                _(
                    <>
                        <Link
                            href={`mailto:${email}`}
                            className='text-link'
                        >
                            {email}
                        </Link>
                    </>,
                ),
            sort: true,
        },
        {
            id: 'attachments.usages',
            name: t('Usages'),
            sort: true,
        },
        {
            id: 'attachments.actions',
            name: t('Actions'),
            formatter: ({
                projectId,
                attachmentId,
                attachmentName,
            }: {
                projectId: string
                attachmentId: string
                attachmentName: string
            }) =>
                _(
                    <LuDownload
                        className='btn-icon'
                        size={18}
                        onClick={() => void handleAttachmentDownload({ projectId, attachmentId, attachmentName })}
                    />,
                ),
            sort: true,
            width: '6%',
        },
    ]

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return
                const res = await ApiUtils.GET(`projects/${projectId}/attachments`, session.user.access_token, signal)

                if (res.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (res.status !== HttpStatus.OK) {
                    return notFound()
                }

                const projectAttachments = (await res.json()) as EmbeddedAttachments

                const tableData: (string | object)[][] = []
                for (const attachment of projectAttachments['_embedded']?.['sw360:attachments'] ?? []) {
                    tableData.push([
                        {
                            id: `projectAttachments.${attachment.sha1}`,
                            sha1: attachment.sha1,
                            uploadedOn: attachment.createdOn ?? '',
                            uploadedComment: attachment.createdComment ?? '',
                            checkedOn: attachment.checkedOn ?? '',
                            checkedComment: attachment.checkedComment ?? '',
                        },
                        attachment.filename,
                        attachment.size ?? 'n/a',
                        attachment.attachmentType,
                        attachment.createdTeam ?? '',
                        attachment.createdBy ?? '',
                        attachment.checkedTeam ?? '',
                        attachment.checkedBy ?? '',
                        attachment.projectAttachmentUsage?.visible === 0 &&
                        attachment.projectAttachmentUsage.restricted === 0
                            ? 'n/a'
                            : _(
                                  <a
                                      href='#'
                                      title='visible / restricted'
                                      onClick={(e) => {
                                          e.preventDefault()
                                      }}
                                  >
                                      {attachment.projectAttachmentUsage?.visible ?? 0} /{' '}
                                      {attachment.projectAttachmentUsage?.restricted ?? 0}
                                  </a>,
                              ),
                        {
                            projectId,
                            attachmentId: CommonUtils.getIdFromUrl(attachment._links?.self.href),
                            attachmentName: attachment.filename,
                        },
                    ])
                }
                setData(tableData)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [projectId, t])

    return (
        <>
            {data ? (
                <Table
                    columns={columns}
                    data={data}
                    pagination={false}
                    selector={false}
                />
            ) : (
                <div className='col-12 d-flex justify-content-center align-items-center'>
                    <Spinner className='spinner' />
                </div>
            )}
            {importStatusData != null && (
                <Modal
                    show={true}
                    onHide={() => setImportStatusData(null)}
                    size='lg'
                    centered
                    scrollable
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <span className='text-primary'>{t('SBOM Import Statistics for')}:</span>{' '}
                            <span className='text-warning'>{importStatusData.fileName}</span>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <CDXImportStatus
                            data={importStatusData}
                            isNewProject={false}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant='secondary'
                            onClick={() => setImportStatusData(null)}
                        >
                            {t('Close')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(ProjectAttachments, [UserGroupType.SECURITY_USER])
