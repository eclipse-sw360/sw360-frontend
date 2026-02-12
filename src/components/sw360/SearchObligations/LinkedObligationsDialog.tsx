// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PaddedCell, SW360Table, TableSearch } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { BsCheck2Square } from 'react-icons/bs'
import { Embedded, ErrorDetails, LicensePayload, NestedRows, Obligation } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'
import styles from './CssButton.module.css'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    licensePayload: LicensePayload
    setLicensePayload: React.Dispatch<React.SetStateAction<LicensePayload>>
}

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

type EmbeddedObligations = Embedded<Obligation, 'sw360:obligations'>

const LinkedObligationsDialog = ({ show, setShow, licensePayload, setLicensePayload }: Props): JSX.Element => {
    const t = useTranslations('default')
    const session = useSession()
    const [search, setSearch] = useState<{
        search: string
    }>({
        search: '',
    })

    const searchFunction = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.currentTarget.value === '') {
            setSearch({
                search: '',
            })
        } else {
            setSearch({
                search: event.currentTarget.value,
            })
        }
    }
    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])
    const [obligations, setObligations] = useState<Obligation[]>([])
    const [checkAll, setCheckAll] = useState(false)
    const handleCloseDialog = () => {
        setShow(!show)
        setObligations([])
    }

    const handleClickSelectObligations = () => {
        setLicensePayload({
            ...licensePayload,
            obligations,
            obligationDatabaseIds: obligations.map((ob) => ob._links?.self.href.split('/').at(-1) ?? ''),
        })
        setShow(!show)
        setObligations([])
    }

    const handleClickObligation = (obligation: Obligation) => {
        const obs = [
            ...obligations,
        ]
        const id = obligation._links?.self.href.split('/').at(-1)
        const index = obs.findIndex((ob) => ob._links?.self.href.split('/').at(-1) === id)
        if (index === -1) {
            obs.push(obligation)
        } else {
            obs.splice(index, 1)
        }
        setObligations(obs)
    }

    const handleCheckAll = () => {
        setCheckAll(!checkAll)
    }

    useEffect(() => {
        if (checkAll) {
            setObligations(memoizedData.map((memob) => memob.node))
        } else {
            setObligations([])
        }
    }, [
        checkAll,
    ])

    const columns = useMemo<ColumnDef<NestedRows<Obligation>>[]>(
        () => [
            {
                id: 'expand',
                cell: ({ row }) => {
                    if (row.depth > 0) {
                        return <p>{row.original.node?.text ?? ''}</p>
                    } else {
                        return <PaddedCell row={row}></PaddedCell>
                    }
                },
                meta: {
                    width: '3%',
                },
            },
            {
                id: 'id',
                header: () => (
                    <input
                        className='checkbox-control'
                        type='checkbox'
                        checked={checkAll}
                        onChange={handleCheckAll}
                    ></input>
                ),
                cell: ({ row }) => (
                    <input
                        className='checkbox-control'
                        type='checkbox'
                        checked={
                            obligations.findIndex(
                                (ob) =>
                                    ob._links?.self.href.split('/').at(-1) ===
                                    row.original.node._links?.self.href.split('/').at(-1),
                            ) !== -1
                        }
                        onChange={() => handleClickObligation(row.original.node)}
                    ></input>
                ),
            },
            {
                id: 'title',
                header: t('Obligation Title'),
                cell: ({ row }) => <>{row.original.node?.title ?? ''}</>,
            },
            {
                id: 'type',
                header: t('Obligation Type'),
                cell: ({ row }) => <>{Capitalize(row.original.node?.obligationType ?? '')}</>,
            },
        ],
        [
            t,
            obligations,
        ],
    )

    const [obligationData, setObligationData] = useState<NestedRows<Obligation>[]>(() => [])
    const memoizedData = useMemo(
        () => obligationData,
        [
            obligationData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = obligationData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `obligations`,
                    Object.fromEntries(
                        Object.entries({
                            ...search,
                            obligationLevel: 'LICENSE_OBLIGATION',
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

                const data = (await response.json()) as EmbeddedObligations
                setObligationData(
                    data['_embedded']['sw360:obligations']
                        ? data['_embedded']['sw360:obligations'].map(
                              (ob) =>
                                  ({
                                      node: ob,
                                      children: [
                                          {
                                              node: ob,
                                          },
                                      ],
                                  }) as NestedRows<Obligation>,
                          )
                        : [],
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
        search,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),

        // expand config
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => {
            if (row.depth === 1) {
                row.meta = {
                    isFullSpanRow: true,
                }
            }
            return row.depth === 0
        },
    })

    table.getRowModel().rows.forEach((row) => {
        if (row.depth === 1) {
            row.meta = {
                isFullSpanRow: true,
            }
        }
    })

    return (
        <Modal
            show={show}
            onClose={handleCloseDialog}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header
                style={{
                    backgroundColor: '#eef2fa',
                    color: '#2e5aac',
                }}
            >
                <h5>
                    <Modal.Title
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                        }}
                    >
                        <BsCheck2Square size={20} />
                        &nbsp;
                        {t('Select License Obligations to be added')}
                    </Modal.Title>
                </h5>
            </Modal.Header>
            <Modal.Body>
                <div className='mb-3'>
                    {table ? (
                        <>
                            <div className='d-flex justify-content-end'>
                                <TableSearch searchFunction={searchFunction} />
                            </div>
                            <SW360Table
                                table={table}
                                showProcessing={showProcessing}
                            />
                        </>
                    ) : (
                        <div className='col-12 mt-1 text-center'>
                            <Spinner className='spinner' />
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    className='btn btn-light'
                    onClick={handleCloseDialog}
                >
                    {t('Cancel')}
                </Button>
                <Button
                    className={`${styles['btn-info']}`}
                    type='button'
                    onClick={handleClickSelectObligations}
                >
                    {t('Add')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default LinkedObligationsDialog
