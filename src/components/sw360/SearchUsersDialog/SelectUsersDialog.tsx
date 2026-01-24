// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { BsInfoCircle } from 'react-icons/bs'
import { Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, User } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedUsers: (users: { [k: string]: string }) => void
    selectedUsers: {
        [k: string]: string
    }
    multiple: boolean
}

type EmbeddedUsers = Embedded<User, 'sw360:users'>

const SelectUsersDialog = ({
    show,
    setShow,
    setSelectedUsers,
    selectedUsers,
    multiple = false,
}: Props): JSX.Element => {
    const t = useTranslations('default')
    const [selectingUsers, setSelectingUsers] = useState<{
        [k: string]: string
    }>({})
    const [searchText, setSearchText] = useState<string | undefined>(undefined)
    const [exactMatch, setExactMatch] = useState(false)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    useEffect(() => {
        setSelectingUsers(selectedUsers)
    }, [
        selectedUsers,
    ])

    const handleSelectUser = (user: User) => {
        const userEmail = user.email
        const copiedSelectingUsers = {
            ...selectingUsers,
        }
        if (Object.keys(copiedSelectingUsers).includes(userEmail)) {
            delete copiedSelectingUsers[userEmail]
        } else {
            copiedSelectingUsers[userEmail] = user.fullName ?? ''
        }
        setSelectingUsers(copiedSelectingUsers)
    }

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                id: 'selection',
                cell: ({ row }) => (
                    <Form.Check
                        name='user-selection'
                        type={multiple ? 'checkbox' : 'radio'}
                        defaultChecked={Object.keys(selectingUsers).includes(row.original.email)}
                        onClick={() => {
                            handleSelectUser(row.original)
                        }}
                    ></Form.Check>
                ),
            },
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
        ],
        [
            t,
            selectingUsers,
        ],
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
    const memoizedData = useMemo(
        () => userData,
        [
            userData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading' || searchText === undefined) return
        const controller = new AbortController()
        const signal = controller.signal
        handleSearch(signal)
        return () => controller.abort()
    }, [
        pageableQueryParam,
        session,
    ])

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

        meta: {
            rowHeightConstant: true,
        },
    })

    const handleSearch = async (signal?: AbortSignal) => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

            const queryUrl = CommonUtils.createUrlWithParams(
                `users`,
                Object.fromEntries(
                    Object.entries({
                        ...pageableQueryParam,
                        ...(searchText && searchText !== ''
                            ? {
                                  searchText: searchText,
                                  luceneSearch: !exactMatch,
                              }
                            : {}),
                        allDetails: true,
                    }).map(([key, value]) => [
                        key,
                        String(value),
                    ]),
                ),
            )
            const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
            if (response.status !== StatusCodes.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new ApiError(err.message, {
                    status: response.status,
                })
            }

            const data = (await response.json()) as EmbeddedUsers
            setPaginationMeta(data.page)
            setUserData(
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:users']) ? [] : data['_embedded']['sw360:users'],
            )
        } catch (error) {
            ApiUtils.reportError(error)
        } finally {
            setShowProcessing(false)
        }
    }

    const closeModal = () => {
        setShow(false)
        setUserData([])
        setSelectingUsers({})
        setExactMatch(false)
        setPaginationMeta({
            size: 0,
            totalElements: 0,
            totalPages: 0,
            number: 0,
        })
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: '',
        })
        setSearchText(undefined)
    }

    const resetSelection = () => {
        setUserData([])
        setSelectingUsers({})
        setExactMatch(false)
        setPaginationMeta({
            size: 0,
            totalElements: 0,
            totalPages: 0,
            number: 0,
        })
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: '',
        })
        setSearchText(undefined)
    }

    return (
        <Modal
            show={show}
            onHide={closeModal}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>{t('Search Users')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Col>
                        <Row className='mb-3'>
                            <Col xs={6}>
                                <Form.Control
                                    type='text'
                                    placeholder={`${t('Enter Search Text')}...`}
                                    name='searchValue'
                                    onChange={(event) => {
                                        setSearchText(event.target.value)
                                    }}
                                />
                            </Col>
                            <Col xs='auto'>
                                <Form.Group controlId='exact-match-group'>
                                    <Form.Check
                                        inline
                                        name='exact-match'
                                        type='checkbox'
                                        id='exact-match'
                                        onChange={() => setExactMatch(!exactMatch)}
                                    />
                                    <Form.Label
                                        className='pt-2'
                                        value={exactMatch}
                                    >
                                        {t('Exact Match')}{' '}
                                        <sup>
                                            <BsInfoCircle size={20} />
                                        </sup>
                                    </Form.Label>
                                </Form.Group>
                            </Col>
                            <Col xs='auto'>
                                <Button
                                    variant='secondary'
                                    onClick={() => {
                                        if (!searchText) setSearchText('')
                                        handleSearch()
                                    }}
                                >
                                    {t('Search')}
                                </Button>
                            </Col>
                            <Col xs='auto'>
                                <Button
                                    variant='secondary'
                                    onClick={() => resetSelection()}
                                >
                                    {t('Reset')}
                                </Button>
                            </Col>
                        </Row>
                        <Row>
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
                        </Row>
                    </Col>
                </Form>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    data-bs-dismiss='modal'
                    variant='secondary'
                    className='me-2'
                    onClick={closeModal}
                >
                    {t('Close')}
                </Button>
                <Button
                    type='button'
                    className='btn btn-primary'
                    onClick={() => {
                        setSelectedUsers(selectingUsers)
                        closeModal()
                    }}
                >
                    {t('Select User')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default SelectUsersDialog
