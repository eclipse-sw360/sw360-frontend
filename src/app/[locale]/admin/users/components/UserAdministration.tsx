// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, ErrorDetails, HttpStatus, PageableQueryParam, PaginationMeta, User } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AdvancedSearch, PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState, type JSX } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'
import { TfiFiles } from 'react-icons/tfi'

type EmbeddedUsers = Embedded<User, 'sw360:users'>

const EditSecondaryDepartmentAndRolesModal = dynamic(() => import('./EditSecondaryDepartmentsAndRolesModal'), {
    ssr: false,
})

export default function UserAdminstration(): JSX.Element {
    const t = useTranslations('default')
    const [num, setNum] = useState<number>(0)
    const router = useRouter()
    const [editingUserId, setEditingUserId] = useState<string | undefined>(undefined)
    const [departments, setDepartments] = useState<Array<string | undefined>>([])
    const [openEditSecondaryDepartmentAndRolesModal, setOpenEditSecondaryDepartmentAndRolesModal] =
        useState<boolean>(false)
    const params = useSearchParams()
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [session])

    const handleAddUsers = () => {
        router.push('/admin/users/add')
    }

    const downloadUsers = () => {
        getSession()
            .then((session) => {
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                void DownloadService.download('importExport/downloadUsers', session, 'users.csv', {
                    Accept: 'text/plain',
                })
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            })
    }

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = await response.json()
            return data
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Unauthorized request'))
            return
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        void fetchData('users/departments')
            .then((departments: Array<string> | undefined) => {
                if (departments === undefined) {
                    return
                }
                if (!CommonUtils.isNullOrUndefined(departments)) {
                    setDepartments(departments)
                }
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            })
    }, [])

    const handleEditSecondaryDepartmentAndRoles = (id: string) => {
        setEditingUserId(id)
        setOpenEditSecondaryDepartmentAndRolesModal(true)
    }

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                id: 'givenName',
                header: t('Given Name'),
                accessorKey: 'givenName',
                enableSorting: false,
                cell: (info) => info.getValue(),
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'lastname',
                header: t('Last Name'),
                accessorKey: 'lastName',
                enableSorting: true,
                cell: (info) => info.getValue(),
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'email',
                accessorKey: 'email',
                header: t('Email'),
                enableSorting: true,
                cell: ({ row }) => {
                    return (
                        <Link
                            className='text-link'
                            href={`/admin/users/details/${CommonUtils.getIdFromUrl(row.original._links?.self.href)}`}
                        >
                            {row.original.email}
                        </Link>
                    )
                },
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'deactivated',
                accessorKey: 'deactivated',
                header: t('Active status'),
                enableSorting: true,
                cell: ({ row }) => {
                    const { deactivated } = row.original
                    return deactivated === undefined || deactivated === false ? t('Active') : t('Inactive')
                },
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'department',
                header: t('Primary Department'),
                accessorKey: 'department',
                enableSorting: true,
                cell: (info) => info.getValue(),
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'primaryRoles',
                header: t('Primary Department Role'),
                accessorKey: 'userGroup',
                enableSorting: true,
                cell: ({ row }) => {
                    const { userGroup } = row.original
                    return <>{userGroup ? t(userGroup) : t('User')}</>
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'secondaryDepartmentsAndRoles',
                header: t('Secondary Departments and Roles'),
                cell: ({ row }) => {
                    const { secondaryDepartmentsAndRoles } = row.original
                    return (
                        <ul className='text-break text-start'>
                            {Object.entries(secondaryDepartmentsAndRoles ?? {}).map(([department, roles], index) => (
                                <li key={index}>
                                    <b>{department}</b> {'->'} {roles.map((role) => t(role as never)).join(', ')}
                                </li>
                            ))}
                        </ul>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    return (
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <Link
                                    href={`/admin/users/edit/${CommonUtils.getIdFromUrl(row.original._links?.self.href)}`}
                                    className='overlay-trigger'
                                >
                                    <FaPencilAlt className='btn-icon' />
                                </Link>
                            </OverlayTrigger>

                            <OverlayTrigger
                                rootClose={true}
                                overlay={<Tooltip>{t('Edit User Secondary Departments And Role')}</Tooltip>}
                            >
                                <span
                                    className='d-inline-block'
                                    onClick={() =>
                                        handleEditSecondaryDepartmentAndRoles(
                                            CommonUtils.getIdFromUrl(row.original._links?.self.href),
                                        )
                                    }
                                >
                                    <TfiFiles className='btn-icon overlay-trigger cursor-pointer' />
                                </span>
                            </OverlayTrigger>
                        </span>
                    )
                },
                meta: {
                    width: '7%',
                },
            },
        ],
        [t],
    )
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
    const [userData, setUserData] = useState<User[]>(() => [])
    const memoizedData = useMemo(() => userData, [userData])
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = userData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const searchParams = Object.fromEntries(params.entries())
                const queryUrl = CommonUtils.createUrlWithParams(
                    `users`,
                    Object.fromEntries(
                        Object.entries({ ...searchParams, ...pageableQueryParam }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== HttpStatus.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedUsers
                setPaginationMeta(data.page)
                setNum(data.page?.totalElements ?? 0)
                setUserData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:users'])
                        ? []
                        : data['_embedded']['sw360:users'],
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

    const advancedSearch = [
        {
            fieldName: t('Given Name'),
            value: '',
            paramName: 'givenname',
        },
        {
            fieldName: t('Last Name'),
            value: '',
            paramName: 'lastname',
        },
        {
            fieldName: t('Email'),
            value: '',
            paramName: 'email',
        },
        {
            fieldName: t('Primary Department'),
            value: departments.map((department) => ({
                key: department ?? '',
                text: department ?? '',
            })),
            paramName: 'department',
        },
        {
            fieldName: t('Primary Department Role'),
            value: [
                {
                    key: 'USER',
                    text: t('User'),
                },
                {
                    key: 'ADMIN',
                    text: t('Admin'),
                },
                {
                    key: 'CLEARING_ADMIN',
                    text: t('CLEARING_ADMIN'),
                },
                {
                    key: 'CLEARING_EXPERT',
                    text: t('CLEARING_EXPERT'),
                },
                {
                    key: 'ECC_ADMIN',
                    text: t('ECC_ADMIN'),
                },
                {
                    key: 'SECURITY_ADMIN',
                    text: t('SECURITY_ADMIN'),
                },
                {
                    key: 'SW360_ADMIN',
                    text: t('SW360_ADMIN'),
                },
                {
                    key: 'SECURITY_USER',
                    text: t('SECURITY_USER'),
                },
                {
                    key: 'VIEWER',
                    text: t('VIEWER'),
                },
            ],
            paramName: 'usergroup',
        },
    ]

    return (
        <>
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <AdvancedSearch
                            title='Advanced Search'
                            fields={advancedSearch}
                        />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between ms-1'>
                            <div className='col-auto px-0'>
                                <button
                                    className='btn btn-primary me-2'
                                    onClick={handleAddUsers}
                                >
                                    {t('Add User')}
                                </button>
                                <button
                                    className='btn btn-primary'
                                    onClick={downloadUsers}
                                >
                                    {t('Download Users')}
                                </button>
                            </div>
                            <div className='col-auto buttonheader-title'>{`${t('Users')} (${num})`}</div>
                        </div>
                        <h5 className='mt-3 mb-1 ms-1 header-underlined'>{t('Users')}</h5>
                        <div className='mb-3'>
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
            {editingUserId !== undefined && (
                <EditSecondaryDepartmentAndRolesModal
                    show={openEditSecondaryDepartmentAndRolesModal}
                    setShow={setOpenEditSecondaryDepartmentAndRolesModal}
                    editingUserId={editingUserId}
                />
            )}
        </>
    )
}
