// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AdvancedSearch, PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsFillTrashFill, BsPencil } from 'react-icons/bs'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { Embedded, ErrorDetails, Package, PageableQueryParam, PaginationMeta, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import DeletePackageModal from './DeletePackageModal'
import { packageManagers } from './PackageManagers'

type EmbeddedPackages = Embedded<Package, 'sw360:packages'>

interface ReleaseCache {
    id: string
    name: string
    version: string
    clearingState: string
}

interface PackageWithRelease extends Package {
    releaseName?: string
    releaseVersion?: string
    releaseClearingState?: string
}

interface DeletePackageModalMetData {
    show: boolean
    packageId: string
    packageName: string
    packageVersion: string
}

function Packages(): ReactNode {
    const { data: session, status } = useSession()
    const t = useTranslations('default')
    const params = useSearchParams()
    const router = useRouter()

    const [deletePackageModalMetaData, setDeletePackageModalMetaData] = useState<DeletePackageModalMetData>({
        show: false,
        packageId: '',
        packageName: '',
        packageVersion: '',
    })

    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: '',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const [packageData, setPackageData] = useState<PackageWithRelease[]>([])
    const memoizedData = useMemo(
        () => packageData,
        [
            packageData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    const releaseCache = useMemo(() => new Map<string, ReleaseCache>(), [])

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const handleCreatePackage = () => {
        router.push('/packages/add')
    }

    const handleEditPackage = (packageId: string) => {
        router.push(`/packages/edit/${packageId}`)
        MessageService.success(t('You are editing the original document'))
    }

    const columns = useMemo<ColumnDef<PackageWithRelease>[]>(
        () => [
            {
                id: 'name',
                header: `${t('Package Name')} (${t('Version')})`,
                accessorKey: 'name',
                cell: ({ row }) => {
                    const { id, name, version } = row.original
                    return (
                        <Link
                            href={`/packages/detail/${id}`}
                            className='text-link'
                        >
                            {name} {version && `(${version})`}
                        </Link>
                    )
                },
            },
            {
                id: 'releaseName',
                header: `${t('Release Name')} (${t('Version')})`,
                accessorKey: 'releaseName',
                enableSorting: false,
                cell: ({ row }) => {
                    const { releaseId, releaseName, releaseVersion } = row.original
                    if (!releaseId) {
                        return <span className='text-muted'>No Linked Release</span>
                    }
                    return (
                        <Link
                            href={`/components/releases/detail/${releaseId}`}
                            className='text-link'
                        >
                            {releaseName} {releaseVersion && `(${releaseVersion})`}
                        </Link>
                    )
                },
            },
            {
                id: 'releaseClearingState',
                header: t('Release Clearing State'),
                accessorKey: 'releaseClearingState',
                enableSorting: false,
                cell: ({ row }) => {
                    const { releaseId, releaseClearingState } = row.original
                    if (!releaseId) {
                        return (
                            <div className='text-center'>
                                <span className='text-muted'>Not Applicable</span>
                            </div>
                        )
                    }

                    return (
                        <div className='text-center'>
                            <OverlayTrigger
                                overlay={
                                    <Tooltip>{`${t('Release Clearing State')}: ${releaseClearingState ?? ''}`}</Tooltip>
                                }
                            >
                                {releaseClearingState === 'NEW_CLEARING' ? (
                                    <span className='badge bg-danger overlay-badge'>{'CS'}</span>
                                ) : releaseClearingState === 'REPORT_AVAILABLE' ? (
                                    <span className='badge bg-primary overlay-badge'>{'CS'}</span>
                                ) : releaseClearingState === 'IN_PROGRESS' ? (
                                    <span className='badge bg-warning overlay-badge'>{'CS'}</span>
                                ) : releaseClearingState === 'SCAN_AVAILABLE' ? (
                                    <span className='badge bg-orange overlay-badge'>{'CS'}</span>
                                ) : (
                                    <span className='badge bg-success overlay-badge'>{'CS'}</span>
                                )}
                            </OverlayTrigger>
                        </div>
                    )
                },
            },
            {
                id: 'licenses',
                header: t('Licenses'),
                accessorKey: 'licenseIds',
                enableSorting: false,
                cell: ({ row }) => {
                    const licenseIds: string[] = row.original.licenseIds ?? []
                    return (
                        <>
                            {licenseIds.map((lic: string, i: number) => (
                                <span key={lic}>
                                    <Link
                                        href={`/licenses/detail?id=${lic}`}
                                        className='text-link'
                                    >
                                        {lic}
                                    </Link>
                                    {i < licenseIds.length - 1 && ', '}
                                </span>
                            ))}
                        </>
                    )
                },
            },
            {
                id: 'packageManager',
                header: t('Package Manager'),
                accessorKey: 'packageManager',
                enableSorting: false,
            },
            {
                id: 'actions',
                header: t('Actions'),
                enableSorting: false,
                cell: ({ row }) => {
                    const { id, name, version } = row.original
                    return (
                        <>
                            {id && (
                                <span className='d-flex justify-content-evenly cursor-pointer'>
                                    <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                        <span
                                            className='d-inline-block'
                                            onClick={() => handleEditPackage(id)}
                                        >
                                            <BsPencil
                                                className='btn-icon'
                                                size={20}
                                            />
                                        </span>
                                    </OverlayTrigger>

                                    <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                        <span className='d-inline-block'>
                                            <BsFillTrashFill
                                                className='btn-icon'
                                                size={20}
                                                onClick={() =>
                                                    setDeletePackageModalMetaData({
                                                        show: true,
                                                        packageId: id ?? '',
                                                        packageName: name ?? '',
                                                        packageVersion: version ?? '',
                                                    })
                                                }
                                            />
                                        </span>
                                    </OverlayTrigger>
                                </span>
                            )}
                        </>
                    )
                },
            },
        ],
        [
            t,
        ],
    )

    useEffect(() => {
        if (status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal
        const timeout = setTimeout(() => setShowProcessing(true), packageData.length !== 0 ? 700 : 0)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session)) return signOut()

                const searchParams = Object.fromEntries(params.entries())
                const queryUrl = CommonUtils.createUrlWithParams(
                    `packages`,
                    Object.fromEntries(
                        Object.entries({
                            ...searchParams,
                            ...pageableQueryParam,
                            allDetails: true,
                        }).map(([k, v]) => [
                            k,
                            String(v),
                        ]),
                    ),
                )

                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedPackages
                setPaginationMeta(
                    data.page ?? {
                        size: 0,
                        totalElements: 0,
                        totalPages: 0,
                        number: 0,
                    },
                )

                const pkgs = CommonUtils.isNullOrUndefined(data['_embedded']['sw360:packages'])
                    ? []
                    : data['_embedded']['sw360:packages']

                // fetch release details with caching
                const pkgsWithRelease = await Promise.all(
                    pkgs.map(async (pkg) => {
                        if (!pkg.releaseId) return pkg
                        if (releaseCache.has(pkg.releaseId)) {
                            const rel = releaseCache.get(pkg.releaseId)
                            if (rel) {
                                return {
                                    ...pkg,
                                    releaseName: rel.name,
                                    releaseClearingState: rel.clearingState,
                                    releaseVersion: rel.version,
                                }
                            }
                        }
                        try {
                            const releaseResp = await ApiUtils.GET(
                                `releases/${pkg.releaseId}`,
                                session.user.access_token,
                                signal,
                            )
                            if (releaseResp.status === StatusCodes.OK) {
                                const release = await releaseResp.json()
                                releaseCache.set(pkg.releaseId, release)
                                return {
                                    ...pkg,
                                    releaseName: release.name,
                                    releaseClearingState: release.clearingState,
                                    releaseVersion: release.version,
                                }
                            }
                        } catch (e) {
                            console.warn('Failed fetching release', pkg.releaseId, e)
                        }
                        return pkg
                    }),
                )

                setPackageData(pkgsWithRelease)
            } catch (error) {
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    MessageService.error(error instanceof Error ? error.message : String(error))
                }
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        pageableQueryParam,
        params.toString(),
        status,
    ])

    useEffect(() => {
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: '',
        })
    }, [
        params.toString(),
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: true,
        manualPagination: true,
        pageCount: paginationMeta?.totalPages ?? 1,
        state: {
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

        meta: {
            rowHeightConstant: true,
        },
    })

    const advancedSearch = [
        {
            fieldName: t('Package Name'),
            value: '',
            paramName: 'name',
        },
        {
            fieldName: t('Package Version'),
            value: '',
            paramName: 'version',
        },
        {
            fieldName: t('Package Manager'),
            value: packageManagers.map((p) => ({
                key: p,
                text: p,
            })),
            paramName: 'packageManager',
        },
        {
            fieldName: t('Licenses'),
            value: '',
            paramName: 'licenses',
        },
        {
            fieldName: t('purl'),
            value: '',
            paramName: 'purl',
        },
        {
            fieldName: `${t('Created By')} (${t('Email')})`,
            value: '',
            paramName: 'createdBy',
        },
        {
            fieldName: t('Created On'),
            value: [
                {
                    key: 'EQUAL',
                    text: '=',
                },
                {
                    key: 'LESS_THAN_OR_EQUAL_TO',
                    text: '<=',
                },
                {
                    key: 'GREATER_THAN_OR_EQUAL_TO',
                    text: '>=',
                },
                {
                    key: 'BETWEEN',
                    text: t('Between'),
                },
            ],
            paramName: 'createdOn',
        },
    ]

    return (
        <>
            <DeletePackageModal
                modalMetaData={deletePackageModalMetaData}
                setModalMetaData={setDeletePackageModalMetaData}
                isEditPage={false}
                onDeleteSuccess={(deletedPackageId) => {
                    setPackageData((prev) => prev.filter((pkg) => pkg.id !== deletedPackageId))
                }}
            />
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-2'>
                        <AdvancedSearch
                            title='Advanced Search'
                            fields={advancedSearch}
                        />
                    </div>
                    <div className='col-10'>
                        <div className='row'>
                            <div className='col d-flex justify-content-between'>
                                <button
                                    className='btn btn-primary col-auto'
                                    onClick={handleCreatePackage}
                                >
                                    {t('Add Package')}
                                </button>
                                <div className='col-auto buttonheader-title'>{t('PACKAGES')}</div>
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

export default AccessControl(Packages, [
    UserGroupType.SECURITY_USER,
])
