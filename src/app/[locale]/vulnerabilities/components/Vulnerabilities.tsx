// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, Vulnerability, Session } from '@/object-types'
import { CommonUtils } from '@/utils'
import { SW360_API_URL } from '@/utils/env'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AdvancedSearch, QuickFilter, Table, _ } from 'next-sw360'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import DeleteVulnerabilityModal from './DeleteVulnerabilityModal'

type EmbeddedVulnerabilities = Embedded<Vulnerability, 'sw360:vulnerabilityApiDTOes'>

const VulnerabilitesTable = React.memo(Table, () => true)

function Vulnerabilities() {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const params = useSearchParams()
    const [numVulnerabilities, setNumVulnerabilities] = useState<null | number>(null)
    const [vulnerabilityToBeDeleted, setVulnerabilityToBeDeleted] = useState<null | string>(null)
    const router = useRouter()

    const onDeleteClick = (id: string) => {
        setVulnerabilityToBeDeleted(id)
    }

    const handleAddVulnerability = () => {
        router.push('/vulnerabilities/add')
    }

    const advancedSearch = [
        {
            fieldName: 'CVE ID',
            value: '',
            paramName: 'externalId',
        },
        {
            fieldName: 'Vulnerable Configuration',
            value: '',
            paramName: 'vulnerableConfiguration',
        },
    ]

    const columns = [
        {
            id: 'vulnerabilities.externalId',
            name: t('External Id'),
            formatter: (externalId: string) =>
                _(
                    <>
                        <Link href={`/vulnerabilities/detail/${externalId}`} className='text-link'>
                            {externalId}
                        </Link>
                    </>
                ),
            sort: true,
        },
        {
            id: 'vulnerabilities.title',
            name: t('Title'),
            sort: true,
        },
        {
            id: 'vulnerabilities.weighting',
            name: t('Weighting'),
            formatter: ({ cvss, cvssTime }: { cvss: string; cvssTime: string }) =>
                _(
                    <>
                        <span style={{ color: 'red' }}>{`${cvss} (as of: ${cvssTime})`}</span>
                    </>
                ),
            sort: true,
        },
        {
            id: 'vulnerabilities.publishDate',
            name: t('Publish Date'),
            sort: true,
        },
        {
            id: 'vulnerabilities.lastUpdate',
            name: t('Last Update'),
            sort: true,
        },
        {
            id: 'vulnerabilities.actions',
            name: t('Actions'),
            formatter: (id: string) =>
                _(
                    <>
                        <span className='d-flex justify-content-evenly'>
                            <Link href={`/vulnerabilities/edit/${id}`} style={{ color: 'gray', fontSize: '14px' }}>
                                <FaPencilAlt className='btn-icon' />
                            </Link>
                            <FaTrashAlt
                                className='btn-icon'
                                onClick={() => {
                                    onDeleteClick(id)
                                }}
                            />
                        </span>
                    </>
                ),
        },
    ]

    const initServerPaginationConfig = (session: Session) => {
        return {
            url: CommonUtils.createUrlWithParams(
                `${SW360_API_URL}/resource/api/vulnerabilities`,
                Object.fromEntries(params)
            ),
            then: (data: EmbeddedVulnerabilities) => {
                setNumVulnerabilities(data.page.totalElements)
                if (!CommonUtils.isNullEmptyOrUndefinedArray(data._embedded['sw360:vulnerabilityApiDTOes'])) {
                    return data._embedded['sw360:vulnerabilityApiDTOes'].map((elem: Vulnerability) => [
                        elem.externalId ?? '',
                        elem.title ?? '',
                        { cvss: elem.cvss ?? '', cvssTime: elem.cvssTime ?? '' },
                        elem.publishDate?.substring(0, elem.publishDate.lastIndexOf('T')) ?? '',
                        elem.lastExternalUpdate?.substring(0, elem.lastExternalUpdate.lastIndexOf('T')) ?? '',
                        elem.externalId ?? '',
                    ])
                }
            },
            total: (data: EmbeddedVulnerabilities) => data.page.totalElements,
            headers: { Authorization: `${session.user.access_token}` },
        }
    }

    return (
        <>
            <DeleteVulnerabilityModal
                vulnerabilityId={vulnerabilityToBeDeleted}
                setVulnerability={setVulnerabilityToBeDeleted}
            />
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <div className='row mb-3'>
                            <QuickFilter id='vunerabilities.quickSearch' />
                        </div>
                        <div className='row'>
                            <AdvancedSearch title='Advanced Filter' fields={advancedSearch} />
                        </div>
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between ms-1'>
                            <div className='col-lg-5'>
                                <div className='row'>
                                    <button className='btn btn-primary col-auto' onClick={handleAddVulnerability}>
                                        {t('Add Vulnerability')}
                                    </button>
                                </div>
                            </div>
                            <div className='col-auto buttonheader-title'>
                                {`${t('VULNERABILITIES')} (${numVulnerabilities ?? ''})`}
                            </div>
                        </div>
                        <div className='row mt-3'>
                            {status === 'authenticated' ? (
                                <VulnerabilitesTable columns={columns} server={initServerPaginationConfig(session)} selector={true} sort={false} />
                            ) : (
                                <div className='col-12 d-flex justify-content-center align-items-center'>
                                    <Spinner className='spinner' />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Vulnerabilities
