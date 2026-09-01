// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    ColumnDef,
    ExpandedState,
    getCoreRowModel,
    getExpandedRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'

import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, PaddedCell, PageButtonHeader, SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { BsFillTrashFill, BsPencil } from 'react-icons/bs'
import { OAuthClient } from '@/object-types'
import MessageService from '@/services/message.service'
import { getAuthenticatedAccessToken } from '@/utils/api/authenticatedApi.util'
import { SW360_API_URL } from '@/utils/env'
import { dispatchSessionExpiredEvent } from '@/utils/sessionExpiry.utils'
import AddClientDialog from './AddClientDialog'
import DeleteClientDialog from './DeleteClientDialog'

function OAuthClientsList(): ReactNode {
    const t = useTranslations('default')
    const [numberClient, setNumberClient] = useState(0)
    const [openAddClientDialog, setOpenAddClientDialog] = useState(false)
    const [openDeleteClientDialog, setOpenDeleteClientDialog] = useState(false)
    const [selectedClient, setSelectedClient] = useState<OAuthClient | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [clients, setClients] = useState<OAuthClient[]>([])
    const [loading, setLoading] = useState(true)

    const addClient = () => {
        setSelectedClient(null)
        setOpenAddClientDialog(true)
    }

    const updateClient = (client: OAuthClient) => {
        setSelectedClient(client)
        setOpenAddClientDialog(true)
    }

    const deleteClient = (client: OAuthClient) => {
        setSelectedClient(client)
        setOpenDeleteClientDialog(true)
    }

    const handleDialogClose = () => {
        setOpenDeleteClientDialog(false)
        setOpenAddClientDialog(false)
        setRefreshTrigger((prev) => prev + 1)
    }

    const [expandedRows, setExpandedRows] = useState<ExpandedState>({})

    const columns = useMemo<
        ColumnDef<{
            client: OAuthClient
            isDetails?: boolean
            children?: {
                client: OAuthClient
                isDetails?: boolean
            }[]
        }>[]
    >(
        () => [
            {
                id: 'expand',
                header: '',
                cell: ({ row }) => {
                    if (row.depth > 0) {
                        const client = row.original.client
                        const formatValidity = (seconds: number): string => {
                            const days = Math.floor(seconds / 86400)
                            return `${days} day${days === 1 ? '' : 's'} (${seconds} seconds)`
                        }

                        return (
                            <div className='px-3 py-2'>
                                <p className='mb-1'>{t('Client Secret')}: &lt;hidden&gt;</p>
                                <p className='mb-1'>
                                    {t('Access Token Validity')}: {formatValidity(client.access_token_validity)}
                                </p>
                                <p className='mb-0'>
                                    {t('Refresh Token Validity')}: {formatValidity(client.refresh_token_validity)}
                                </p>
                            </div>
                        )
                    }

                    return <PaddedCell row={row} />
                },
                meta: {
                    width: '4%',
                },
            },
            {
                id: 'description',
                header: t('Description'),
                cell: ({ row }) => row.original.client.description || '',
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'clientId',
                header: 'Client ID',
                cell: ({ row }) => row.original.client.client_id,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'authorities',
                header: t('Authorities'),
                cell: ({ row }) => row.original.client.authorities.join(', ') || '',
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'scope',
                header: t('Scope'),
                cell: ({ row }) => row.original.client.scope.join(', ') || '',
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => (
                    <div className='d-flex justify-content-evenly'>
                        <span className='d-inline-block'>
                            <BsPencil
                                className='btn-icon overlay-trigger text-muted cursor-pointer'
                                onClick={() => updateClient(row.original.client)}
                                size={20}
                            />
                        </span>
                        <span className='d-inline-block'>
                            <BsFillTrashFill
                                className='btn-icon overlay-trigger text-muted cursor-pointer'
                                onClick={() => deleteClient(row.original.client)}
                                size={20}
                            />
                        </span>
                    </div>
                ),
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            deleteClient,
            t,
            updateClient,
        ],
    )

    const tableRows = useMemo(
        () =>
            clients.map((client) => ({
                client,
                children: [
                    {
                        client,
                        isDetails: true,
                    },
                ],
            })),
        [
            clients,
        ],
    )

    const table = useReactTable({
        data: tableRows,
        columns,
        state: {
            expanded: expandedRows,
        },
        onExpandedChange: setExpandedRows,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => row.depth === 0,
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize: 10,
            },
        },
    })

    table.getRowModel().rows.forEach((row) => {
        if (row.depth === 1) {
            row.meta = {
                isFullSpanRow: true,
            }
        }
    })

    const headerButtons = {
        'Add Client': {
            link: '/admin/oauthclient',
            type: 'primary',
            name: 'Add Client',
            onClick: addClient,
        },
    }

    const sendOAuthClientRequest = async (token: string): Promise<Response> => {
        return await fetch(`${SW360_API_URL}/authorization/client-management`, {
            method: 'GET',
            headers: {
                Accept: 'application/*',
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
    }

    const fetchClientsData = async () => {
        setLoading(true)
        try {
            const response = await sendOAuthClientRequest(await getAuthenticatedAccessToken())

            if (response.status === StatusCodes.OK) {
                const data = (await response.json()) as OAuthClient[]
                setClients(data)
                setNumberClient(data.length)
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                dispatchSessionExpiredEvent()
            } else {
                MessageService.error(t('Error while processing'))
            }
        } catch (err) {
            console.error('Error fetching clients:', err)
            MessageService.error(t('Error while processing'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClientsData()
    }, [
        refreshTrigger,
    ])

    return (
        <div className='container page-content'>
            <AddClientDialog
                show={openAddClientDialog}
                setShow={handleDialogClose}
                client={selectedClient}
            />
            {selectedClient && (
                <DeleteClientDialog
                    show={openDeleteClientDialog}
                    setShow={handleDialogClose}
                    clientId={selectedClient.client_id}
                />
            )}
            <div className='row'>
                <div className='col col-12'>
                    <div className='col'>
                        <div className='row'>
                            <PageButtonHeader
                                buttons={headerButtons}
                                title={`${t('OAuth Client')} (${numberClient})`}
                            />

                            <div className='row mt-3'>
                                <div className='table-container'>
                                    <ClientSidePageSizeSelector table={table} />
                                    <SW360Table
                                        table={table}
                                        showProcessing={loading}
                                    />
                                    <ClientSideTableFooter table={table} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default OAuthClientsList
