// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { Table, _ } from '@/components/sw360'
import { HttpStatus, Attachment, Embedded } from '@/object-types'
import { ApiUtils } from '@/utils'
import { signOut, useSession, getSession } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { BsCaretDownFill, BsCaretRightFill } from 'react-icons/bs'
import { LuDownload } from "react-icons/lu"
import { Spinner } from 'react-bootstrap'
import DownloadService from '@/services/download.service'

type EmbeddedAttachments = Embedded<Attachment, 'sw360:attachments'>

const handleAttachmentDownload = async ({projectId, attachmentId, attachmentName} :{ projectId: string, attachmentId: string, attachmentName: string }) => {
    try {
        const session = await getSession()
        DownloadService.download(`projects/${projectId}/attachments/${attachmentId}`, session, attachmentName)
    } catch(e) {
        console.error(e)
    }
}

function ShowAttachmentTextOnExpand({id, sha1, uploadedOn, uploadedComment, checkedOn, checkedComment, colLength}: 
    {id: string, sha1: string, uploadedOn: string, uploadedComment: string, checkedOn: string, checkedComment: string, colLength: number }): JSX.Element {
    const [isExpanded, setIsExpanded] = useState(false)
    useEffect(() => {
        if(isExpanded) {
            const el = document.getElementById(id)
            const par = el.parentElement.parentElement.parentElement
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
            par.parentNode.insertBefore(tr, par.nextSibling)
        }
        else {
            const el = document.getElementById(`${id}_text`)
            if(el) {
                el.remove()
            }
        }
    }, [isExpanded])
    
    return (
        <>
            {
                isExpanded 
                ? <BsCaretDownFill color='gray' id={id} onClick={() => setIsExpanded(!isExpanded)} />
                : <BsCaretRightFill color='gray' id={id} onClick={() => setIsExpanded(!isExpanded)} />
            }
        </>
    )
}

export default function ProjectAttachments({ projectId }: { projectId: string }) {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [data, setData] = useState<any[] | null>(null)

    const columns = [
        {
            id: 'attachments.expand',
            formatter: ({id, sha1, uploadedOn, uploadedComment, checkedOn, checkedComment}: 
                {id: string, sha1: string, uploadedOn: string, uploadedComment: string, checkedOn: string, checkedComment: string }) =>
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
                </>
            ),
            width: '4%'
        },
        {
            id: 'attachments.fileName',
            name: t('File name'),
            sort: true,
            width: '20%'
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
            name: t('Checked by'),
            formatter: (email: string) =>
            _(
                <>
                    <Link href={`mailto:${email}`} className='text-link'>
                        {email}
                    </Link>
                </>
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
            formatter: ({ projectId, attachmentId, attachmentName }: { projectId: string, attachmentId: string, attachmentName: string }) =>
            _(
                <LuDownload className='btn-icon' size={18} onClick={() => handleAttachmentDownload({ projectId, attachmentId, attachmentName })}/>
            ),
            sort: true,
            width: '6%'
        }
    ]

    useEffect(() => {
        if (status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal
        
        ;(async () => {
            try {
                const res = await ApiUtils.GET(
                    `projects/${projectId}/attachments`,
                    session.user.access_token,
                    signal
                )

                if (res.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (res.status !== HttpStatus.OK) {
                    return notFound()
                }

                const projectAttachments: EmbeddedAttachments = await res.json()

                const tableData: any[] = []
                for (const attachment of projectAttachments["_embedded"]["sw360:attachments"]) {
                    tableData.push([
                        { 
                            id: `projectAttachments.${attachment.sha1}` ?? '', sha1: attachment.sha1 ?? '',
                            uploadedOn: attachment.createdOn ?? '', uploadedComment: attachment.createdComment ?? '',
                            checkedOn: attachment.checkedOn ?? '', checkedComment: attachment.checkedComment ?? ''
                        },
                        attachment.filename,
                        attachment.size ?? 'n/a',
                        attachment.attachmentType ?? '',
                        attachment.createdTeam ?? '',
						attachment.createdBy ?? '',
						attachment.checkedTeam ?? '',
						attachment.checkedBy ?? '',
						attachment.usageAttachment ?? 'n/a',
						{ projectId, attachmentId: attachment['_links']['self']['href'].substring(attachment['_links']['self']['href'].lastIndexOf('/') + 1), attachmentName: attachment.filename }
                    ])
                }
                setData(tableData)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [status, projectId, session, t])

    return (
        <>
            {
                data ? 
                <Table columns={columns} data={data} pagination={false} selector={false} /> :
                <div className='col-12 d-flex justify-content-center align-items-center'>
                    <Spinner className='spinner' />
                </div>
            }
        </>
    )
}