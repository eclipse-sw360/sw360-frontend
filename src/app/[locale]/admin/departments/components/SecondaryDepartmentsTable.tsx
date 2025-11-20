// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'
import { ErrorDetails } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import SecondaryDepartments from './SecondaryDepartments'

const SecondaryDepartmentsTable = (): JSX.Element => {
    const t = useTranslations('default')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<
        ColumnDef<
            [
                string,
                string[],
            ]
        >[]
    >(
        () => [
            {
                id: 'department',
                header: t('Department'),
                cell: ({ row }) => <>{row.original[0]}</>,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'name',
                header: t('Member Emails'),
                cell: ({ row }) => {
                    return (
                        <ol>
                            {row.original[1].map((email) => (
                                <li key={email}>{email}</li>
                            ))}
                        </ol>
                    )
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    return (
                        <div className='d-flex align-items-center justify-content-center'>
                            <Link href={`/admin/departments/edit?name=${row.original[0]}`}>
                                <FaPencilAlt className='btn-icon' />
                            </Link>
                        </div>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            t,
        ],
    )

    const [secondaryDepartments, setSecondaryDepartments] = useState<SecondaryDepartments>(() => ({}))
    const memoizedData = useMemo(
        () => secondaryDepartments,
        [
            secondaryDepartments,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(true)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = Object.entries(secondaryDepartments).length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

                const response = await ApiUtils.GET('departments/members', session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as SecondaryDepartments
                setSecondaryDepartments(data)
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
    ])

    const table = useReactTable({
        data: Object.entries(memoizedData),
        columns,
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),

        meta: {
            rowHeightConstant: true,
        },
    })

    return (
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
    )
}

export default SecondaryDepartmentsTable
