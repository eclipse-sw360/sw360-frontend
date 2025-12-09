// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import type { JSX } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import { SW360Table } from '@/components/sw360'
import LinkPackagesModal from '@/components/sw360/LinkedPackagesModal/LinkPackagesModal'
import { ErrorDetails, LinkedPackage, LinkedPackageData, Release } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

type ReleaseWithLinked = Release & {
    linkedPackages?: {
        packageId?: string
        name?: string
        version?: string
        packageManager?: string
    }[]
}

interface Props {
    releaseId?: string
    setReleasePayload: React.Dispatch<React.SetStateAction<ReleaseWithLinked>>
}

interface GenericPayload {
    id?: string
    name?: string
    packageIds: Record<string, LinkedPackageData>
}

interface DeleteMetaData {
    show: boolean
    packageId: string
    packageName: string
    packageVersion: string
}

export default function EditLinkedPackages({ releaseId, setReleasePayload }: Props): JSX.Element {
    const t = useTranslations('default')

    const [linkedPackageData, setLinkedPackageData] = useState<Map<string, LinkedPackageData>>(new Map())
    const [showLinkPackagesModal, setShowLinkPackagesModal] = useState(false)
    const [deleteMeta, setDeleteMeta] = useState<DeleteMetaData>({
        show: false,
        packageId: '',
        packageName: '',
        packageVersion: '',
    })
    const [showProcessing, setShowProcessing] = useState(false)
    const [payload, setPayload] = useState<GenericPayload>({
        packageIds: {},
    })
    const openLinkPackagesModal = () => {
        setPayload({
            packageIds: Object.fromEntries(linkedPackageData),
        })
        setShowLinkPackagesModal(true)
    }

    const fetchLinkedPackages = useCallback(async () => {
        if (!releaseId) return
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            void signOut()
            return
        }
        setShowProcessing(true)
        try {
            const response = await ApiUtils.GET(`releases/${releaseId}?embed=packages`, session.user.access_token)
            if (response.status === StatusCodes.OK) {
                const data = await response.json()
                const embedded: LinkedPackage[] = data?._embedded?.['sw360:packages'] ?? []
                const updatedMap = new Map<string, LinkedPackageData>()
                embedded.forEach((item) => {
                    updatedMap.set(item.id, {
                        packageId: item.id,
                        name: item.name ?? '',
                        version: item.version ?? '',
                        licenseIds: item.licenseIds ?? [],
                        packageManager: item.packageManager ?? '',
                    })
                })
                setLinkedPackageData(updatedMap)
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                void signOut()
            } else {
                const err = (await response.json()) as ErrorDetails
                MessageService.error(err.message)
            }
        } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
                const msg = error instanceof Error ? error.message : String(error)
                MessageService.error(msg)
            }
        } finally {
            setShowProcessing(false)
        }
    }, [
        releaseId,
    ])

    useEffect(() => {
        fetchLinkedPackages().catch(console.error)
    }, [
        fetchLinkedPackages,
    ])

    useEffect(() => {
        const linkedPackages = Array.from(linkedPackageData.values()).map((pkg) => ({
            packageId: pkg.packageId,
            name: pkg.name,
            version: pkg.version ?? '',
            packageManager: pkg.packageManager ?? '',
        }))
        setReleasePayload((prev) => ({
            ...(prev as ReleaseWithLinked),
            linkedPackages,
        }))
    }, [
        linkedPackageData,
        setReleasePayload,
    ])
    useEffect(() => {
        if (!payload.packageIds) return

        const next = new Map<string, LinkedPackageData>(Object.entries(payload.packageIds))

        setLinkedPackageData(next)
    }, [
        payload,
    ])

    const openDeleteModal = useCallback((pkg: LinkedPackageData) => {
        setDeleteMeta({
            show: true,
            packageId: pkg.packageId,
            packageName: pkg.name,
            packageVersion: pkg.version ?? '',
        })
    }, [])

    const handleConfirmDelete = () => {
        if (!deleteMeta.packageId) return
        setLinkedPackageData((prev) => {
            const next = new Map(prev)
            next.delete(deleteMeta.packageId)
            return next
        })
        setDeleteMeta({
            show: false,
            packageId: '',
            packageName: '',
            packageVersion: '',
        })
    }

    const handleCancelDelete = () => {
        setDeleteMeta({
            show: false,
            packageId: '',
            packageName: '',
            packageVersion: '',
        })
    }

    const rows = useMemo(
        () => Array.from(linkedPackageData.values()),
        [
            linkedPackageData,
        ],
    )

    const columns = useMemo<ColumnDef<LinkedPackageData>[]>(
        () => [
            {
                id: 'name',
                header: t('Package Name'),
                cell: ({ row }) => (
                    <Form.Control
                        type='text'
                        readOnly
                        value={row.original.name}
                    />
                ),
            },
            {
                id: 'version',
                header: t('Package Version'),
                cell: ({ row }) => (
                    <Form.Control
                        type='text'
                        readOnly
                        value={row.original.version ?? ''}
                    />
                ),
            },
            {
                id: 'licenses',
                header: t('License'),
                cell: ({ row }) => (
                    <Form.Control
                        type='text'
                        readOnly
                        value={(row.original.licenseIds ?? []).join(', ')}
                    />
                ),
            },
            {
                id: 'packageManager',
                header: t('Package Manager'),
                cell: ({ row }) => (
                    <Form.Control
                        type='text'
                        readOnly
                        value={row.original.packageManager ?? ''}
                    />
                ),
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <div className='text-center'>
                        <FaTrashAlt
                            className='btn-icon'
                            size={20}
                            onClick={() => openDeleteModal(row.original)}
                            title={t('Delete Package')}
                        />
                    </div>
                ),
            },
        ],
        [
            t,
            openDeleteModal,
        ],
    )

    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            <LinkPackagesModal
                show={showLinkPackagesModal}
                setShow={setShowLinkPackagesModal}
                payload={payload}
                setPayload={setPayload}
            />

            <Modal
                show={deleteMeta.show}
                onHide={handleCancelDelete}
                centered
            >
                <Modal.Header
                    closeButton
                    className='bg-danger bg-opacity-10'
                >
                    <Modal.Title className='text-danger'>{t('Delete link to package')}?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteMeta.packageId ? (
                        <p className='mb-0'>
                            {t('Do you really want to remove the link to package')}{' '}
                            <strong>
                                {deleteMeta.packageName}
                                {deleteMeta.packageVersion && ` (${deleteMeta.packageVersion})`}
                            </strong>
                            ?
                        </p>
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='secondary'
                        onClick={handleCancelDelete}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant='danger'
                        onClick={handleConfirmDelete}
                    >
                        {t('Delete Link')}
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='container page-content'>
                <div className='row'>
                    <div className='col-12'>
                        {showProcessing ? (
                            <div className='d-flex justify-content-center my-3'>
                                <Spinner className='spinner' />
                            </div>
                        ) : (
                            <>
                                <SW360Table
                                    table={table}
                                    showProcessing={showProcessing}
                                />
                                <div className='row mt-2'>
                                    <div className='col-12'>
                                        <button
                                            type='button'
                                            className='btn btn-secondary'
                                            onClick={openLinkPackagesModal}
                                        >
                                            {t('Add Packages')}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
