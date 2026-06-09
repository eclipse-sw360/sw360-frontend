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
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { Embedded, ErrorDetails } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils/index'
import { ObligationElement } from '../../../../../object-types/Obligation'

type EmbeddedObligationElements = Embedded<ObligationElement, 'sw360:obligationElements'>

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    onImport: (element: ObligationElement) => void
}

function ImportElementDialog({ show, setShow, onImport }: Props): ReactNode {
    const t = useTranslations('default')
    const [selectedElement, setSelectedElement] = useState<ObligationElement | undefined>()
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<ObligationElement>[]>(
        () => [
            {
                id: 'selecObliationElement',
                cell: ({ row }) => {
                    return (
                        <div className='form-check'>
                            <input
                                className='form-check-input'
                                type='radio'
                                checked={
                                    !CommonUtils.isNullOrUndefined(selectedElement) &&
                                    row.original.id === selectedElement.id
                                }
                                onChange={() => setSelectedElement(row.original)}
                            />
                        </div>
                    )
                },
                meta: {
                    width: '5%',
                },
            },
            {
                id: 'type',
                accessorKey: 'type',
                header: t('Type'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'langElement',
                accessorKey: 'langElement',
                header: t('Language Element'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'action',
                accessorKey: 'action',
                header: t('Action'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'object',
                accessorKey: 'object',
                header: t('Object'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '30%',
                },
            },
        ],
        [
            t,
            selectedElement,
        ],
    )

    const [elementData, setElementData] = useState<ObligationElement[]>(() => [])
    const memoizedData = useMemo(
        () => elementData,
        [
            elementData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = memoizedData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET('obligations/elements', session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedObligationElements
                setElementData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:obligationElements'])
                        ? []
                        : data['_embedded']['sw360:obligationElements'],
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
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),

        meta: {
            rowHeightConstant: true,
        },
    })

    const handleClose = () => {
        setSelectedElement(undefined)
        setShow(false)
    }

    const handleImport = () => {
        if (!CommonUtils.isNullOrUndefined(selectedElement)) onImport(selectedElement)
        handleClose()
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>{t('Import Obligation Element')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant='secondary'
                    onClick={handleClose}
                >
                    {t('Close')}
                </Button>
                <Button
                    variant='warning'
                    onClick={handleImport}
                    disabled={CommonUtils.isNullOrUndefined(selectedElement)}
                >
                    {t('Import Obligation Element')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ImportElementDialog
