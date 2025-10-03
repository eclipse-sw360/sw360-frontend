// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useTranslations } from 'next-intl'

import { AddtionalDataType, DocumentTypes, InputKeyValue, ProjectPayload, RolesType, Vendor } from '@/object-types'
import { AddAdditionalRoles, AddKeyValue } from 'next-sw360'
import Roles from './Roles/Roles'
import GeneralInformation from './component/Summary/GeneralInformation'

import type { JSX } from 'react'

interface Props {
    vendor: Vendor
    externalUrls: InputKeyValue[]
    externalIds: InputKeyValue[]
    additionalData: InputKeyValue[]
    additionalRoles?: InputKeyValue[]
    projectPayload: ProjectPayload
    setVendor: React.Dispatch<React.SetStateAction<Vendor>>
    setExternalUrls: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    setExternalUrlsData: AddtionalDataType
    setExternalIds: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    setExternalIdsData: AddtionalDataType
    setAdditionalData: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    setAdditionalDataObject: AddtionalDataType
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    setAdditionalRoles?: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    setDataAdditionalRoles?: RolesType
    moderators: { [k: string]: string }
    setModerators: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    contributors: { [k: string]: string }
    setContributors: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    securityResponsibles: { [k: string]: string }
    setSecurityResponsibles: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    projectOwner: { [k: string]: string }
    setProjectOwner: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    projectManager: { [k: string]: string }
    setProjectManager: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    leadArchitect: { [k: string]: string }
    setLeadArchitect: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
}

export default function Summary({
    vendor,
    externalUrls,
    externalIds,
    additionalData,
    additionalRoles,
    projectPayload,
    setVendor,
    setExternalUrls,
    setExternalUrlsData,
    setExternalIds,
    setExternalIdsData,
    setAdditionalData,
    setAdditionalDataObject,
    setProjectPayload,
    setAdditionalRoles,
    setDataAdditionalRoles,
    moderators,
    setModerators,
    contributors,
    setContributors,
    projectOwner,
    setProjectOwner,
    projectManager,
    setProjectManager,
    leadArchitect,
    setLeadArchitect,
    securityResponsibles,
    setSecurityResponsibles,
}: Props): JSX.Element {
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
                <Roles
                    projectPayload={projectPayload}
                    setProjectPayload={setProjectPayload}
                    moderators={moderators}
                    setModerators={setModerators}
                    contributors={contributors}
                    setContributors={setContributors}
                    securityResponsibles={securityResponsibles}
                    setSecurityResponsibles={setSecurityResponsibles}
                    projectOwner={projectOwner}
                    setProjectOwner={setProjectOwner}
                    projectManager={projectManager}
                    setProjectManager={setProjectManager}
                    leadArchitect={leadArchitect}
                    setLeadArchitect={setLeadArchitect}
                />
                <div className='row mb-4'>
                    <AddAdditionalRoles
                        documentType={DocumentTypes.PROJECT}
                        inputList={additionalRoles}
                        setInputList={setAdditionalRoles}
                        setDataInputList={setDataAdditionalRoles}
                    />
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
                        keyName={'Additional Data'}
                        data={additionalData}
                        setData={setAdditionalData}
                        setObject={setAdditionalDataObject}
                    />
                </div>
            </div>
        </>
    )
}
