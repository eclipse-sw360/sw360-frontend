// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { _, ClientSidePageSizeSelector, ClientSideTableFooter, ShowInfoOnHover, SW360Table } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'
import VerificationTooltip from '@/components/VerificationTooltip/VerificationTooltip'
import { LinkedVulnerability, VulnerabilitiesVerificationState } from '@/object-types'
import ChangeStateDialog from './ChangeStateDialog'
import VulnerabilitiesMatchingStatistics from './VulnerabilityMatchingStatistics'

interface Props {
    vulnerData: Array<LinkedVulnerability>
}

interface SelectedVulnerability {
    releaseId: string
    vulnerExternalId: string
}

const ComponentVulnerabilities = ({ vulnerData }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [state, setState] = useState('NOT_CHECKED')
    const [selectedVulner, setSelectedVulner] = useState<Array<SelectedVulnerability>>([])
    const [checkAll, setCheckAll] = useState<boolean>(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const memoizedData = useMemo(
        () => vulnerData,
        [
            vulnerData,
        ],
    )

    useEffect(() => {
        if (checkAll) {
            setSelectedVulner(
                memoizedData.map((v) => ({
                    releaseId: v.releaseVulnerabilityRelation.releaseId,
                    vulnerExternalId: v.externalId,
                })),
            )
        } else {
            setSelectedVulner([])
        }
    }, [
        checkAll,
        memoizedData,
    ])

    const columns = useMemo<ColumnDef<LinkedVulnerability>[]>(
        () => [
            {
                id: 'selectVulnerabilityCheckbox',
                header: () => (
                    <input
                        className='form-check-input'
                        type='checkbox'
                        checked={checkAll}
                        onChange={() => setCheckAll(!checkAll)}
                    />
                ),
                cell: ({ row }) => (
                    <input
                        className='form-check-input'
                        type='checkbox'
                        checked={
                            selectedVulner.findIndex(
                                (v) =>
                                    v.vulnerExternalId === row.original.externalId &&
                                    v.releaseId === row.original.releaseVulnerabilityRelation.releaseId,
                            ) !== -1
                        }
                        onChange={() => {
                            const index = selectedVulner.findIndex(
                                (v) => v.vulnerExternalId === row.original.externalId,
                            )
                            if (index === -1) {
                                const vuls = [
                                    ...selectedVulner,
                                    {
                                        releaseId: row.original.releaseVulnerabilityRelation.releaseId,
                                        vulnerExternalId: row.original.externalId,
                                    },
                                ]
                                setSelectedVulner(vuls)
                            } else {
                                const vuls = [
                                    ...selectedVulner,
                                ]
                                vuls.splice(index, 1)
                                setSelectedVulner(vuls)
                            }
                        }}
                    />
                ),
                meta: {
                    width: '3%',
                },
            },
            {
                id: 'release',
                header: t('Release'),
                cell: ({ row }) => <div className='text-center'>{row.original.intReleaseName}</div>,
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'externalId',
                header: t('External Id'),
                cell: ({ row }) => (
                    <Link
                        href={`/vulnerabilities/detail/${row.original.externalId}`}
                        className='text-link text-center'
                    >
                        {row.original.externalId}
                    </Link>
                ),
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'priority',
                header: t('Priority'),
                cell: ({ row }) => (
                    <div className='text-center'>
                        {row.original.priority && (
                            <div>
                                <ShowInfoOnHover text={row.original.priorityToolTip} /> {row.original.priority}
                            </div>
                        )}
                    </div>
                ),
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'matchedBy',
                header: t('Matched By'),
                cell: ({ row }) => (
                    <div className='text-center'>{row.original.releaseVulnerabilityRelation?.matchedBy ?? ''}</div>
                ),
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'title',
                header: t('Title'),
                cell: ({ row }) => (
                    <span
                        className='info-text'
                        title={row.original.description}
                    >
                        {row.original.title}
                    </span>
                ),
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'verification',
                header: t('Verification'),
                cell: ({ row }) => {
                    const verificationStateInfos = row.original.releaseVulnerabilityRelation.verificationStateInfo ?? []
                    if (verificationStateInfos.length > 0) {
                        return (
                            <VerificationTooltip verificationStateInfos={verificationStateInfos}>
                                <FaInfoCircle
                                    style={{
                                        marginRight: '5px',
                                        color: 'gray',
                                        width: '15px',
                                        height: '15px',
                                    }}
                                />
                                {verificationStateInfos.at(-1)?.verificationState}
                            </VerificationTooltip>
                        )
                    }
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => <div className='text-center'>{row.original.projectAction}</div>,
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            t,
            selectedVulner,
        ],
    )

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className='row'>
            <div className='col-12'>
                <Alert variant='primary'>
                    {t('Total vulnerabilities')}: <b>{vulnerData.length}</b>
                </Alert>
            </div>
            <div className='col-12'>
                <h5
                    style={{
                        color: '#5D8EA9',
                        borderBottom: '1px solid #5D8EA9',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                    }}
                >
                    {t('Vulnerabilities')}
                </h5>
                <div className='mb-3'>
                    {table ? (
                        <>
                            <ClientSidePageSizeSelector table={table} />
                            <SW360Table
                                table={table}
                                showProcessing={false}
                            />
                            <ClientSideTableFooter table={table} />
                        </>
                    ) : (
                        <div className='col-12 mt-1 text-center'>
                            <Spinner className='spinner' />
                        </div>
                    )}
                </div>
                <Form.Group
                    className='mb-3'
                    controlId='createdOn'
                >
                    <Form.Label>
                        <b>{t('Change verification state of selected vulnerabilities to')}</b>
                    </Form.Label>
                    <Form.Select
                        size='sm'
                        onChange={(event) => setState(event.target.value)}
                        style={{
                            display: 'inline-block',
                            width: '170px',
                            marginLeft: '0.75rem',
                            padding: '8px',
                            marginRight: '0.75rem',
                            fontWeight: '500',
                        }}
                    >
                        {Object.values(VulnerabilitiesVerificationState).map(
                            (item): JSX.Element => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {' '}
                                    {t(item)}{' '}
                                </option>
                            ),
                        )}
                    </Form.Select>
                    <Button onClick={() => setDialogOpen(true)}>{t('Change State')}</Button>
                </Form.Group>
                <VulnerabilitiesMatchingStatistics vulnerData={vulnerData} />
            </div>
            <ChangeStateDialog
                show={dialogOpen}
                setShow={setDialogOpen}
                state={state}
                selectedVulner={selectedVulner}
            />
        </div>
    )
}

export default ComponentVulnerabilities
