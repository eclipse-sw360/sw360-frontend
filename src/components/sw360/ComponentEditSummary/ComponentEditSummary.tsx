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
import GeneralInfoComponent from '../ComponentAddSummary/GeneralInfoComponent'
import RolesInformation from '../ComponentAddSummary/RolesInformation'
import Vendor from '@/object-types/Vendor'
import ComponentOwner from '@/object-types/ComponentOwner'
import Moderators from '@/object-types/Moderators'
import SearchUsersModalComponent from '../SearchUsersModal/SearchUsersModal'
interface Props {
    session?: Session
    componentId?: string
}

export default function ComponentEditSummary({ session, componentId }: Props) {
    const t = useTranslations(COMMON_NAMESPACE)
    const [roles, setRoles] = useState<Input[]>([])
    const [externalIds, setExternalIds] = useState<Input[]>([])
    const [addtionalData, setAddtionalData] = useState<Input[]>([])
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
        blog: ''
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

    const handlerModerators = (emails: any[]) => {
        const fullNames: string[] = []
        const moderatorsEmail: string[] = []
        if (emails.length == 0) {
            return
        }
        emails.forEach((item) => {
            fullNames.push(item.fullName)
            moderatorsEmail.push(item.email)
        })
        const moderatorsName: string = fullNames.join(' , ')
        const moderatorsResponse: Moderators = {
            fullName: moderatorsName,
            emails: moderatorsEmail,
        }
        return moderatorsResponse
    }

    const getEmailsModerators = (emails: any[]) => {
        const moderatorsEmail: string[] = []
        if (typeof emails === 'undefined') {
            return
        }
        emails.forEach((item) => {
            moderatorsEmail.push(item.email)
        })

        return moderatorsEmail
    }

    const convertObjectToMap = (data: string) => {
        const map = new Map(Object.entries(data))
        const inputs: Input[] = []
        map.forEach((value, key) => {
            const input: Input = {
                key: key,
                value: value,
            }
            inputs.push(input)
        })
        return inputs
    }

    const convertObjectToMapRoles = (data: string) => {
        if (data === undefined) {
            return null
        }
        const inputRoles: Input[] = []
        const mapRoles = new Map(Object.entries(data))
        mapRoles.forEach((value, key) => {
            for (let index = 0; index < value.length; index++) {
                const input: Input = {
                    key: key,
                    value: value.at(index),
                }
                inputRoles.push(input)
            }
        })
        return inputRoles
    }

    useEffect(() => {
        fetchData(`components/${componentId}`).then((component: any) => {
            if (typeof component.roles !== 'undefined') {
                setRoles(convertObjectToMapRoles(component.roles))
            }

            if (typeof component.externalIds !== 'undefined') {
                setExternalIds(convertObjectToMap(component.externalIds))
            }

            if (typeof component.additionalData !== 'undefined') {
                setAddtionalData(convertObjectToMap(component.additionalData))
            }

            if (typeof component['_embedded']['sw360:moderators'] !== 'undefined') {
                setModerator(handlerModerators(component['_embedded']['sw360:moderators']))
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
                moderators: getEmailsModerators(component['_embedded']['sw360:moderators']),
                modifiedBy: modifiedBy,
                modifiedOn: component.modifiedOn,
                componentOwner: componentOwnerEmail,
                ownerAccountingUnit: component.ownerAccountingUnit,
                ownerGroup: component.ownerGroup,
                ownerCountry: component.ownerCountry,
                roles: convertRoles(convertObjectToMapRoles(component.roles)),
                externalIds: component.externalIds,
                additionalData: component.additionalData,
                defaultVendorId: component.defaultVendorId,
                categories: component.categories,
                homepage: component.homepage,
                mailinglist: component.mailinglist,
                wiki: component.wiki,
                blog: component.blog
            }
            setComponentPayload(componentPayloadData)
        })
    }, [componentId, fetchData])

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

    const setDataRoles = (roles: Input[]) => {
        const roleDatas = convertRoles(roles)
        setComponentPayload({
            ...componentPayload,
            roles: roleDatas,
        })
    }

    const convertRoles = (datas: Input[]) => {
        if (datas === null) {
            return null;
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
                <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
                    <div className='row'>
                        <div className='col'>
                            <div className='col'>
                                <GeneralInfoComponent
                                    session={session}
                                    vendor={vendor}
                                    setVendor={setVendor}
                                    componentPayload={componentPayload}
                                    setComponentPayload={setComponentPayload}
                                />
                                <RolesInformation
                                    session={session}
                                    componentOwner={componentOwner}
                                    setComponentOwner={setComponentOwner}
                                    moderator={moderator}
                                    setModerator={setModerator}
                                    componentPayload={componentPayload}
                                    setComponentPayload={setComponentPayload}
                                />
                                <div className='row mb-4'>
                                    <AddAdditionalRolesComponent
                                        documentType={DocumentTypes.COMPONENT}
                                        roles={roles}
                                        setRoles={setRoles}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}
