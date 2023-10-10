// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import AddAdditionalRolesComponent from '@/components/ProjectAddSummary/component/AddAdditionalRoles'
import AddKeyValueComponent from '@/components/ProjectAddSummary/component/AddKeyValue'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import GeneralInformation from './component/Summary/GeneralInformation'
import Roles from './Roles/Roles'
import ProjectPayload from '@/object-types/CreateProjectPayload'
import { useTranslations } from 'next-intl'
import Vendor from '@/object-types/Vendor'
import { AddtionalDataType } from '@/object-types/AddtionalDataType'
import InputKeyValue from '@/object-types/InputKeyValue'

interface Props {
    vendor: Vendor
    externalUrls: InputKeyValue[]
    externalIds: InputKeyValue[]
    additionalData: InputKeyValue[]
    projectPayload: ProjectPayload
    setVendor: React.Dispatch<React.SetStateAction<Vendor>>
    setExternalUrls: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    setExternalUrlsData: AddtionalDataType
    setExternalIds: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    setExternalIdsData: AddtionalDataType
    setAdditionalData: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    setAdditionalDataObject: AddtionalDataType
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function Summary({
    vendor,
    externalUrls,
    externalIds,
    additionalData,
    projectPayload,
    setVendor,
    setExternalUrls,
    setExternalUrlsData,
    setExternalIds,
    setExternalIdsData,
    setAdditionalData,
    setAdditionalDataObject,
    setProjectPayload,
}: Props) {
    const t = useTranslations('default')

    return (
        <>
            <div className='ms-1'>
                <GeneralInformation
                    vendor={vendor}
                    setVendor={setVendor}
                    projectPayload={projectPayload}
                    setProjectPayload={setProjectPayload}
                />
                <div className='row mb-4'>
                    <AddKeyValueComponent
                        header={t('External URLs')}
                        keyName={t('External URL')}
                        data={externalUrls}
                        setData={setExternalUrls}
                        setObject={setExternalUrlsData}
                    />
                </div>
                <Roles />
                <div className='row mb-4'>
                    <AddAdditionalRolesComponent documentType={DocumentTypes.PROJECT} />
                </div>
                <div className='row mb-4'>
                    <AddKeyValueComponent
                        header={t('External Ids')}
                        keyName={t('External Id')}
                        data={externalIds}
                        setData={setExternalIds}
                        setObject={setExternalIdsData}
                    />
                </div>
                <div className='row mb-4'>
                    <AddKeyValueComponent
                        header={t('Additional Data')}
                        keyName={t('additional data')}
                        data={additionalData}
                        setData={setAdditionalData}
                        setObject={setAdditionalDataObject}
                    />
                </div>
            </div>
        </>
    )
}
