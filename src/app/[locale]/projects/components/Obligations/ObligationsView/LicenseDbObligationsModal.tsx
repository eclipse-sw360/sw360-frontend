// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useState } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import { useTranslations } from "next-intl"
import { Dispatch, ReactNode, SetStateAction } from 'react'
import { GrCheckboxSelected } from 'react-icons/gr'
import { ShowObligationTextOnExpand, ExpandableList } from './ExpandableComponents'
import { HttpStatus, LicenseObligationRelease, ProjectObligationsList, ErrorDetails } from '@/object-types'
import Link from 'next/link'
import { Table, _ } from '@/components/sw360'
import { getSession, signOut, useSession } from 'next-auth/react'
import { SW360_API_URL } from '@/utils/env'
import { ApiUtils, CommonUtils } from '@/utils'
import MessageService from '@/services/message.service'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

export default function LicenseDbObligationsModal({
    show,
    setShow,
    projectId,
    refresh,
    setRefresh
} :{
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    projectId: string
    refresh: boolean
    setRefresh: Dispatch<SetStateAction<boolean>>
}) : ReactNode {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const [obligationIds, setObligationIds] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const addObligationsToLicense = async () => {
        try {
            setLoading(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return signOut()
            const response = await ApiUtils.POST(
                `projects/${projectId}/licenseObligation`,
                obligationIds,
                session.user.access_token
            )
            if (response.status === HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else if (response.status === HttpStatus.CREATED) {
                MessageService.success(t('Added obligations successfully'))
            } else {
                const err = await response.json() as ErrorDetails
                throw new Error(err.message);
            }
            setLoading(false)
        } catch(error: unknown) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return
            }
            const message = error instanceof Error ? error.message : String(error);
            MessageService.error(message);
        }
    }

    const columns = [
        {
            id: 'licenseDbObligation.expand',
            formatter: ({ id, infoText }: { id: string, infoText: string }) =>
                _(
                    <ShowObligationTextOnExpand id={id} infoText={infoText} colLength={columns.length} />
                ),
            width: '4%'
        },
        {
            id: 'licenseDbObligation.select',
            name: _(                    
                <input
                    id='licenseDbObligation.selectAll'
                    type='checkbox'
                    className='form-check-input'
                />
            ),
            formatter: (id: string) => {
                return _(
                    <input
                        id={id}
                        type='checkbox'
                        className='form-check-input'
                        checked={obligationIds.indexOf(id) !== -1}
                        onChange={
                            (e) => {
                                if(!e.target.checked) {
                                    setObligationIds(obligationIds.filter(ob => ob !== id))
                                } else {
                                    setObligationIds([...obligationIds, id])
                                }
                            }
                        }
                    />
                )
            },
            sort: true,
            width: '4%'
        },
        {
            id: 'licenseDbObligation.licenseObligation',
            name: t('License Obligation'),
            formatter: (oblTitle: string) =>
                _(
                    <div className='text-center'>
                        <span >{oblTitle}</span>
                    </div>
                ),
            sort: true,
            width: '25%'
        },
        {
            id: 'licenseDbObligation.licenses',
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
            width: '15%'
        },
        {
            id: 'licenseDbObligation.releases',
            name: t('Releases'),
            formatter: (releases: LicenseObligationRelease[]) =>
                _(<>{
                    Array.isArray(releases) && releases.length > 0 ? (
                        <ExpandableList releases={releases} previewString={releases.map((r) => `${r.name} ${r.version}`).join(', ').substring(0, 10)} commonReleases={[]} />
                    ) : null
                }</>),
            sort: true,
            width: '15%'
        },
        {
            id: 'licenseDbObligation.id',
            name: t('Id'),
            sort: true,
            width: '8%'
        },
        {
            id: 'licenseDbObligation.type',
            name: t('Type'),
            sort: true,
            width: '8%'
        },
    ]

    const initServerPaginationConfig = () => { 
        if (CommonUtils.isNullOrUndefined(session)) return
        return {
            url: `${SW360_API_URL}/resource/api/projects/${projectId}/licenseDbObligations`,
            then: (data: ProjectObligationsList) => {
                const tableData = []
                for(const [key, val] of Object.entries(data.obligations)) {
                    tableData.push([
                        { 
                            id: key,
                            infoText: val.text ?? '' 
                        },
                        val.id,
                        key,
                        val.licenseIds ?? [],
                        val.releases ?? [],
                        '',
                        Capitalize(val.obligationType ?? '')
                    ])
                }
                return tableData
            },
            total: (data: ProjectObligationsList) => data.page?.totalElements ?? 0,
            headers: { Authorization: session.user.access_token },
        }
    }

    return (
        <Modal
            size='lg'
            centered
            show={show}
            onHide={() => setShow(false)}
            scrollable
        >
            <Modal.Header 
                style={{ backgroundColor: '#eef2fa', color: '#2e5aac' }}
                closeButton
            >
                <Modal.Title id='delete-all-license-info-modal'>
                    <GrCheckboxSelected /> {t('Select License Obligations to be added')}.
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table
                    columns={columns}
                    server={initServerPaginationConfig()}
                    selector={true}
                    sort={false}
                /> 
            </Modal.Body>
            <Modal.Footer>
                <button
                    className='btn btn-dark'
                    onClick={() => setShow(false)}
                >
                    {t('Cancel')}
                </button>
                <button
                    className='btn btn-primary'
                    onClick={async () => { 
                        await addObligationsToLicense()
                        setShow(false)
                        setObligationIds([])
                        setRefresh(!refresh)
                    }}
                    disabled={loading}
                >
                    {t('Add')} {loading === true && <Spinner size='sm' className='ms-1 spinner text-dark' />}
                </button>
            </Modal.Footer>
        </Modal>
    )
}
