// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { _, Table } from '@/components/sw360'
import { HttpStatus, LinkedPackage, Release } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCallback, useEffect, useState, type JSX } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'

interface Props {
    releaseId: string
}

type RowData = (string | string[] | undefined)[]

export default function LinkedPackagesTab({ releaseId }: Props): JSX.Element {
    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<RowData>>([])
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            void signOut()
        }
    }, [status])

    const columns = [
        {
            id: 'linkedPackagesData.vendor',
            name: t('Vendor'),
            sort: true,
            formatter: ([vendorId, vendorName]: Array<string>) =>
                _(<Link href={`/vendors/${vendorId}`}>{vendorName}</Link>),
        },
        {
            id: 'linkedPackagesData.packageName',
            name: t('Package Name Version'),
            sort: true,
            formatter: ([packageId, packageName, packageVersion]: Array<string>) =>
                _(<Link href={`/packages/detail/${packageId}`}>{`${packageName} (${packageVersion})`}</Link>),
        },
        {
            id: 'linkedPackagesData.releaseName',
            name: t('Release Name Version'),
            sort: true,
            formatter: ([relId, relName, relVersion]: Array<string>) =>
                _(
                    <Link href={`/components/releases/detail/${relId}`}>
                        {relName || relVersion ? `${relName} ${relVersion ? `(${relVersion})` : ''}` : 'N/A'}
                    </Link>,
                ),
        },
        {
            id: 'linkedPackagesData.releaseClearingState',
            name: t('Release Clearing State'),
            sort: true,
            formatter: (releaseClearingState: string) =>
                _(
                    <div className='text-center'>
                        {!releaseClearingState ? (
                            <>{t('Not Applicable')}</>
                        ) : (
                            <OverlayTrigger
                                overlay={
                                    <Tooltip>{`${t('Release Clearing State')}: ${releaseClearingState ?? ''}`}</Tooltip>
                                }
                            >
                                {releaseClearingState === 'NEW_CLEARING' || releaseClearingState === 'NEW' ? (
                                    <span className='badge bg-danger overlay-badge'>CS</span>
                                ) : releaseClearingState === 'REPORT_AVAILABLE' ? (
                                    <span className='badge bg-primary overlay-badge'>CS</span>
                                ) : releaseClearingState === 'UNDER_CLEARING' ? (
                                    <span className='badge bg-warning overlay-badge'>CS</span>
                                ) : releaseClearingState === 'INTERNAL_USE_SCAN_AVAILABLE' ? (
                                    <span className='badge bg-info overlay-badge'>CS</span>
                                ) : releaseClearingState === 'SENT_TO_CLEARING_TOOL' ||
                                  releaseClearingState === 'SCAN_AVAILABLE' ? (
                                    <span className='badge bg-info overlay-badge'>CS</span>
                                ) : (
                                    <span className='badge bg-success overlay-badge'>CS</span>
                                )}
                            </OverlayTrigger>
                        )}
                    </div>,
                ),
        },
        {
            id: 'linkedPackagesData.licenses',
            name: t('Licenses'),
            sort: true,
            formatter: (licenseIds: string[]) =>
                _(
                    <div>
                        {Array.isArray(licenseIds) && licenseIds.length > 0 ? (
                            licenseIds.map((licenseId, idx) => (
                                <span key={idx}>
                                    <Link href={`/licenses/detail?id=${licenseId}`}>{licenseId}</Link>
                                    {idx !== licenseIds.length - 1 && ', '}
                                </span>
                            ))
                        ) : (
                            <span className='text-muted'>{t('No Licenses')}</span>
                        )}
                    </div>,
                ),
        },
        {
            id: 'linkedPackagesData.packageManager',
            name: t('Package Manager'),
            sort: true,
        },
        {
            id: 'linkedPackagesData.comment',
            name: t('Comments'),
            sort: true,
        },
        {
            id: 'linkedPackagesData.actions',
            name: t('Actions'),
            sort: true,
            formatter: (packageId: string) =>
                _(
                    <span className='d-flex justify-content-evenly'>
                        <OverlayTrigger overlay={<Tooltip>{t('Edit Package')}</Tooltip>}>
                            <Link
                                href={`/packages/edit/${packageId}`}
                                className='overlay-trigger'
                            >
                                <FaPencilAlt className='btn-icon' />
                            </Link>
                        </OverlayTrigger>
                    </span>,
                ),
        },
    ]

    const fetchData = useCallback(async (url: string): Promise<Release | undefined> => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            void signOut()
            return undefined
        }
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            return (await response.json()) as Release
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            void signOut()
            return undefined
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        const fetchReleaseData = async () => {
            const linkedPackages = await fetchData(`releases/${releaseId}?embed=packages`)
            if (!linkedPackages) return

            const releaseClearingState = linkedPackages.clearingState ?? ''
            const packagesArray: LinkedPackage[] =
                (linkedPackages as Release & { _embedded?: { 'sw360:packages'?: LinkedPackage[] } })._embedded?.[
                    'sw360:packages'
                ] ?? []

            const data: RowData[] = packagesArray.map((item) => {
                const vendorInfo: string[] = [item.vendorId ?? '', item.vendorName ?? '']
                const packageInfo: string[] = [item.id ?? '', item.name ?? '', item.version ?? '']
                const releaseInfo: string[] = [
                    linkedPackages.id ?? '',
                    linkedPackages.name ?? '',
                    linkedPackages.version ?? '',
                ]
                const licenseInfo: string[] = item.licenseIds ? item.licenseIds.filter((id) => id) : []
                const comment: string =
                    (linkedPackages as Release & { packageIds?: Record<string, { comment?: string }> }).packageIds?.[
                        item.id
                    ]?.comment ?? ''

                return [
                    vendorInfo,
                    packageInfo,
                    releaseInfo,
                    releaseClearingState,
                    licenseInfo,
                    item.packageManager ?? '',
                    comment,
                    item.id ?? '',
                ]
            })

            setTableData(data)
        }

        void fetchReleaseData()
    }, [releaseId, fetchData])

    return (
        <div className='row mb-4'>
            <div style={{ paddingLeft: '0px' }}>
                <Table
                    columns={columns}
                    data={tableData}
                    sort={false}
                />
            </div>
        </div>
    )
}
