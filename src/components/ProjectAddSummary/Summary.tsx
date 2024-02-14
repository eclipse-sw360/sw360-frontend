// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'

import { AddtionalDataType, DocumentTypes, InputKeyValue, ProjectSummaryPayload, Vendor } from '@/object-types'
import { AddAdditionalRoles, AddKeyValue } from 'next-sw360'
import Roles from './Roles/Roles'
import GeneralInformation from './component/Summary/GeneralInformation'

interface Props {
    vendor: Vendor
    externalUrls: InputKeyValue[]
    externalIds: InputKeyValue[]
    additionalData: InputKeyValue[]
    projectPayload: ProjectSummaryPayload
    setVendor: React.Dispatch<React.SetStateAction<Vendor>>
    setExternalUrls: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    setExternalUrlsData: AddtionalDataType
    setExternalIds: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    setExternalIdsData: AddtionalDataType
    setAdditionalData: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    setAdditionalDataObject: AddtionalDataType
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectSummaryPayload>>
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
                    <AddKeyValue
                        header={t('External URLs')}
                        keyName={'External URL'}
                        data={externalUrls}
                        setData={setExternalUrls}
                        setObject={setExternalUrlsData}
                    />
                </div>
                <Roles />
                <div className='row mb-4'>
                    <AddAdditionalRoles documentType={DocumentTypes.PROJECT} />
                </div>
                <div className='row mb-4'>
                    <AddKeyValue
                        header={t('External Ids')}
                        keyName={'External Id'}
                        data={externalIds}
                        setData={setExternalIds}
                        setObject={setExternalIdsData}
                    />
                </div>
                <div className='row mb-4'>
                    <AddKeyValue
                        header={t('Additional Data')}
                        keyName={'additional data'}
                        data={additionalData}
                        setData={setAdditionalData}
                        setObject={setAdditionalDataObject}
                    />
                </div>
            </div>
        </>
    )
}
