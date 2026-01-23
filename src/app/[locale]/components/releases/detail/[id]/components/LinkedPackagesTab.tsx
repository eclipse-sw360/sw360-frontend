// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Alert, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsFillTrashFill, BsPencil } from 'react-icons/bs'
import { packageManagers } from '@/app/[locale]/packages/components/PackageManagers'
import { ClientSidePageSizeSelector, ClientSideTableFooter, FilterComponent, SW360Table } from '@/components/sw360'
import { Embedded, ErrorDetails, FilterOption, LinkedPackage } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiError, ApiUtils } from '@/utils/index'

interface Props {
    releaseId: string
}

type EmbeddedLinkedPackages = Embedded<LinkedPackage, 'sw360:packages'>

const packageManagerFilterOptions: FilterOption[] = packageManagers.map((pm: string) => ({
    tag: pm,
    value: pm.toUpperCase(),
}))

export default function LinkedPackagesTab({ releaseId }: Props): JSX.Element {
    const t = useTranslations('default')
    const session = useSession()

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [showFilter, setShowFilter] = useState<undefined | string>()
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPkg, setSelectedPkg] = useState<{
        id: string
        name: string
        version: string
    } | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [alert, setAlert] = useState<{
        variant: string
        message: JSX.Element
    } | null>(null)

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<LinkedPackage>[]>(
        () => [
            {
                id: 'vendor',
                header: t('Vendor'),
                cell: ({ row }) => (
                    <Link
                        href={`/vendors/${row.original.vendorId}`}
                        className='text-link'
                    >
                        {row.original.vendorName}
                    </Link>
                ),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'packageName',
                header: t('Package Name Version'),
                cell: ({ row }) => (
                    <Link
                        className='text-link'
                        href={`/packages/detail/${row.original.id}`}
                    >{`${row.original.name} (${row.original.version})`}</Link>
                ),
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'licenses',
                header: t('Licenses'),
                cell: ({ row }) => {
                    const { licenseIds } = row.original
                    return (
                        <div>
                            {Array.isArray(licenseIds) &&
                                licenseIds.length > 0 &&
                                licenseIds.map((licenseId, idx) => (
                                    <span key={licenseId}>
                                        <Link
                                            href={`/licenses/detail?id=${licenseId}`}
                                            className='text-link'
                                        >
                                            {licenseId}
                                        </Link>
                                        {idx !== licenseIds.length - 1 && ', '}
                                    </span>
                                ))}
                        </div>
                    )
                },
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'packageManager',
                header: () => (
                    <div className='d-flex justify-content-between align-items-center'>
                        <span>{t('Package Manager')}</span>
                        <FilterComponent
                            renderFilterOptions={packageManagerFilterOptions}
                            setColumnFilters={setColumnFilters}
                            columnFilters={columnFilters}
                            id='packageManager'
                            show={showFilter}
                            setShow={setShowFilter}
                            header={t('Package Manager')}
                        />
                    </div>
                ),
                accessorKey: 'packageManager',
                enableSorting: false,
                cell: (info) => info.getValue(),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    const { id, name, version } = row.original
                    return (
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit Package')}</Tooltip>}>
                                <Link
                                    href={`/packages/edit/${id}`}
                                    className='overlay-trigger'
                                >
                                    <BsPencil
                                        className='btn-icon'
                                        size={20}
                                    />
                                </Link>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>{t('Delete Package')}</Tooltip>}>
                                <span
                                    className='d-inline-block'
                                    style={{
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                        setSelectedPkg({
                                            id,
                                            name: name ?? '',
                                            version: version ?? '',
                                        })
                                        setAlert(null)
                                        setShowDeleteModal(true)
                                    }}
                                >
                                    <BsFillTrashFill
                                        className='btn-icon'
                                        style={{
                                            fontSize: '18px',
                                        }}
                                        size={20}
                                    />
                                </span>
                            </OverlayTrigger>
                        </span>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            t,
            columnFilters,
            showFilter,
        ],
    )

    const [packagesData, setPackagesData] = useState<LinkedPackage[]>(() => [])
    const deleteLinkedPackage = async () => {
        if (!selectedPkg || !session.data) return

        try {
            setDeleting(true)

            const response = await ApiUtils.DELETE(`packages/${selectedPkg.id}`, session.data.user.access_token)
            if (response.status === StatusCodes.OK || response.status === StatusCodes.NO_CONTENT) {
                MessageService.success(t('Package deleted successfully'))
                setPackagesData((prev) => prev.filter((pkg) => pkg.id !== selectedPkg.id))

                setShowDeleteModal(false)
                setSelectedPkg(null)
                setAlert(null)
            } else if (response.status === StatusCodes.CONFLICT) {
                setAlert({
                    variant: 'warning',
                    message: (
                        <>
                            {t(
                                'The Package cannot be deleted, Since it is used by other project Please unlink it before deleting',
                            )}
                        </>
                    ),
                })
            } else {
                setAlert({
                    variant: 'warning',
                    message: <>{t('Package cannot be deleted')}</>,
                })
            }
        } catch (error) {
            console.error(error)
            setAlert({
                variant: 'warning',
                message: <>{t('Package cannot be deleted')}</>,
            })
        } finally {
            setDeleting(false)
        }
    }
    const memoizedData = useMemo(
        () => packagesData,
        [
            packagesData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = packagesData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(`releases/${releaseId}`, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedLinkedPackages
                setPackagesData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:packages'])
                        ? []
                        : data['_embedded']['sw360:packages'],
                )
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        session,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        state: {
            columnFilters,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,

        meta: {
            rowHeightConstant: true,
        },
    })

    return (
        <>
            <div className='mb-3'>
                {table ? (
                    <>
                        <ClientSidePageSizeSelector table={table} />
                        <SW360Table
                            table={table}
                            showProcessing={showProcessing}
                        />
                        <ClientSideTableFooter table={table} />
                    </>
                ) : (
                    <div className='col-12 mt-1 text-center'>
                        <Spinner className='spinner' />
                    </div>
                )}
            </div>
            <Modal
                size='lg'
                centered
                show={showDeleteModal}
                onHide={() => {
                    setShowDeleteModal(false)
                    setSelectedPkg(null)
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
                        <Alert
                            variant={alert.variant}
                            className='mb-3'
                        >
                            {alert.message}
                        </Alert>
                    )}
                    {!alert && selectedPkg && (
                        <p>
                            {t('Do you really want to delete the package')}{' '}
                            <strong>
                                {selectedPkg.name}
                                {selectedPkg.version ? ` (${selectedPkg.version})` : ''}
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
                                setShowDeleteModal(false)
                                setSelectedPkg(null)
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
                                    setShowDeleteModal(false)
                                    setSelectedPkg(null)
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
