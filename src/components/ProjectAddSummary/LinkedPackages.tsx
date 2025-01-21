// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { _, Table } from '@/components/sw360'
import { LinkedPackageData, ProjectPayload } from '@/object-types'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import LinkPackagesModal from '@/components/sw360/LinkedPackagesModal/LinkPackagesModal'
import Link from 'next/link'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'

interface Props {
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

type RowData = (string | string[] | undefined)[]

export default function LinkedPackages({ projectPayload,
                                         setProjectPayload }: Props): JSX.Element {

    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<RowData>>([])
    const [showLinkedPackagesModal, setShowLinkedPackagesModal] = useState(false)
    const [linkedPackageData, setLinkedPackageData] = useState<Map<string, LinkedPackageData>>(new Map())

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
        linkedPackageData.forEach((_, key) => {
            if (key === packageId){
                linkedPackageData.delete(key)
                if (updatedProjectPayload.packageIds &&
                    updatedProjectPayload.packageIds.includes(key)){
                        updatedProjectPayload.packageIds.splice(
                            updatedProjectPayload.packageIds.indexOf(key), 1 )
                        setProjectPayload(updatedProjectPayload)
                }
                const updatedTableData = extractDataFromMap(linkedPackageData)
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

    useEffect(() => {
        const data = extractDataFromMap(linkedPackageData)
        setTableData(data)
    }, [linkedPackageData])


    return (
        <>
            <LinkPackagesModal
                        setLinkedPackageData={setLinkedPackageData}
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
                        LINKED PACKAGES
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
                            Add Packages
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
