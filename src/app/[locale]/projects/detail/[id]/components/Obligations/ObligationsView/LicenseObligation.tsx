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
import { ProjectObligationsList, LicenseObligationRelease } from '@/object-types'
import { useSession } from 'next-auth/react'
import { BsCaretDownFill, BsCaretRightFill } from 'react-icons/bs'
import { Spinner } from 'react-bootstrap'
import { SW360_API_URL } from '@/utils/env'
import { CommonUtils } from '@/utils'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

function ExpandableList({ previewString, releases }: { previewString: string, releases: LicenseObligationRelease[] }) {
    const [ isExpanded, setExpanded ] = useState(false)
    return (
        <>
            {
                isExpanded ?
                <div>
                    <span><BsCaretDownFill onClick={() => setExpanded(false)} />{' '}</span>
                    {releases.map((release: LicenseObligationRelease, index: number) => {
                        return (
                            <li key={release.id} style={{ display: 'inline' }}>
                                <Link href={`/components/releases/detail/${release.id}`} className='text-link'>
                                    {`${release.name} ${release.version}`}
                                </Link>
                                {index >= releases.length - 1 ? '' : ', '}{' '}
                            </li>
                        )
                    })}
                </div>:
                <div>
                    {
                        releases.length !== 0 &&
                        <div><BsCaretRightFill onClick={() => setExpanded(true)} />{' '}{previewString}</div>
                    }
                </div>
            }
        </>
    )
}

function ShowObligationTextOnExpand({id, infoText, colLength}: {id: string, infoText: string, colLength: number }): JSX.Element {
    const [isExpanded, setIsExpanded] = useState(false)
    useEffect(() => {
        if(isExpanded) {
            const el = document.getElementById(id)
            const par = el?.parentElement?.parentElement?.parentElement
            const tr = document.createElement('tr')
            tr.id = `${id}_text`
            const td = document.createElement('td')
            td.colSpan = colLength
            const licenseObligationText = document.createElement('p')
            licenseObligationText.style.whiteSpace = 'pre-line'
            licenseObligationText.textContent = infoText
            licenseObligationText.className = 'ps-5 pt-2 pe-3'
            td.appendChild(licenseObligationText)
            tr.appendChild(td)
            par?.parentNode?.insertBefore(tr, par.nextSibling)
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

export default function LicenseObligation({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const { data: session, status } = useSession()

    const columns = [
        {
            id: 'licenseObligation.expand',
            formatter: ({id, infoText}: {id: string, infoText: string }) =>
            _(
                <>
                    <ShowObligationTextOnExpand id={id} infoText={infoText} colLength={columns.length} />
                </>
            ),
            width: '4%'
        },
        {
            id: 'licenseObligation.licenseObligation',
            name: t('License Obligation'),
            sort: true,
        },
        {
            id: 'licenseObligation.licenses',
            name: t('Licenses'),
            formatter: (licenseIds: string[]) =>
            _(
                <div className='text-center'>
                    {
                        <ul className='px-0'>
                            {licenseIds.map((licenseId: string, index: number) => {
                                return (
                                    <li key={licenseId} style={{ display: 'inline' }}>
                                        <Link href={`/licenses/${licenseId}`} className='text-link'>
                                            {licenseId}
                                        </Link>
                                        {index >= licenseIds.length - 1 ? '' : ', '}{' '}
                                    </li>
                                )
                            })}
                        </ul>
                    }
                </div>
            ),
            sort: true,
        },
        {
            id: 'licenseObligation.releases',
            name: t('Releases'),
            formatter: (releases: LicenseObligationRelease[]) => {
                const previewString = releases.map((r) => `${r.name} ${r.version}`).join(', ').substring(0, 10)
                return _(
                    <ExpandableList releases={releases} previewString={previewString} />
                )
            },
            sort: true,
        },
        {
            id: 'licenseObligation.status',
            name: t('Status'),
            sort: true,
        },
        {
            id: 'licenseObligation.type',
            name: t('Type'),
            sort: true,
        },
        {
            id: 'licenseObligation.id',
            name: t('Id'),
            sort: true,
        },
        {
            id: 'licenseObligation.comment',
            name: t('Comment'),
            sort: true,
        }
    ]

    const initServerPaginationConfig = () => {
        if (CommonUtils.isNullOrUndefined(session)) return
        return {
            url: `${SW360_API_URL}/resource/api/projects/${projectId}/licenseObligations`,
            then: (data: ProjectObligationsList) => {
                const tableRows = []
                for(const [key, val] of Object.entries(data.obligations)) {
                    const row = []
                    row.push(
                        ...[
                            {
                                id: key.split(' ').join('_'),
                                infoText: val.text,
                            },
                            key,
                            val.licenseIds ?? [],
                            val.releases ?? [],
                            Capitalize(val.status ?? ''),
                            val.type ?? '',
                            val.id ?? '',
                            val.comment ?? ''
                        ]
                    )
                    tableRows.push(row)
                }
                return tableRows
            },
            total: (data: ProjectObligationsList) => data.page?.totalElements ?? 0,
            headers: { Authorization: `${session.user.access_token}` },
        }
    }

    return (
        <>
            {
                (status === 'authenticated') ? 
                <Table columns={columns} server={initServerPaginationConfig()} selector={false} />:
                <Spinner className='spinner col-12 mt-1 text-center' />
            }
        </>
    )
}
