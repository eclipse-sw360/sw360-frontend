// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import AddKeyValueComponent from '@/components/AddKeyValue'
import AddAdditionalRolesComponent from '@/components/AddAdditionalRoles'
import { notFound } from 'next/navigation'
import ComponentPayload from '@/object-types/ComponentPayLoad'
import { Session } from '@/object-types/Session'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import DocumentTypes from '@/object-types/enums/DocumentTypes'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { signOut } from 'next-auth/react'
import Vendor from '@/object-types/Vendor'
import ComponentOwner from '@/object-types/ComponentOwner'
import Moderators from '@/object-types/Moderators'
import AttachmentDetail from '@/object-types/AttachmentDetail'
import ActionType from '@/object-types/enums/ActionType'
import SearchUsersModalComponent from '@/components/sw360/SearchUsersModal/SearchUsersModal'
import GeneralInfoComponent from '@/components/GeneralInfoComponent/GeneralInfoComponent'
import RolesInformation from '@/components/RolesInformationComponent/RolesInformation'
import InputKeyValue from '@/object-types/InputKeyValue'
import CommonUtils from '@/utils/common.utils'

interface Props {
    session?: Session
    componentId?: string
    componentData?: ComponentPayload
    attachmentData?: AttachmentDetail[]
    setComponentData?: React.Dispatch<React.SetStateAction<ComponentPayload>>
}

