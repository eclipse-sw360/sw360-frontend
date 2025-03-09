// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { OAuthClient } from '@/object-types'
import { useTranslations } from 'next-intl'
import React, { useMemo, useState, type JSX } from 'react';
import { Button, Form } from 'react-bootstrap'
import { FaCaretDown, FaCaretRight, FaPencilAlt, FaTrashAlt } from 'react-icons/fa'

interface TableData {
    description: string
    clientId: string
    authorities: string
    scope: string
    actions: JSX.Element
    details: string
}

interface Props {
    clients: OAuthClient[]
    updateClient: (client: OAuthClient) => void
    deleteClient: (client: OAuthClient) => void
}

export default function OAuthClientTable({ clients, updateClient, deleteClient }: Props): JSX.Element {
    const t = useTranslations('default')

    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [allRowsExpanded, setAllRowsExpanded] = useState(false)
    const [sortConfig, setSortConfig] = useState<{
        key: keyof (typeof tableData)[0] | null
        direction: 'ascending' | 'descending' | null
    }>({ key: null, direction: null })
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const toggleRow = (clientId: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [clientId]: !prev[clientId],
        }))
    }

    const toggleAllRows = () => {
        const newState = !allRowsExpanded
        setAllRowsExpanded(newState)
        setExpandedRows(
            clients.reduce(
                (acc, client) => ({
                    ...acc,
                    [client.client_id]: newState,
                }),
                {},
            ),
        )
    }

    const sortTableData = (
        data: typeof tableData,
        key: keyof (typeof tableData)[0],
        direction: 'ascending' | 'descending',
    ) => {
        return [...data].sort((a, b) => {
            if (a[key] === b[key]) return 0
            if (direction === 'ascending') {
                return a[key] > b[key] ? 1 : -1
            } else {
                return a[key] < b[key] ? 1 : -1
            }
        })
    }

    const handleSort = (key: keyof (typeof tableData)[0]) => {
        let direction: 'ascending' | 'descending' = 'ascending'
        if (sortConfig.key === key) {
            direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
        }
        setSortConfig({ key, direction })
    }

    const totalItems = clients.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const showingFrom = Math.max(indexOfFirstItem + 1, 1)
    const showingTo = totalItems > 0 ? Math.min(indexOfLastItem, totalItems) : 0

    const formatTime = (seconds: number): string => {
        const days = Math.floor(seconds / (3600 * 24))
        const hours = Math.floor((seconds % (3600 * 24)) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        const parts: string[] = []

        if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`)
        if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
        if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
        if (secs > 0) parts.push(`${secs} second${secs > 1 ? 's' : ''}`)

        return parts.join(', ')
    }

    const tableData: TableData[] = useMemo(() => {
        let sortedData = [...clients].map((client) => ({
            description: client.description,
            clientId: client.client_id,
            authorities: client.authorities.join(', '),
            scope: client.scope.join(', '),
            actions: (
                <span className='d-flex justify-content-evenly'>
                    <span className='d-inline-block'>
                        <FaPencilAlt
                            className='btn-icon overlay-trigger text-muted cursor-pointer'
                            onClick={() => updateClient(client)}
                            size={15}
                        />
                    </span>
                    <span className='d-inline-block'>
                        <FaTrashAlt
                            className='btn-icon overlay-trigger text-muted cursor-pointer'
                            onClick={() => deleteClient(client)}
                            size={15}
                        />
                    </span>
                </span>
            ),
            details: `
                <div class="details-row">
                    <p>Client Secret: ${client.client_secret}</p>
                    <p>Access Token Validity: ${formatTime(client.access_token_validity)} (${client.access_token_validity} seconds)</p>
                    <p>Refresh Token Validity: ${formatTime(client.refresh_token_validity)} (${client.refresh_token_validity} seconds)</p>
                </div>
            `,
        }))

        if (sortConfig.key !== null) {
            sortedData = sortTableData(sortedData, sortConfig.key, sortConfig.direction || 'ascending')
        }

        return sortedData.slice(indexOfFirstItem, indexOfLastItem)
    }, [clients, sortConfig, currentPage, itemsPerPage, indexOfFirstItem, indexOfLastItem])

    return (
        <div className='table-container'>
            <div className='table-controls mb-3 d-flex justify-content-between align-items-center'>
                <div className='entries-select'>
                    <label className='me-2 d-flex align-items-center'>
                        Show{' '}
                        <Form.Select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value))
                                setCurrentPage(1)
                            }}
                            className='ms-2'
                            size='sm'
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </Form.Select>{' '}
                        entries
                    </label>
                </div>
            </div>
            <table className='table oauth-client-table table-sm'>
                <thead>
                    <tr>
                        <th className='text-center align-middle'>
                            <button
                                onClick={toggleAllRows}
                                className='btn p-1'
                                aria-label='Toggle all rows'
                            >
                                {allRowsExpanded ? (
                                    <FaCaretDown
                                        className='text-white'
                                        size={15}
                                    />
                                ) : (
                                    <FaCaretRight
                                        className='text-white'
                                        size={15}
                                    />
                                )}
                            </button>
                        </th>
                        <th
                            style={{ width: '30%' }}
                            onClick={() => handleSort('description')}
                            className='text-start align-middle'
                        >
                            <span className='d-flex justify-content-between align-items-center w-100'>
                                <span className='sort-content'>{t('Description')}</span>
                                <span className='sort-indicator'>
                                    <span
                                        className={
                                            sortConfig.key === 'description' && sortConfig.direction === 'ascending'
                                                ? 'active-sort text-white'
                                                : 'inactive-sort text-white'
                                        }
                                    >
                                        ↑
                                    </span>
                                    <span
                                        className={
                                            sortConfig.key === 'description' && sortConfig.direction === 'descending'
                                                ? 'active-sort text-white'
                                                : 'inactive-sort text-white'
                                        }
                                    >
                                        ↓
                                    </span>
                                </span>
                            </span>
                        </th>
                        <th
                            style={{ width: '25%' }}
                            onClick={() => handleSort('clientId')}
                            className='text-start align-middle'
                        >
                            <span className='d-flex justify-content-between align-items-center w-100'>
                                <span className='sort-content'>Client ID</span>
                                <span className='sort-indicator'>
                                    <span
                                        className={
                                            sortConfig.key === 'clientId' && sortConfig.direction === 'ascending'
                                                ? 'active-sort text-white'
                                                : 'inactive-sort text-white'
                                        }
                                    >
                                        ↑
                                    </span>
                                    <span
                                        className={
                                            sortConfig.key === 'clientId' && sortConfig.direction === 'descending'
                                                ? 'active-sort text-white'
                                                : 'inactive-sort text-white'
                                        }
                                    >
                                        ↓
                                    </span>
                                </span>
                            </span>
                        </th>
                        <th
                            style={{ width: '15%' }}
                            onClick={() => handleSort('authorities')}
                            className='text-start align-middle'
                        >
                            <span className='d-flex justify-content-between align-items-center w-100'>
                                <span className='sort-content'>{t('Authorities')}</span>
                                <span className='sort-indicator'>
                                    <span
                                        className={
                                            sortConfig.key === 'authorities' && sortConfig.direction === 'ascending'
                                                ? 'active-sort text-white'
                                                : 'inactive-sort text-white'
                                        }
                                    >
                                        ↑
                                    </span>
                                    <span
                                        className={
                                            sortConfig.key === 'authorities' && sortConfig.direction === 'descending'
                                                ? 'active-sort text-white'
                                                : 'inactive-sort text-white'
                                        }
                                    >
                                        ↓
                                    </span>
                                </span>
                            </span>
                        </th>
                        <th
                            style={{ width: '15%' }}
                            onClick={() => handleSort('scope')}
                            className='text-start align-middle'
                        >
                            <span className='d-flex justify-content-between align-items-center w-100'>
                                <span className='sort-content'>{t('Scope')}</span>
                                <span className='sort-indicator'>
                                    <span
                                        className={
                                            sortConfig.key === 'scope' && sortConfig.direction === 'ascending'
                                                ? 'active-sort text-white'
                                                : 'inactive-sort text-white'
                                        }
                                    >
                                        ↑
                                    </span>
                                    <span
                                        className={
                                            sortConfig.key === 'scope' && sortConfig.direction === 'descending'
                                                ? 'active-sort text-white'
                                                : 'inactive-sort text-white'
                                        }
                                    >
                                        ↓
                                    </span>
                                </span>
                            </span>
                        </th>
                        <th
                            style={{ width: '10%' }}
                            className='align-middle'
                        >
                            {t('Actions')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {clients.length === 0 ? (
                        <tr>
                            <td
                                colSpan={6}
                                className='text-center'
                            >
                                No matching records found
                            </td>
                        </tr>
                    ) : (
                        tableData.map((row, index) => (
                            <React.Fragment key={index}>
                                <tr>
                                    <td className='text-center align-middle'>
                                        <button
                                            onClick={() => toggleRow(row.clientId)}
                                            className='btn p-1'
                                            aria-label={`Toggle row for ${row.description}`}
                                        >
                                            {expandedRows[row.clientId] ? (
                                                <FaCaretDown
                                                    className='text-muted'
                                                    size={15}
                                                />
                                            ) : (
                                                <FaCaretRight
                                                    className='text-muted'
                                                    size={15}
                                                />
                                            )}
                                        </button>
                                    </td>
                                    <td className='align-middle'>{row.description}</td>
                                    <td className='align-middle'>{row.clientId}</td>
                                    <td className='align-middle'>{row.authorities}</td>
                                    <td className='align-middle'>{row.scope}</td>
                                    <td className='align-middle'>{row.actions}</td>
                                </tr>
                                {expandedRows[row.clientId] && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            dangerouslySetInnerHTML={{ __html: row.details }}
                                        />
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </tbody>
            </table>

            <div className='pagination-controls d-flex justify-content-between align-items-center mt-3'>
                <span className='text-muted'>
                    Showing {showingFrom} to {showingTo} of {totalItems} entries
                </span>
                <div className='d-flex align-items-center gap-2'>
                    <Button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        variant='secondary'
                        size='sm'
                    >
                        Previous
                    </Button>
                    <span>{currentPage}</span>
                    <Button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant='secondary'
                        size='sm'
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}