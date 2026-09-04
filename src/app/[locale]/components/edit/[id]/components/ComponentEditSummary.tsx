// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { AddAdditionalRoles, AddKeyValue } from 'next-sw360'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import GeneralInfoComponent from '@/components/GeneralInfoComponent/GeneralInfoComponent'
import RolesInformation from '@/components/RolesInformation/RolesInformation'
import { useConfigValue } from '@/contexts'
import { ComponentPayload, DocumentTypes, InputKeyValue, UIConfigKeys, Vendor } from '@/object-types'
import { CommonUtils } from '@/utils'

interface Props {
    componentPayload: ComponentPayload
    setComponentPayload: React.Dispatch<React.SetStateAction<ComponentPayload>>
    externalIds: InputKeyValue[]
    setExternalIds: Dispatch<SetStateAction<InputKeyValue[]>>
    addtionalData: InputKeyValue[]
    setAddtionalData: Dispatch<SetStateAction<InputKeyValue[]>>
    vendor: Vendor
    setVendor: Dispatch<SetStateAction<Vendor>>
    componentOwner: Record<string, string>
    setComponentOwner: Dispatch<SetStateAction<Record<string, string>>>
    moderators: Record<string, string>
    setModerators: Dispatch<SetStateAction<Record<string, string>>>
}

export default function ComponentEditSummary({
    componentPayload,
    setComponentPayload,
    externalIds,
    setExternalIds,
    addtionalData,
    setAddtionalData,
    vendor,
    setVendor,
    componentOwner,
    setComponentOwner,
    moderators,
    setModerators,
}: Props): ReactNode {
    const t = useTranslations('default')

    // Configs from backend
    const componentExternalIdSuggestions =
        useConfigValue(UIConfigKeys.UI_COMPONENT_EXTERNALKEYS) !== null
            ? (useConfigValue(UIConfigKeys.UI_COMPONENT_EXTERNALKEYS) as string[])
            : undefined

    const setDataAddtionalData = (additionalDatas: Map<string, string>) => {
        const obj = Object.fromEntries(additionalDatas)
        setComponentPayload({
            ...componentPayload,
            additionalData: obj,
        })
    }

    const setDataExternalIds = (externalIds: Map<string, string>) => {
        const obj = Object.fromEntries(externalIds)
        setComponentPayload({
            ...componentPayload,
            externalIds: obj,
        })
    }

    return (
        <>
            <form
                action=''
                id='form_submit'
                method='post'
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <div className='col'>
                    <div className='col'>
                        <GeneralInfoComponent
                            vendor={vendor}
                            setVendor={setVendor}
                            componentPayload={componentPayload}
                            setComponentPayload={setComponentPayload}
                        />
                        <RolesInformation
                            componentOwner={componentOwner}
                            setComponentOwner={setComponentOwner}
                            moderators={moderators}
                            setModerators={setModerators}
                            componentPayload={componentPayload}
                            setComponentPayload={setComponentPayload}
                        />
                        <div className='row mb-4'>
                            <AddAdditionalRoles
                                documentType={DocumentTypes.COMPONENT}
                                inputList={CommonUtils.convertObjectToMapRoles(componentPayload.roles ?? {})}
                                setInputList={(newList) => {
                                    setComponentPayload({
                                        ...componentPayload,
                                        roles: CommonUtils.convertRoles(newList),
                                    })
                                }}
                            />
                        </div>
                        <div className='row mb-4'>
                            <AddKeyValue
                                header={t('External ids')}
                                keyName={'external id'}
                                setData={setExternalIds}
                                data={externalIds}
                                setObject={setDataExternalIds}
                                keySuggestions={componentExternalIdSuggestions}
                            />
                        </div>
                        <div className='row mb-4'>
                            <AddKeyValue
                                header={t('Additional Data')}
                                keyName={'additional data'}
                                setData={setAddtionalData}
                                data={addtionalData}
                                setObject={setDataAddtionalData}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}
