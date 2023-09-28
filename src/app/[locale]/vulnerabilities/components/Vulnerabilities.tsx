// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { QuickFilter, AdvancedSearch, _, Table } from '@/components/sw360'
import { useState, useEffect } from 'react'
import { Dropdown, Spinner } from 'react-bootstrap'

import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

import ApiUtils from '@/utils/api/api.util'
import CommonUtils from '@/utils/common.utils'
import { Session } from '@/object-types/Session'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { signOut } from 'next-auth/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FaTrashAlt, FaPencilAlt } from 'react-icons/fa'
import { useSearchParams } from 'next/navigation'
import DeleteVulnerabilityModal from './DeleteVulnerabilityModal'
import { useRouter } from 'next/navigation'

export default function Vulnerabilities({ session }: { session: Session }) {
    const DEFAULT_VULNERABILITIES = 200
    const [num, SetNum] = useState<number>(DEFAULT_VULNERABILITIES)
    const t = useTranslations(COMMON_NAMESPACE)
    const [vulnerabilitiesData, setVulnerabilitiesData] = useState<null | any[]>(null)
    const [search, setSearch] = useState({})
    const params = useSearchParams()
    const [vulnerabilityToBeDeleted, setVulnerabilityToBeDeleted] = useState<null | string>(null)
    const router = useRouter()

    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setSearch({ keyword: event.currentTarget.value })
    }

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

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const queryUrl = CommonUtils.createUrlWithParams('vulnerabilities', Object.fromEntries(params))
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const data = await response.json()

                const dataTableFormat =
                    CommonUtils.isNullOrUndefined(data['_embedded']) &&
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:vulnerabilityApiDTOes'])
                        ? []
                        : data['_embedded']['sw360:vulnerabilityApiDTOes'].map((elem: any) => [
                              elem.externalId ?? '',
                              elem.title ?? '',
                              { cvss: elem.cvss ?? '', cvssTime: elem.cvssTime ?? '' },
                              elem.publishDate?.substring(0, elem.publishDate.lastIndexOf('T')) ?? '',
                              elem.lastExternalUpdate?.substring(0, elem.lastExternalUpdate.lastIndexOf('T')) ?? '',
                              elem.externalId ?? '',
                          ])
                setVulnerabilitiesData(dataTableFormat)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [params, session])

    return (
        <>
            <DeleteVulnerabilityModal
                vulnerabilityId={vulnerabilityToBeDeleted}
                session={session}
                setVulnerability={setVulnerabilityToBeDeleted}
            />
            <div className='mx-3 mt-3'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <div className='row mb-3'>
                            <QuickFilter key='' searchFunction={doSearch} />
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
                                    <Dropdown className='col-auto'>
                                        <Dropdown.Toggle variant='secondary'>
                                            {num !== -1 ? `${t('Show latest')} ${num}` : t('Show All')}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => SetNum(200)}>200</Dropdown.Item>
                                            <Dropdown.Item onClick={() => SetNum(500)}>500</Dropdown.Item>
                                            <Dropdown.Item onClick={() => SetNum(1000)}>1000</Dropdown.Item>
                                            <Dropdown.Item onClick={() => SetNum(-1)}>{t('All')}</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className='col-auto buttonheader-title'>
                                {`${t('VULNERABILITIES')} (${
                                    vulnerabilitiesData
                                        ? num === -1
                                            ? vulnerabilitiesData.length
                                            : Math.min(vulnerabilitiesData.length, num)
                                        : '0'
                                })`}
                            </div>
                        </div>
                        <div className='row mt-3'>
                            {vulnerabilitiesData ? (
                                <Table columns={columns} data={vulnerabilitiesData} sort={false} search={search} />
                            ) : (
                                <div className='col-12' style={{ textAlign: 'center' }}>
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
