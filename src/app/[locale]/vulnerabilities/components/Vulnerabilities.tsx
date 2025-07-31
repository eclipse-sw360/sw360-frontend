// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    Embedded,
    ErrorDetails,
    HttpStatus,
    PageableQueryParam,
    PaginationMeta,
    UserGroupType,
    Vulnerability,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AdvancedSearch, PageSizeSelector, QuickFilter, SW360Table, TableFooter } from 'next-sw360'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'
import { MdDeleteOutline } from 'react-icons/md'
import DeleteVulnerabilityModal from './DeleteVulnerabilityModal'

type EmbeddedVulnerabilities = Embedded<Vulnerability, 'sw360:vulnerabilityApiDTOes'>

function Vulnerabilities(): ReactNode {
    const t = useTranslations('default')
    const params = useSearchParams()
    const [numVulnerabilities, setNumVulnerabilities] = useState<null | number>(0)
    const [vulnerabilityToBeDeleted, setVulnerabilityToBeDeleted] = useState<null | string>(null)
    const router = useRouter()
    const { data: session, status } = useSession()
    const [reloadKey, setReloadKey] = useState(1)
    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: '',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

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

    const columns = useMemo<ColumnDef<Vulnerability>[]>(
        () => [
            {
                id: 'externalId',
                header: t('External Id'),
                cell: ({ row }) => {
                    const { externalId } = row.original
                    return (
                        <Link
                            href={`/vulnerabilities/detail/${externalId}`}
                            className='text-link'
                        >
                            {externalId}
                        </Link>
                    )
                },
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'title',
                header: t('Title'),
                accessorKey: 'title',
                cell: (info) => info.getValue(),
                meta: {
                    width: '35%',
                },
            },
            {
                id: 'cvss',
                header: t('Weighting'),
                accessorKey: 'cvss',
                cell: ({ row }) => {
                    const { cvss, cvssTime } = row.original
                    return (
                        <>
                            {cvss && cvssTime && <span style={{ color: 'red' }}>{`${cvss} (as of: ${cvssTime})`}</span>}
                        </>
                    )
                },
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'publishDate',
                header: t('Publish Date'),
                accessorKey: 'publishDate',
                cell: ({ row }) => {
                    const { publishDate } = row.original
                    return <>{publishDate && <>{publishDate.substring(0, publishDate.lastIndexOf('T'))}</>}</>
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'lastUpdateDate',
                header: t('Last Update'),
                accessorKey: 'lastUpdateDate',
                cell: ({ row }) => {
                    const { lastExternalUpdate } = row.original
                    return (
                        <>
                            {lastExternalUpdate && (
                                <>{lastExternalUpdate.substring(0, lastExternalUpdate.lastIndexOf('T'))}</>
                            )}
                        </>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                enableSorting: false,
                cell: ({ row }) => {
                    const { externalId } = row.original
                    return (
                        <>
                            {externalId && (
                                <span className='d-flex justify-content-evenly'>
                                    <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                        <Link
                                            href={`/vulnerabilities/edit/${externalId}`}
                                            style={{ color: 'gray', fontSize: '14px' }}
                                        >
                                            <FaPencilAlt className='btn-icon' />
                                        </Link>
                                    </OverlayTrigger>

                                    <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                        <span className='d-inline-block'>
                                            <MdDeleteOutline
                                                className='btn-icon'
                                                size={25}
                                                onClick={() => onDeleteClick(externalId)}
                                            />
                                        </span>
                                    </OverlayTrigger>
                                </span>
                            )}
                        </>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
        ],
        [t],
    )

    const [vulnerabilityData, setVulnerabilityData] = useState<Vulnerability[]>(() => [])
    const memoizedData = useMemo(() => vulnerabilityData, [vulnerabilityData])
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = vulnerabilityData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()

                const searchParams = Object.fromEntries(params.entries())
                const queryUrl = CommonUtils.createUrlWithParams(
                    `vulnerabilities`,
                    Object.fromEntries(
                        Object.entries({ ...searchParams, ...pageableQueryParam }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status !== HttpStatus.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedVulnerabilities
                setPaginationMeta(data.page)
                setNumVulnerabilities(data.page?.totalElements ?? 0)
                setVulnerabilityData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:vulnerabilityApiDTOes'])
                        ? []
                        : data['_embedded']['sw360:vulnerabilityApiDTOes'],
                )
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
    }, [pageableQueryParam, params.toString(), session])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // table state config
        state: {
            columnVisibility: {
                actions: !(session?.user?.userGroup === UserGroupType.SECURITY_USER),
            },
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
            sorting: [
                {
                    id: pageableQueryParam.sort.split(',')[0],
                    desc: pageableQueryParam.sort.split(',')[1] === 'desc',
                },
            ],
        },

        // server side sorting config
        manualSorting: true,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: (updater) => {
            setPageableQueryParam((prev) => {
                const prevSorting: SortingState = [
                    {
                        id: prev.sort.split(',')[0],
                        desc: prev.sort.split(',')[1] === 'desc',
                    },
                ]

                const nextSorting = typeof updater === 'function' ? updater(prevSorting) : updater

                if (nextSorting.length > 0) {
                    const { id, desc } = nextSorting[0]
                    return {
                        ...prev,
                        sort: `${id},${desc ? 'desc' : 'asc'}`,
                    }
                }

                return {
                    ...prev,
                    sort: '',
                }
            })
        },

        // server side pagination config
        manualPagination: true,
        pageCount: paginationMeta?.totalPages ?? 1,
        onPaginationChange: (updater) => {
            const next =
                typeof updater === 'function'
                    ? updater({
                          pageIndex: pageableQueryParam.page,
                          pageSize: pageableQueryParam.page_entries,
                      })
                    : updater

            setPageableQueryParam((prev) => ({
                ...prev,
                page: next.pageIndex + 1,
                page_entries: next.pageSize,
            }))
        },
    })

    return (
        <>
            <DeleteVulnerabilityModal
                vulnerabilityId={vulnerabilityToBeDeleted}
                setVulnerability={setVulnerabilityToBeDeleted}
                reloadKey={reloadKey}
                setReloadKey={setReloadKey}
                isEditPage={false}
            />
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2 sidebar'>
                        <QuickFilter id='vunerabilities.quickSearch' />
                        <br />
                        <AdvancedSearch
                            title='Advanced Filter'
                            fields={advancedSearch}
                        />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between ms-1'>
                            <div className='col-lg-5'>
                                <div className='row'>
                                    <button
                                        className='btn btn-primary col-auto'
                                        onClick={handleAddVulnerability}
                                        disabled={
                                            status === 'authenticated' &&
                                            session?.user?.userGroup === UserGroupType.SECURITY_USER
                                        }
                                    >
                                        {t('Add Vulnerability')}
                                    </button>
                                </div>
                            </div>
                            <div className='col-auto buttonheader-title'>
                                {`${t('VULNERABILITIES')} (${numVulnerabilities ?? 0})`}
                            </div>
                        </div>
                        <div className='row my-3'>
                            {pageableQueryParam && table && paginationMeta ? (
                                <>
                                    <PageSizeSelector
                                        pageableQueryParam={pageableQueryParam}
                                        setPageableQueryParam={setPageableQueryParam}
                                    />
                                    <SW360Table
                                        table={table}
                                        showProcessing={showProcessing}
                                    />
                                    <TableFooter
                                        pageableQueryParam={pageableQueryParam}
                                        setPageableQueryParam={setPageableQueryParam}
                                        paginationMeta={paginationMeta}
                                    />
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

export default Vulnerabilities
