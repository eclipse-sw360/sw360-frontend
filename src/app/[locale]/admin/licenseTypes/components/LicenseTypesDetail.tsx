// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, QuickFilter, SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import { Embedded, ErrorDetails, LicenseType } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import DeleteLicenseTypesModal from './DeleteLicenseTypesModal'

type EmbeddedLicenseTypes = Embedded<LicenseType, 'sw360:licenseTypes'>

export default function LicenseTypesDetail(): ReactNode {
    const router = useRouter()
    const t = useTranslations('default')
    const [quickFilter, setQuickFilter] = useState({})
    const [licenseTypeId, setLicenseTypeId] = useState<string>('')
    const [licenseTypeName, setLicenseTypeName] = useState<string>('')
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
    const [licenseTypeCount, setLicenseTypeCount] = useState<null | number>(null)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<LicenseType>[]>(
        () => [
            {
                id: 'licenseType',
                header: t('License Type'),
                accessorKey: 'licenseType',
                cell: (info) => info.getValue(),
                meta: {
                    width: '80%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    return (
                        <div className='d-flex justify-content-between'>
                            <OverlayTrigger overlay={<Tooltip>{t('Delete License Type')}</Tooltip>}>
                                <span className='d-inline-block'>
                                    <FaTrashAlt
                                        className='btn-icon'
                                        onClick={() => {
                                            handleDeleteLicenseType(row.original.id, row.original.licenseType)
                                        }}
                                    />
                                </span>
                            </OverlayTrigger>
                        </div>
                    )
                },
                meta: {
                    width: '20%',
                },
            },
        ],
        [
            t,
        ],
    )

    const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>(() => [])
    const memoizedData = useMemo(
        () => licenseTypes,
        [
            licenseTypes,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(true)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = licenseTypes.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    'licenseTypes',
                    Object.fromEntries(
                        Object.entries(quickFilter).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedLicenseTypes
                console.log(data['_embedded']?.['sw360:licenseTypes'])
                setLicenseTypes(
                    CommonUtils.isNullOrUndefined(data?.['_embedded']?.['sw360:licenseTypes'])
                        ? []
                        : data['_embedded']['sw360:licenseTypes'],
                )
                setLicenseTypeCount(data['_embedded']?.['sw360:licenseTypes'].length ?? 0)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        session,
        quickFilter,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),
    })

    const handleAddLicenseType = () => {
        router.push('/admin/licenseTypes/add')
    }

    const handleDeleteLicenseType = (id: string, licenseTypeName: string) => {
        setShowDeleteModal(true)
        setLicenseTypeId(id)
        setLicenseTypeName(licenseTypeName)
    }

    const doSearch = (value: string) => {
        setQuickFilter({
            search: value,
        })
    }

    return (
        <>
            {showDeleteModal && (
                <DeleteLicenseTypesModal
                    licenseTypeId={licenseTypeId}
                    licenseTypeName={licenseTypeName}
                    show={showDeleteModal}
                    setShow={setShowDeleteModal}
                />
            )}
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <QuickFilter
                            id='licenseTypeSearch'
                            searchFunction={doSearch}
                            title={t('Quick Filter')}
                        />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between'>
                            <div className='col-lg-5'>
                                <button
                                    className='btn btn-primary col-auto me-2'
                                    onClick={() => handleAddLicenseType()}
                                >
                                    {t('Add License Type')}
                                </button>
                            </div>
                            <div className='col-auto buttonheader-title'>
                                {`${t('License Types')} (${licenseTypeCount ?? ''})`}
                            </div>
                        </div>
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
                    </div>
                </div>
            </div>
        </>
    )
}
