// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useState } from 'react'
import { Alert, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import { _, Table } from '@/components/sw360'
import { FilterOption, LinkedPackage, Release } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { StatusCodes } from 'http-status-codes'
import { packageManagers } from '@/app/[locale]/packages/components/PackageManagers'
import { ColumnFiltersState } from '@tanstack/react-table'

interface Props {
    releaseId: string
}

type RowData = (string | string[] | undefined)[]

const packageManagerFilterOptions: FilterOption[] = packageManagers.map((pm: string) => ({
    tag: pm,
    value: pm.toUpperCase(),
}))

export default function LinkedPackagesTab({ releaseId }: Props): JSX.Element {
    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<RowData>>([])
    const { status } = useSession()
    const [showModal, setShowModal] = useState(false)
    const [selectedPkg, setSelectedPkgId] = useState<{
        id: string
        name: string
        version: string
    } | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [alert, setAlert] = useState<{
        variant: string
        message: JSX.Element
    } | null>(null)

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [showFilter, setShowFilter] = useState<undefined | string>()

    useEffect(() => {
        if (status === 'unauthenticated') {
            void signOut()
        }
    }, [
        status,
    ])
    const deleteLinkedPackage = async () => {
        if (!selectedPkg) return
        try {
            setDeleting(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()

            const response = await ApiUtils.DELETE(`packages/${selectedPkg.id}`, session.user.access_token)

            if (response.status === StatusCodes.OK || response.status === StatusCodes.NO_CONTENT) {
                MessageService.success(t('Package deleted successfully'))
                setTableData((prev) => prev.filter((row) => row[row.length - 1] !== selectedPkg.id))
                setShowModal(false)
                setAlert({
                    variant: 'success',
                    message: <>{t('Package deleted successfully')}</>,
                })
            } else if (response.status === StatusCodes.CONFLICT) {
                setAlert({
                    variant: 'warning',
                    message: (<> The Package cannot be deleted, Since it is used by other project. Please unlink it before deleting. </>),
                })
            } else {
                setAlert({
                    variant: 'warning',
                    message: <> Package cannot be deleted</>,
                })
            }
        } catch (error) {
            console.error(error)
            setAlert({
                variant: 'warning',
                message: <> Package cannot be deleted </>,
            })
        } finally {
            setDeleting(false)
        }
    }

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
            formatter: (
                pkgTuple: [
                    string,
                    string,
                    string,
                ],
            ) =>
                _(
                    <span className='d-flex justify-content-evenly'>
                        <OverlayTrigger overlay={<Tooltip>{t('Edit Package')}</Tooltip>}>
                            <Link
                                href={`/packages/edit/${pkgTuple[0]}`}
                                className='overlay-trigger'
                            >
                                <FaPencilAlt className='btn-icon' />
                            </Link>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={<Tooltip>{t('Delete Package')}</Tooltip>}>
                            <span
                                className='d-inline-block'
                                style={{
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    const [id, name, version] = pkgTuple
                                    setSelectedPkgId({
                                        id,
                                        name,
                                        version,
                                    })
                                    setAlert(null)
                                    setShowModal(true)
                                }}
                            >
                                <FaTrashAlt
                                    className='btn-icon'
                                    style={{
                                        color: 'gray',
                                        fontSize: '18px',
                                    }}
                                />
                            </span>
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
        if (response.status === StatusCodes.OK) {
            return (await response.json()) as Release
        } else if (response.status === StatusCodes.UNAUTHORIZED) {
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
                (
                    linkedPackages as Release & {
                        _embedded?: {
                            'sw360:packages'?: LinkedPackage[]
                        }
                    }
                )._embedded?.['sw360:packages'] ?? []

            const data: RowData[] = packagesArray.map((item) => {
                const vendorInfo: string[] = [
                    item.vendorId ?? '',
                    item.vendorName ?? '',
                ]
                const packageInfo: string[] = [
                    item.id ?? '',
                    item.name ?? '',
                    item.version ?? '',
                ]
                const releaseInfo: string[] = [
                    linkedPackages.id ?? '',
                    linkedPackages.name ?? '',
                    linkedPackages.version ?? '',
                ]
                const licenseInfo: string[] = item.licenseIds ? item.licenseIds.filter((id) => id) : []
                const comment: string =
                    (
                        linkedPackages as Release & {
                            packageIds?: Record<
                                string,
                                {
                                    comment?: string
                                }
                            >
                        }
                    ).packageIds?.[item.id]?.comment ?? ''

                return [
                    vendorInfo,
                    packageInfo,
                    releaseInfo,
                    releaseClearingState,
                    licenseInfo,
                    item.packageManager ?? '',
                    comment,
                    [
                        item.id ?? '',
                        item.name ?? '',
                        item.version ?? '',
                    ],
                ]
            })

            setTableData(data)
        }

        void fetchReleaseData()
    }, [
        releaseId,
        fetchData,
    ])

    return (
        <>
            <div className='row mb-4'>
                <div
                    style={{
                        paddingLeft: '0px',
                    }}
                >
                    <Table
                        columns={columns}
                        data={tableData}
                        sort={false}
                    />
                </div>
            </div>

            <Modal
                size='lg'
                centered
                show={showModal}
                onHide={() => {
                    setShowModal(false)
                    setSelectedPkgId(null)
                    setAlert(null)
                    setDeleting(false)
                }}
                aria-labelledby='delete-package-modal'
                scrollable
            >
                <Modal.Header
                    style={{
                        backgroundColor: '#feefef',
                        color: '#da1414',
                    }}
                    closeButton
                >
                    <Modal.Title id='delete-package-modal'>{t('Delete Package')}?</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {alert && (
                        <Alert variant={alert.variant} className="mb-3">
                            {alert.message}
                        </Alert>
                    )}
                    {!alert && selectedPkg && (
                        <p>
                            {t('Do you really want to delete the package')}{' '}
                            <strong>
                                {selectedPkg.name}{selectedPkg.version ? ` (${selectedPkg.version})` : ''}
                            </strong>
                            ?
                        </p>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    {alert ? (
                        <button
                            className='btn btn-dark'
                            onClick={() => {
                                setShowModal(false)
                                setSelectedPkgId(null)
                                setAlert(null)
                                setDeleting(false)
                            }}
                        >
                            {t('Close')}
                        </button>
                    ) : (
                        <>
                            <button
                                className='btn btn-dark'
                                onClick={() => {
                                    setShowModal(false)
                                    setSelectedPkgId(null)
                                }}
                                disabled={deleting}
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                className='btn btn-danger'
                                onClick={() => void deleteLinkedPackage()}
                                disabled={deleting}
                            >
                                {t('Delete Package')}
                                {deleting && (
                                    <Spinner
                                        size='sm'
                                        className='ms-1 spinner'
                                    />
                                )}
                            </button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    )
}
