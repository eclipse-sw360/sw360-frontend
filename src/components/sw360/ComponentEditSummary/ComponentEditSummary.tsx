// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { notFound } from 'next/navigation'
import ComponentPayload from '@/object-types/ComponentPayLoad'
import { Session } from '@/object-types/Session'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { useCallback, useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import GeneralInfoComponent from '../ComponentAddSummary/GeneralInfoComponent'
import Vendor from '@/object-types/Vendor'
import SearchUsersModalComponent from '../SearchUsersModal/SearchUsersModal'

interface Props {
    session?: Session
    componentId?: string
}

export default function ComponentEditSummary({ session, componentId }: Props) {
    const [vendor, setVendor] = useState<Vendor>({
        id: '',
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
            if (typeof component['_embedded']['defaultVendor'] !== 'undefined') {
                const vendor: Vendor = {
                    id: component.defaultVendorId,
                    fullName: component['_embedded']['defaultVendor']['fullName'],
                }
                setVendor(vendor)
            }

            let modifiedBy = ''
            if (typeof component['_embedded']['modifiedBy'] !== 'undefined') {
                modifiedBy = component['_embedded']['modifiedBy']['fullName']
            }

            let creatBy = ''
            if (typeof component['_embedded']['modifiedBy'] !== 'undefined') {
                creatBy = component['_embedded']['createdBy']['fullName']
            }

            const componentPayloadData: ComponentPayload = {
                name: component.name,
                createBy: creatBy,
                description: component.description,
                componentType: component.componentType,
                moderators: null,
                modifiedBy: modifiedBy,
                modifiedOn: component.modifiedOn,
                componentOwner: '',
                ownerAccountingUnit: component.ownerAccountingUnit,
                ownerGroup: component.ownerGroup,
                ownerCountry: component.ownerCountry,
                roles: null,
                externalIds: component.externalIds,
                additionalData: component.additionalData,
                defaultVendorId: component.defaultVendorId,
                categories: component.categories,
                homepage: component.homepage,
                mailinglist: component.mailinglist,
                wiki: component.wiki,
                blog: component.blog,
            }
            setComponentPayload(componentPayloadData)
        })
    }, [componentId, fetchData])

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
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}
