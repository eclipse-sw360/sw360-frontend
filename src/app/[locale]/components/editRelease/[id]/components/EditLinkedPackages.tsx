// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { _, Table } from '@/components/sw360'
import LinkPackagesModal from '@/components/sw360/LinkedPackagesModal/LinkPackagesModal'
import { LinkedPackage, LinkedPackageData, Release } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { type JSX, useCallback, useEffect, useState } from 'react'
import { Alert, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import { StatusCodes } from 'http-status-codes'
import MessageService from '@/services/message.service'

interface ExtendedRelease extends Release {
    linkedPackages?: {
        packageId?: string
        name?: string
        version?: string
        licenseIds?: string[]
        packageManager?: string
        comment?: string
    }[]
}

interface Props {
    releaseId?: string
    releasePayload: ExtendedRelease
    setReleasePayload: React.Dispatch<React.SetStateAction<ExtendedRelease>>
}

type RowData = (string | string[] | { comment?: string; key?: string } | undefined)[]

export default function EditLinkedPackages({ releaseId, releasePayload, setReleasePayload }: Props) {
    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<RowData>>([])
    const [showLinkedPackagesModal, setShowLinkedPackagesModal] = useState(false)
    const [linkedPackageMap, setLinkedPackageMap] = useState<Map<string, LinkedPackageData>>(new Map())

    const [showModal, setShowModal] = useState(false)
    const [selectedPkg, setSelectedPkg] = useState<{ id: string; name: string; version: string } | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [alert, setAlert] = useState<{ variant: string; message: JSX.Element } | null>(null)

    const extractDataFromMap = (dataMap: Map<string, LinkedPackageData>): Array<RowData> => {
        const extractedData: Array<RowData> = []
        dataMap.forEach((value) => {
            extractedData.push([
                [value.name, value.packageId],
                value.version,
                value.licenseIds,
                value.packageManager,
                { comment: value.comment || '', key: value.packageId },
                value.packageId,
            ])
        })
        return extractedData
    }

    const handleComments = (packageId: string, updatedComment: string, mapData: Map<string, LinkedPackageData>) => {
        if (mapData.has(packageId)) {
            const updatedMap = new Map(mapData)
            const item = updatedMap.get(packageId)
            if (item) item.comment = updatedComment

            setLinkedPackageMap(updatedMap)
            const updatedPayload = { ...releasePayload, linkedPackages: Array.from(updatedMap.values()) }
            setReleasePayload(updatedPayload)
            setTableData(extractDataFromMap(updatedMap))
        }
    }

    const deleteLinkedPackage = async () => {
        if (!selectedPkg) return
        try {
            setDeleting(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()

            const response = await ApiUtils.DELETE(`packages/${selectedPkg.id}`, session.user.access_token)

            if (response.status === StatusCodes.OK || response.status === StatusCodes.NO_CONTENT) {
                MessageService.success(t('Package deleted successfully'))
                const updatedMap = new Map(linkedPackageMap)
                updatedMap.delete(selectedPkg.id)
                setLinkedPackageMap(updatedMap)
                const updatedPayload = { ...releasePayload, linkedPackages: Array.from(updatedMap.values()) }
                setReleasePayload(updatedPayload)
                setTableData(extractDataFromMap(updatedMap))

                setShowModal(false)
                setAlert({
                    variant: 'success',
                    message: <>{t('Package deleted successfully')}</>,
                })
            } else if (response.status === StatusCodes.CONFLICT) {
                setAlert({
                    variant: 'danger',
                    message: <>{t('Package cannot be deleted')}</>,
                })
            } else {
                setAlert({
                    variant: 'danger',
                    message: <>{t('Package cannot be deleted')}</>,
                })
            }
        } catch (error) {
            console.error(error)
            setAlert({
                variant: 'danger',
                message: <>{t('Package cannot be deleted')}</>,
            })
        } finally {
            setDeleting(false)
        }
    }

    const fetchData = useCallback(async () => {
        if (!releaseId) return
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()

        const response = await ApiUtils.GET(`releases/${releaseId}?embed=packages`, session.user.access_token)
        if (response.status === StatusCodes.OK) {
            const data = await response.json()
            const embedded = data?._embedded?.['sw360:packages']
            if (!embedded || embedded.length === 0) return

            const updatedMap = new Map<string, LinkedPackageData>()
            embedded.forEach((item: LinkedPackage) => {
                updatedMap.set(item.id, {
                    packageId: item.id,
                    name: item.name ?? 'Unnamed',
                    version: item.version ?? 'N/A',
                    licenseIds: item.licenseIds ?? [],
                    packageManager: item.packageManager ?? 'N/A',
                    comment: releasePayload.linkedPackages?.find((p: any) => p.packageId === item.id)?.comment || '',
                })
            })
            setLinkedPackageMap(updatedMap)
            setTableData(extractDataFromMap(updatedMap))
        } else if (response.status === StatusCodes.UNAUTHORIZED) {
            signOut()
        }
    }, [releaseId])

    useEffect(() => {
        fetchData().catch(console.error)
    }, [fetchData])

    useEffect(() => {
        setTableData(extractDataFromMap(linkedPackageMap))
    }, [linkedPackageMap])

    const handleModalLinkedPackages = (newMap: Map<string, LinkedPackageData>) => {
        const merged = new Map(linkedPackageMap)
        newMap.forEach((v, key) => merged.set(key, v))
        setLinkedPackageMap(merged)
        const updatedPayload = { ...releasePayload, linkedPackages: Array.from(merged.values()) as any }
        setReleasePayload(updatedPayload)
        setTableData(extractDataFromMap(merged))
    }

    const columns = [
        {
            id: 'linkedPackagesData.name',
            name: t('Package Name'),
            sort: true,
            formatter: ([name, packageId]: [string, string]) =>
                _(
                    <a
                        href={`/packages/detail/${packageId}`}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {name}
                    </a>,
                ),
        },
        { id: 'linkedPackagesData.version', name: t('Package Version'), sort: true },
        { id: 'linkedPackagesData.licenses', name: t('License'), sort: true },
        { id: 'linkedPackagesData.packageManager', name: t('Package Manager'), sort: true },
        {
            id: 'linkedPackagesData.comment',
            name: t('Comments'),
            sort: true,
            formatter: ({ comment, key }: { comment: string; key: string }) =>
                _(
                    <div className='col-lg-9'>
                        <input
                            key={`comment-${key}-${linkedPackageMap.get(key)?.comment || comment}`}
                            type='text'
                            className='form-control'
                            placeholder='Enter comment'
                            defaultValue={linkedPackageMap.get(key)?.comment || comment}
                            onBlur={(e) => handleComments(key, e.target.value, linkedPackageMap)}
                        />
                    </div>,
                ),
        },
        {
            id: 'linkedPackagesData.delete',
            name: t('Actions'),
            sort: false,
            formatter: (pkgTuple: [string, string, string]) =>
                _(
                    <OverlayTrigger overlay={<Tooltip>{t('Delete Package')}</Tooltip>}>
                        <span className='d-inline-block'
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                const [id, name, version] = pkgTuple
                                setSelectedPkg({ id, name, version })
                                setAlert(null)
                                setShowModal(true)
                            }}
                        >
                            <FaTrashAlt
                                className='btn-icon'
                                style={{ color: 'gray', fontSize: '18px', cursor: 'pointer' }}
                            />
                        </span>
                    </OverlayTrigger>,
                ),
        },
    ]

    return (
        <>
            <LinkPackagesModal
                show={showLinkedPackagesModal}
                setShow={setShowLinkedPackagesModal}
                projectPayload={releasePayload as any}
                setProjectPayload={setReleasePayload as any}
                setLinkedPackageData={(m: Map<string, LinkedPackageData>) => handleModalLinkedPackages(m)}
            />
            <div className='row mb-4'>
                <div className='row header-1'>
                    <h6
                        className='fw-medium'
                        style={{ color: '#5D8EA9', paddingLeft: '0px' }}
                    >
                        {t('LINKED PACKAGES')}
                        <hr
                            className='my-2 mb-2'
                            style={{ color: '#5D8EA9' }}
                        />
                    </h6>
                </div>
                <div style={{ paddingLeft: '0px' }}>
                    <Table
                        columns={columns}
                        data={tableData}
                        sort={false}
                    />
                </div>
                <div
                    className='row'
                    style={{ paddingLeft: '0px', marginTop: '10px' }}
                >
                    <div className='col-lg-4'>
                        <button
                            type='button'
                            className='btn btn-secondary'
                            onClick={() => setShowLinkedPackagesModal(true)}
                        >
                            {t('Add Packages')}
                        </button>
                    </div>
                </div>
            </div>
            <Modal
                size='lg'
                centered
                show={showModal}
                onHide={() => {
                    setShowModal(false)
                    setSelectedPkg(null)
                    setAlert(null)
                    setDeleting(false)
                }}
                aria-labelledby='delete-package-modal'
                scrollable
            >
                <Modal.Header style={{ backgroundColor: '#feefef', color: '#da1414' }} closeButton>
                    <Modal.Title id='delete-package-modal'>{t('Delete Package')}?</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {alert && <Alert variant={alert.variant}>{alert.message}</Alert>}
                    {!alert && selectedPkg && (
                        <p>
                            {`${t('Do you really want to delete the package')} `}
                            <span className='fw-medium'>
                                {`${selectedPkg.name}${selectedPkg.version ? ` (${selectedPkg.version})` : ''}`}
                            </span>
                            ?
                        </p>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    {alert ? (
                        <button
                            className='btn btn-dark'
                            onClick={() => {
                                setShowModal(false)
                                setSelectedPkg(null)
                                setAlert(null)
                                setDeleting(false)
                            }}
                        >
                            {t('Close')}
                        </button>
                    ) : (
                        <>
                            <button
                                className='btn btn-dark'
                                onClick={() => {
                                    setShowModal(false)
                                    setSelectedPkg(null)
                                }}
                                disabled={deleting}
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                className='btn btn-danger'
                                onClick={() => void deleteLinkedPackage()}
                                disabled={deleting}
                            >
                                {t('Delete Package')}
                                {deleting && (
                                    <Spinner size='sm' className='ms-1 spinner' />
                                )}
                            </button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    )
}
