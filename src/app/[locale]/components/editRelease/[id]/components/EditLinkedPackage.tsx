// Copyright (C) Siemens Healthinners, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import type { JSX } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import { SW360Table } from '@/components/sw360'
import LinkPackagesModal from '@/components/sw360/LinkedPackagesModal/LinkPackagesModal'
import { LinkedPackageData, Release } from '@/object-types'

interface Props {
    releasePayload: Release
    setReleasePayload: React.Dispatch<React.SetStateAction<Release>>
}

interface DeleteMetaData {
    show: boolean
    packageId: string
    packageName: string
    packageVersion: string
}

export default function EditLinkedPackages({ releasePayload, setReleasePayload }: Props): JSX.Element {
    const t = useTranslations('default')

    const [linkedPackageData, setLinkedPackageData] = useState<Map<string, LinkedPackageData>>(new Map())
    const [showLinkPackagesModal, setShowLinkPackagesModal] = useState(false)
    const [deleteMeta, setDeleteMeta] = useState<DeleteMetaData>({
        show: false,
        packageId: '',
        packageName: '',
        packageVersion: '',
    })
    const openLinkPackagesModal = () => {
        setShowLinkPackagesModal(true)
    }
    useEffect(() => {
        const ids = Array.from(
            new Set(
                Array.from(linkedPackageData.values())
                    .map((pkg) => pkg.packageId)
                    .filter((id): id is string => Boolean(id)),
            ),
        )
        setReleasePayload((prev) => ({
            ...prev,
            packageIds: ids,
        }))
    }, [
        linkedPackageData,
        setReleasePayload,
    ])

    useEffect(() => {
        if (!releasePayload?.linkedPackages?.length) return

        const map = new Map<string, LinkedPackageData>()

        releasePayload.linkedPackages.forEach((pkg) => {
            map.set(pkg.packageId, pkg)
        })

        setLinkedPackageData(map)
    }, [
        releasePayload.linkedPackages,
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
                payload={{
                    linkedPackages: Object.fromEntries(linkedPackageData),
                }}
                setPayload={(value) => {
                    const resolved =
                        typeof value === 'function'
                            ? value({
                                  linkedPackages: {},
                              })
                            : value
                    const data = resolved.linkedPackages ?? {}
                    setLinkedPackageData(new Map(Object.entries(data)))
                }}
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
                        <>
                            <SW360Table
                                table={table}
                                showProcessing={false}
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
                    </div>
                </div>
            </div>
        </>
    )
}
