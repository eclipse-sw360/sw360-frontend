// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.
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
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SW360Table } from 'next-sw360'
import { type JSX, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap'
import { Embedded, Package, ReleaseDetail } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'

type EmbeddedReleases = Embedded<ReleaseDetail, 'sw360:releases'>
type RowData = (string | SummaryReleaseInfo)[]

interface Props {
    setPackagePayload: React.Dispatch<SetStateAction<Package>>
    show: boolean
    setShow: (show: boolean) => void
    setReleaseNameVersion: React.Dispatch<SetStateAction<string>>
}

interface SummaryReleaseInfo {
    name?: string
    componentId?: string
    releaseVersion?: string
    releaseId?: string
}

export default function AddReleaseModal({
    setPackagePayload,
    show,
    setShow,
    setReleaseNameVersion,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const searchText = useRef<string>('')
    const isExactMatch = useRef<boolean>(false)
    const [loading, setLoading] = useState(false)
    const [variant, setVariant] = useState('success')
    const [message, setMessage] = useState<JSX.Element>()
    const [showMessage, setShowMessage] = useState(false)
    const [releaseData, setReleaseData] = useState<RowData[]>([])
    const [interimReleaseId, setInterimReleaseId] = useState<string>('')
    const [interimReleaseNameVersion, setInterimReleaseNameVersion] = useState<string>('')
    const [sorting, setSorting] = useState<SortingState>([])
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const displayMessage = (variant: string, message: JSX.Element) => {
        setVariant(variant)
        setMessage(message)
        setShowMessage(true)
    }

    const handleSearch = async () => {
        const session = await getSession()
        setShowMessage(false)
        setLoading(true)
        try {
            if (CommonUtils.isNullOrUndefined(session)) {
                displayMessage('danger', <>{t('Session has expired')}</>)
                setLoading(false)
                return signOut()
            }
            const queryUrl = CommonUtils.createUrlWithParams('releases', {
                name: searchText.current,
                luceneSearch: `${!isExactMatch.current}`,
                allDetails: 'true',
            })
            const response = await ApiUtils.GET(queryUrl, session.user.access_token)
            if (response.status === StatusCodes.UNAUTHORIZED) {
                displayMessage('warning', <>{t('Unauthorized request')}</>)
                setLoading(false)
                return signOut()
            }
            if (response.status === StatusCodes.NO_CONTENT) {
                displayMessage('info', <>{t('No matching data found')}</>)
                setLoading(false)
                return
            }

            if (response.status !== StatusCodes.OK) {
                displayMessage('danger', <>{t('Error while processing')}</>)
                return
            }
            const data = (await response.json()) as EmbeddedReleases

            const tableData =
                CommonUtils.isNullOrUndefined(data['_embedded']) &&
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releases'])
                    ? []
                    : data['_embedded']['sw360:releases'].map((release: ReleaseDetail) => [
                          {
                              releaseId: release.id ?? '',
                              name: release.name,
                              releaseVersion: release.version,
                          },
                          release.vendor ? (release.vendor.fullName ?? '') : '',
                          {
                              name: release.name,
                              componentId: release['_links']['sw360:component']['href'].split('/').pop() ?? '',
                          },
                          {
                              releaseVersion: release.version,
                              releaseId: release.id ?? '',
                          },
                          release.clearingState,
                          release.mainlineState ?? 'OPEN',
                      ])
            setReleaseData(tableData)
            setLoading(false)
        } catch (error) {
            ApiUtils.reportError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCheckboxes = (releaseId: string, releaseName: string, releaseVersion: string) => {
        setInterimReleaseId((prevReleaseId) => (prevReleaseId === releaseId ? '' : releaseId))
        setInterimReleaseNameVersion(`${releaseName} (${releaseVersion})`)
    }

    const handleLinkRelease = (interimReleaseId: string, interimReleaseNameVersion: string) => {
        if (!CommonUtils.isNullOrUndefined(interimReleaseId)) {
            setPackagePayload((prevState) => ({
                ...prevState,
                releaseId: prevState.releaseId !== interimReleaseId ? interimReleaseId : prevState.releaseId,
            }))
        }
        if (!CommonUtils.isNullOrUndefined(interimReleaseNameVersion)) {
            setReleaseNameVersion(interimReleaseNameVersion)
        }
    }

    const closeModal = () => {
        setShow(false)
        setReleaseData([])
        setShowMessage(false)
        setInterimReleaseId('')
        setInterimReleaseNameVersion('')
        isExactMatch.current = false
    }

    const columns = useMemo<ColumnDef<RowData>[]>(
        () => [
            {
                id: 'select',
                header: '',
                cell: ({ row }) => {
                    const data = row.original[0] as SummaryReleaseInfo
                    return (
                        <div className='form-check'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                name='releaseId'
                                value={data.releaseId}
                                checked={interimReleaseId.includes(data.releaseId ?? '')}
                                onChange={() =>
                                    handleCheckboxes(data.releaseId ?? '', data.name ?? '', data.releaseVersion ?? '')
                                }
                            />
                        </div>
                    )
                },
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'vendor',
                header: t('Vendor'),
                accessorFn: (row) => row[1] as string,
            },
            {
                id: 'componentName',
                header: t('Component Name'),
                accessorFn: (row) =>
                    (
                        row[2] as {
                            name: string
                        }
                    ).name,
                cell: ({ row }) => {
                    const data = row.original[2] as {
                        name: string
                        componentId: string
                    }
                    return <Link href={`/components/detail/${data.componentId}`}>{data.name}</Link>
                },
            },
            {
                id: 'releaseVersion',
                header: t('Release version'),
                accessorFn: (row) =>
                    (
                        row[3] as {
                            releaseVersion: string
                        }
                    ).releaseVersion,
                cell: ({ row }) => {
                    const data = row.original[3] as {
                        releaseVersion: string
                        releaseId: string
                    }
                    return <Link href={`/components/releases/detail/${data.releaseId}`}>{data.releaseVersion}</Link>
                },
            },
            {
                id: 'clearingState',
                header: t('Clearing State'),
                accessorFn: (row) => row[4] as string,
            },
            {
                id: 'mainlineState',
                header: t('Mainline State'),
                accessorFn: (row) => row[5] as string,
            },
        ],
        [
            t,
            interimReleaseId,
        ],
    )

    const table = useReactTable({
        data: releaseData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        onSortingChange: setSorting,
    })

    return (
        <Modal
            size='lg'
            centered
            show={show}
            onHide={() => {
                closeModal()
            }}
            aria-labelledby={t('Link Releases')}
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title id='linked-projects-modal'>{t('Link Releases')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert
                    variant={variant}
                    onClose={() => setShowMessage(false)}
                    show={showMessage}
                    dismissible
                >
                    {message}
                </Alert>
                <div className='row'>
                    <div className='col-lg-6'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={t('Enter search text')}
                            aria-describedby='Search Users'
                            onChange={(event) => {
                                searchText.current = event.target.value
                            }}
                        />
                    </div>
                    <div className='col-lg-6'>
                        <button
                            type='button'
                            className='btn btn-secondary me-2'
                            onClick={() => void handleSearch()}
                        >
                            {t('Search')}
                        </button>
                    </div>
                </div>
                <div className='mt-3'>
                    <Form.Check
                        id='exact-match'
                        name='exact-match'
                        className='exact-match'
                        type='checkbox'
                        label={t('Exact Match')}
                        defaultChecked={false}
                        onChange={(e) => {
                            isExactMatch.current = e.target.checked
                        }}
                    />
                    {loading === false ? (
                        <SW360Table
                            table={table}
                            showProcessing={false}
                        />
                    ) : (
                        <div
                            className='col-12'
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Spinner className='spinner' />
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant='dark'
                    onClick={() => {
                        closeModal()
                    }}
                >
                    {t('Close')}
                </Button>
                <Button
                    variant='primary'
                    disabled={interimReleaseId.length === 0}
                    onClick={() => {
                        handleLinkRelease(interimReleaseId, interimReleaseNameVersion)
                        setShow(false)
                        setReleaseData([])
                        setInterimReleaseId('')
                        setInterimReleaseNameVersion('')
                        setShowMessage(false)
                        isExactMatch.current = false
                    }}
                >
                    {t('Link Releases')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
