// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { _, Table } from '@/components/sw360'
import { Embedded, HttpStatus, LinkedPackage, ReleaseClearingStateMapping } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCallback, useEffect, useState, type JSX } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'

interface Props {
    projectId: string
}

type EmbeddedLinkedPackages = Embedded<LinkedPackage, 'sw360:packages'>

type RowData = (string | string[] | undefined)[]

export default function LinkedPackagesTab({ projectId }: Props): JSX.Element {

    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<RowData>>([])

    const columns = [
        {
            id: 'linkedPackagesData.vendor',
            name: t('Vendor'),
            sort: true,
            formatter: ([ vendorId, vendorName ]: Array<string>) =>
                _(
                    <>
                        <Link href={`/vendors/${vendorId}`}>
                            {vendorName}
                        </Link>
                    </>
                ),
        },
        {
            id: 'linkedPackagesData.packageName',
            name: t('Package Name Version'),
            sort: true,
            formatter: ([ packageId, packageName, packageVersion ]: Array<string>) =>
                _(
                    <>
                        <Link href={`/packages/detail/${packageId}`}>
                            {`${packageName} (${packageVersion})`}
                        </Link>
                    </>
                ),
        },
        {
            id: 'linkedPackagesData.releaseName',
            name: t('Release Name Version'),
            sort: true,
            formatter: ([ releaseId, releaseName, releaseVersion ]: Array<string>) =>
                _(
                    <>
                        <Link href={`/components/releases/detail/${releaseId}`}>
                            {`${releaseName} (${releaseVersion})`}
                        </Link>
                    </>
                ),
        },
        {
            id: 'linkedPackagesData.releaseClearingState',
            name: t('Release Clearing State'),
            sort: true,
            formatter : (releaseClearingState: string) => 
                _(
                    (releaseClearingState === "") ?
                        (
                            <>
                                {t('Not Applicable')}
                            </>
                        ) : (
                            <OverlayTrigger 
                                overlay={
                                    <Tooltip>{`${t('Release Clearing State')}: ${t(ReleaseClearingStateMapping[
                                        releaseClearingState as keyof typeof ReleaseClearingStateMapping])}`}
                                    </Tooltip>
                                }
                            >
                                {(releaseClearingState === 'NEW_CLEARING' || releaseClearingState === 'NEW') ? (
                                    <span className='state-box clearingStateOpen capsule-left capsule-right align-center'>
                                        {'CS'}
                                    </span>
                                ) : (releaseClearingState === 'REPORT_AVAILABLE') ? (
                                    <span className='state-box clearingStateReportAvailable capsule-left capsule-right'>
                                        {'CS'}
                                    </span>
                                ) : (releaseClearingState === 'UNDER_CLEARING') ? (
                                    <span className='state-box clearingStateInProgress capsule-left capsule-right'>
                                        {'CS'}
                                    </span>
                                ) : (releaseClearingState === 'INTERNAL_USE_SCAN_AVAILABLE') ? (
                                    <span className='state-box clearingStateUnknown capsule-left capsule-right'>
                                        {'CS'}
                                    </span>
                                ) : (releaseClearingState === 'SENT_TO_CLEARING_TOOL' ||
                                    releaseClearingState === 'SCAN_AVAILABLE') ? (
                                    <span className='state-box clearingStateSentToClearingTool capsule-left capsule-right'>
                                        {'CS'}
                                    </span>
                                ): (
                                    <span className='state-box clearingStateApproved capsule-left capsule-right'>
                                        {'CS'}
                                    </span>
                                )}
                            </OverlayTrigger>
                        )
                )
        },
        {
            id: 'linkedPackagesData.licenses',
            name: t('Licenses'),
            sort: true,
            formatter: (licenseIds: string[]) => _(
                <div>
                    {licenseIds.map((lincenseId, index) => (
                        <span key={index}>
                            <Link href={`/licenses/detail?id=${lincenseId}`}>
                                {lincenseId}
                            </Link>
                            {index !== licenseIds.length - 1 && ', '}
                        </span>
                    ))}
                </div>
            )
        },
        {
            id: 'linkedPackagesData.packageManager',
            name: t('Package Manager'),
            sort: true,
        },
        {
            id: 'linkedPackagesData.actions',
            name: t('Actions'),
            sort: true,
            formatter: (packageId: string) =>
                _(
                    <>
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={
                                <Tooltip>
                                    {t('Edit Package')}
                                </Tooltip>}>
                                <Link href={`/packages/edit/${packageId}`}
                                      className='overlay-trigger'>
                                    <FaPencilAlt className='btn-icon' />
                                </Link>
                            </OverlayTrigger>
                        </span>
                    </>
                ),
        },
    ]

    const fetchData = useCallback(
        async (url: string) => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return signOut()
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status === HttpStatus.OK) {
                const data = (await response.json())
                return data
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                return undefined
            }
        },
        []
    )

    useEffect(() => {
        fetchData(`projects/${projectId}/linkedPackages`)
            .then((linkedPackages: EmbeddedLinkedPackages | undefined) => {
                if (linkedPackages === undefined) return

                if (
                    !CommonUtils.isNullOrUndefined(linkedPackages['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(linkedPackages['_embedded']['sw360:packages'])
                ) {
                    const data = linkedPackages['_embedded']['sw360:packages'].map((item: LinkedPackage) => [
                        [
                            item.vendorId ?? '',
                            item.vendorName ?? ''
                        ],
                        [ item.id, item.name, item.packageVersion ],
                        [
                            item.releaseId ?? '',
                            item._embedded?.['sw360:release']?.name ?? '',
                            item._embedded?.['sw360:release']?.version ?? ''
                        ],
                        item._embedded?.['sw360:release']?.clearingState ?? '',
                        item.licenseIds ?? [],
                        item.packageManager ?? '',
                        item.id,
                    ])
                    setTableData(data)
                }
            })
            .catch((err) => console.error(err))
    }, [projectId, fetchData])


    return (
        <>
            <div className='row mb-4'>
                <div style={{ paddingLeft: '0px' }}>
                    <Table
                        columns={columns}
                        data={tableData}
                        sort={false}
                    />
                </div>
            </div>
        </>
    )
}