export default function ComponentEditSummary({
    session,
    componentId,
    componentData,
    setComponentData,
    attachmentData,
}: Props) {
    const t = useTranslations(COMMON_NAMESPACE)
    const [roles, setRoles] = useState<InputKeyValue[]>([])
    const [externalIds, setExternalIds] = useState<InputKeyValue[]>([])
    const [addtionalData, setAddtionalData] = useState<InputKeyValue[]>([])
    const [vendor, setVendor] = useState<Vendor>({
        id: '',
        fullName: '',
    })

    const [componentOwner, setComponentOwner] = useState<ComponentOwner>({
        email: '',
        fullName: '',
    })

    const [moderator, setModerator] = useState<Moderators>({
        emails: null,
        fullName: '',
    })
    const [componentPayload, setComponentPayload] = useState<ComponentPayload>({
        name: '',
        createBy: '',
        description: '',
        componentType: '',
        moderators: null,
        modifiedBy: '',
        modifiedOn: '',
        componentOwner: '',
        ownerAccountingUnit: '',
        ownerGroup: '',
        ownerCountry: '',
        roles: null,
        externalIds: null,
        additionalData: null,
        defaultVendorId: '',
        categories: null,
        homepage: '',
        mailinglist: '',
        wiki: '',
        blog: '',
        attachmentDTOs: attachmentData,
    })

    const fetchData: any = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json()
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                signOut()
            } else {
                notFound()
            }
        },
        [session.user.access_token]
    )

    useEffect(() => {
        fetchData(`components/${componentId}`).then((component: any) => {
            if (typeof component.roles !== 'undefined') {
                setRoles(CommonUtils.convertObjectToMapRoles(component.roles))
            }

            if (typeof component.externalIds !== 'undefined') {
                setExternalIds(CommonUtils.convertObjectToMap(component.externalIds))
            }

            if (typeof component.additionalData !== 'undefined') {
                setAddtionalData(CommonUtils.convertObjectToMap(component.additionalData))
            }

            if (typeof component['_embedded']['sw360:moderators'] !== 'undefined') {
                setModerator(CommonUtils.handlerModerators(component['_embedded']['sw360:moderators']))
            }

            if (typeof component['_embedded']['defaultVendor'] !== 'undefined') {
                const vendor: Vendor = {
                    id: component.defaultVendorId,
                    fullName: component['_embedded']['defaultVendor']['fullName'],
                }
                setVendor(vendor)
            }

            if (typeof component['_embedded']['componentOwner'] !== 'undefined') {
                const componentOwner: ComponentOwner = {
                    email: component['_embedded']['componentOwner']['email'],
                    fullName: component['_embedded']['componentOwner']['fullName'],
                }
                setComponentOwner(componentOwner)
            }

            let modifiedBy = ''
            if (typeof component['_embedded']['modifiedBy'] !== 'undefined') {
                modifiedBy = component['_embedded']['modifiedBy']['fullName']
            }

            let creatBy = ''
            if (typeof component['_embedded']['modifiedBy'] !== 'undefined') {
                creatBy = component['_embedded']['createdBy']['fullName']
            }

            let componentOwnerEmail = ''
            if (typeof component['_embedded']['componentOwner'] !== 'undefined') {
                componentOwnerEmail = component['_embedded']['componentOwner']['email']
            }

            const componentPayloadData: ComponentPayload = {
                name: component.name,
                createBy: creatBy,
                description: component.description,
                componentType: component.componentType,
                moderators: CommonUtils.getEmailsModerators(component['_embedded']['sw360:moderators']),
                modifiedBy: modifiedBy,
                modifiedOn: component.modifiedOn,
                componentOwner: componentOwnerEmail,
                ownerAccountingUnit: component.ownerAccountingUnit,
                ownerGroup: component.ownerGroup,
                ownerCountry: component.ownerCountry,
                roles: CommonUtils.convertRoles(CommonUtils.convertObjectToMapRoles(component.roles)),
                externalIds: component.externalIds,
                additionalData: component.additionalData,
                defaultVendorId: component.defaultVendorId,
                categories: component.categories,
                homepage: component.homepage,
                mailinglist: component.mailinglist,
                wiki: component.wiki,
                blog: component.blog,
                attachmentDTOs: attachmentData,
            }
            setComponentPayload(componentPayloadData)
            setComponentData(componentPayloadData)
        })
    }, [componentId, fetchData, setComponentData, attachmentData])

    const setDataAddtionalData = (additionalDatas: Map<string, string>) => {
        const obj = Object.fromEntries(additionalDatas)
        setComponentPayload({
            ...componentPayload,
            additionalData: obj,
        })
        setComponentData({
            ...componentData,
            additionalData: obj,
        })
    }

    const setDataExternalIds = (externalIds: Map<string, string>) => {
        const obj = Object.fromEntries(externalIds)
        setComponentPayload({
            ...componentPayload,
            externalIds: obj,
        })
        setComponentData({
            ...componentData,
            externalIds: obj,
        })
    }

    const setDataRoles = (roles: InputKeyValue[]) => {
        const roleDatas = convertRoles(roles)
        setComponentPayload({
            ...componentPayload,
            roles: roleDatas,
        })
        setComponentData({
            ...componentData,
            roles: roleDatas,
        })
    }

    const convertRoles = (datas: InputKeyValue[]) => {
        if (datas === null) {
            return null
        }
        const contributors: string[] = []
        const commiters: string[] = []
        const expecters: string[] = []
        datas.forEach((data) => {
            if (data.key === 'Contributor') {
                contributors.push(data.value)
            } else if (data.key === 'Committer') {
                commiters.push(data.value)
            } else if (data.key === 'Expert') {
                expecters.push(data.value)
            }
        })
        const roles = {
            Contributor: contributors,
            Committer: commiters,
            Expert: expecters,
        }
        return roles
    }

    return (
        <>
            <SearchUsersModalComponent />
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
                            session={session}
                            actionType={ActionType.EDIT}
                            vendor={vendor}
                            setVendor={setVendor}
                            componentPayload={componentPayload}
                            setComponentPayload={setComponentPayload}
                            componentData={componentData}
                            setComponentData={setComponentData}
                        />
                        <RolesInformation
                            session={session}
                            actionType={ActionType.EDIT}
                            componentOwner={componentOwner}
                            setComponentOwner={setComponentOwner}
                            moderator={moderator}
                            setModerator={setModerator}
                            componentPayload={componentPayload}
                            setComponentPayload={setComponentPayload}
                            componentData={componentData}
                            setComponentData={setComponentData}
                        />
                        <div className='row mb-4'>
                            <AddAdditionalRolesComponent
                                documentType={DocumentTypes.COMPONENT}
                                setDataRoles={setDataRoles}
                                roles={roles}
                                setRoles={setRoles}
                            />
                        </div>
                        <div className='row mb-4'>
                            <AddKeyValueComponent
                                header={t('External ids')}
                                keyName={'external id'}
                                setData={setExternalIds}
                                data={externalIds}
                                setMap={setDataExternalIds}
                            />
                        </div>
                        <div className='row mb-4'>
                            <AddKeyValueComponent
                                header={t('Additional Data')}
                                keyName={'additional data'}
                                setData={setAddtionalData}
                                data={addtionalData}
                                setMap={setDataAddtionalData}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}
