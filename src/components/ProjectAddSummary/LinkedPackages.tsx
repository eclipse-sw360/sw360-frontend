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
import { useCallback, useEffect, useState, type JSX } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'

interface Props {
    projectId?: string
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

type RowData = (string | string[] | undefined)[]

export default function LinkedPackages({ projectId,
                                         projectPayload,
                                         setProjectPayload }: Props): JSX.Element {

    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<RowData>>([])
    const [showLinkedPackagesModal, setShowLinkedPackagesModal] = useState(false)
    const [newLinkedPackageData, setNewLinkedPackageData] = useState<Map<string, LinkedPackageData>>(new Map())

    const columns = [
        {
            id: 'linkedPackagesData.name',
            name: t('Package Name'),
            sort: true,
            formatter: ([ name, packageId ]: [ name: string, packageId: string ]) =>
                _(
                    <>
                        <Link href={`/packages/detail/${packageId}`}>{name}</Link>
                    </>
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
            id: 'linkedPackagesData.deleteLinkedPackage',
            name: t('Actions'),
            sort: true,
            formatter: (packageId: string) =>
                _(
                    <>
                        <OverlayTrigger overlay={
                            <Tooltip>
                                {t('Delete')}
                            </Tooltip>}
                        >
                            <span className='d-inline-block'>
                                <FaTrashAlt
                                    className='btn-icon'
                                    onClick={() => handleDeletePackage(packageId)}
                                    style={{ color: 'gray', fontSize: '18px' }}
                                />
                            </span>
                        </OverlayTrigger>
                    </>
                ),
        },
    ]
    
    const handleDeletePackage = (packageId : string) => {
        const updatedProjectPayload = { ...projectPayload }
        newLinkedPackageData.forEach((_, key) => {
            if (key === packageId){
                newLinkedPackageData.delete(key)
                if (updatedProjectPayload.packageIds &&
                    updatedProjectPayload.packageIds.includes(key)){
                        updatedProjectPayload.packageIds.splice(
                            updatedProjectPayload.packageIds.indexOf(key), 1 )
                        setProjectPayload(updatedProjectPayload)
                }
                const updatedTableData = extractDataFromMap(newLinkedPackageData)
                setTableData(updatedTableData)
            }
        })
    }

    const extractDataFromMap = (linkedPackageData: Map<string, LinkedPackageData>) => {
        const extractedData: Array<RowData> = []
        linkedPackageData.forEach((value, ) => {
            extractedData.push([[value.name, value.packageId],
                                 value.version,
                                 value.licenseIds,
                                 value.packageManager,
                                 value.packageId])
        })
        return extractedData
    }

    const fetchData = useCallback(
        async (url: string) => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return signOut()
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status === HttpStatus.OK) {
                const data = (await response.json())
                return data
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                return undefined
            }
        },
        []
    )

    useEffect(() => {
        if (projectPayload.packageIds && projectPayload.packageIds.length > 0) {
            fetchData(`projects/${projectId}/packages`)
                .then((linkedPackages: LinkedPackage[] | undefined) => {
                    if (!linkedPackages) return;
                    setNewLinkedPackageData((prevMap) => {
                        const updatedMap = new Map(prevMap)
    
                        linkedPackages.forEach((item) => {
                            if (!updatedMap.has(item.id)) {
                                updatedMap.set(item.id, {
                                    packageId: item.id as string,
                                    name: item.name as string,
                                    version: item.version as string,
                                    licenseIds: item.licenseIds as string[],
                                    packageManager: item.packageManager as string,
                                })
                            }
                        })
                        return updatedMap
                    })
                    setTableData(extractDataFromMap(newLinkedPackageData))
                })
                .catch((err) => console.error(err));
        } else {
            setTableData([]);
        }
    }, [projectId])
    
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
