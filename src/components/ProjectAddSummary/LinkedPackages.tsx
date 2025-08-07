// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { _, Table } from '@/components/sw360'
import LinkPackagesModal from '@/components/sw360/LinkedPackagesModal/LinkPackagesModal'
import { HttpStatus, LinkedPackage, LinkedPackageData, ProjectPayload } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCallback, useEffect, useState, type JSX } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'

interface Props {
    projectId?: string
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

type RowData = (string | string[] | { comment?: string; key?: string } | undefined)[]

export default function LinkedPackages({ projectId, projectPayload, setProjectPayload }: Props): JSX.Element {
    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<RowData>>([])
    const [showLinkedPackagesModal, setShowLinkedPackagesModal] = useState(false)
    const [newLinkedPackageData, setNewLinkedPackageData] = useState<Map<string, LinkedPackageData>>(new Map())

    const handleComments = (
        packageId: string,
        updatedComment: string,
        linkedPackageData: Map<string, LinkedPackageData>,
    ) => {
        try {
            if (linkedPackageData.has(packageId)) {
                linkedPackageData.forEach((value, key) => {
                    if (key === packageId) {
                        value.comment = updatedComment
                        setNewLinkedPackageData(new Map(linkedPackageData))

                        // Update project payload
                        const updatedProjectPayload = { ...projectPayload }
                        if (updatedProjectPayload.packageIds === undefined) {
                            updatedProjectPayload.packageIds = {}
                        }
                        updatedProjectPayload.packageIds[packageId] = {
                            comment: updatedComment,
                        }
                        setProjectPayload(updatedProjectPayload)

                        const updatedTableData = extractDataFromMap(linkedPackageData)
                        setTableData(updatedTableData)
                    }
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const columns = [
        {
            id: 'linkedPackagesData.name',
            name: t('Package Name'),
            sort: true,
            formatter: ([name, packageId]: [name: string, packageId: string]) =>
                _(
                    <>
                        <Link href={`/packages/detail/${packageId}`}>{name}</Link>
                    </>,
                ),
        },
        {
            id: 'linkedPackagesData.version',
            name: t('Package Version'),
            sort: true,
        },
        {
            id: 'linkedPackagesData.licenses',
            name: t('License'),
            sort: true,
        },
        {
            id: 'linkedPackagesData.packageManager',
            name: t('Package Manager'),
            sort: true,
        },
        {
            id: 'linkedPackagesData.comment',
            name: t('Comments'),
            sort: true,
            formatter: ({ comment, key }: { comment: string; key: string }) =>
                _(
                    <div className='col-lg-9'>
                        <input
                            key={`comment-${key}-${newLinkedPackageData.get(key)?.comment || comment}`}
                            type='text'
                            className='form-control'
                            placeholder='Enter Comments'
                            id={`linkedPackagesData.comment-${key}`}
                            aria-describedby='linkedPackagesData.comment'
                            name='comment'
                            defaultValue={newLinkedPackageData.get(key)?.comment || comment}
                            onBlur={(event) => {
                                const updatedComment = event.target.value
                                handleComments(key, updatedComment, newLinkedPackageData)
                            }}
                        />
                    </div>,
                ),
        },
        {
            id: 'linkedPackagesData.deleteLinkedPackage',
            name: t('Actions'),
            sort: true,
            formatter: (packageId: string) =>
                _(
                    <>
                        <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                            <span className='d-inline-block'>
                                <FaTrashAlt
                                    className='btn-icon'
                                    onClick={() => handleDeletePackage(packageId)}
                                    style={{ color: 'gray', fontSize: '18px' }}
                                />
                            </span>
                        </OverlayTrigger>
                    </>,
                ),
        },
    ]

    const handleDeletePackage = (packageId: string) => {
        const updatedProjectPayload = { ...projectPayload }
        newLinkedPackageData.forEach((_, key) => {
            if (key === packageId) {
                newLinkedPackageData.delete(key)
                if (updatedProjectPayload.packageIds && updatedProjectPayload.packageIds[key]) {
                    delete updatedProjectPayload.packageIds[key]
                    setProjectPayload(updatedProjectPayload)
                }
                const updatedTableData = extractDataFromMap(newLinkedPackageData)
                setTableData(updatedTableData)
            }
        })
    }

    const extractDataFromMap = (linkedPackageData: Map<string, LinkedPackageData>) => {
        const extractedData: Array<RowData> = []
        linkedPackageData.forEach((value) => {
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

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = await response.json()
            return data
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        if (projectPayload.packageIds && Object.keys(projectPayload.packageIds).length > 0) {
            fetchData(`projects/${projectId}/packages`)
                .then((linkedPackages: LinkedPackage[] | undefined) => {
                    if (!linkedPackages) return

                    const updatedMap = new Map<string, LinkedPackageData>()

                    linkedPackages.forEach((item) => {
                        const packageComment = projectPayload.packageIds?.[item.id]?.comment || ''
                        updatedMap.set(item.id, {
                            packageId: item.id,
                            name: item.name,
                            version: item.version as string,
                            licenseIds: item.licenseIds as string[],
                            packageManager: item.packageManager as string,
                            comment: packageComment,
                        })
                    })

                    setNewLinkedPackageData(updatedMap)
                    // Extract data from the newly created map with comments
                    setTableData(extractDataFromMap(updatedMap))
                })
                .catch((err) => console.error(err))
        } else {
            setTableData([])
        }
    }, [projectId, projectPayload.packageIds])

    useEffect(() => {
        setTableData(extractDataFromMap(newLinkedPackageData))
    }, [newLinkedPackageData])

    return (
        <>
            <LinkPackagesModal
                setLinkedPackageData={setNewLinkedPackageData}
                projectPayload={projectPayload}
                setProjectPayload={setProjectPayload}
                show={showLinkedPackagesModal}
                setShow={setShowLinkedPackagesModal}
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
                    style={{ paddingLeft: '0px' }}
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
        </>
    )
}
