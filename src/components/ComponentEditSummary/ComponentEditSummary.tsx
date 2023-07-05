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
import SearchUsersModalComponent from '@/components/SearchUsersModal'
import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import { notFound, useRouter } from 'next/navigation'
import ComponentPayload from '@/object-types/ComponentPayLoad'
import MapData from '@/object-types/MapData'
import { Session } from '@/object-types/Session'
import { SideBar } from '@/components/sw360'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import { toast, TypeOptions, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { signOut } from 'next-auth/react'
import GeneralInfoComponent from '../ComponentAddSummary/GeneralInfoComponent'
import RolesInformation from '../ComponentAddSummary/RolesInformation'
import Vendor from '@/object-types/Vendor'
import ComponentOwner from '@/object-types/ComponentOwner'
import Moderators from '@/object-types/Moderators'
interface Props {
    session: Session
    componentId: string
}

export default function ComponentEditSummary({ session, componentId}: Props) {
    const t = useTranslations(COMMON_NAMESPACE);
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [externalIds,setExternalIds] = useState<Input[]>([])
    const [addtionalData,setAddtionalData] = useState<Input[]>([])
    const [vendor, setVendor] = useState<Vendor> ({
        id: '',
        fullName: ''
    })

    const [componentOwner, setComponentOwner] = useState<ComponentOwner> ({
        email: '',
        fullName: ''
    })

    const [moderator, setModerator] = useState<Moderators> ({
        emails: null,
        fullName: ''
    })
    const router = useRouter()
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

    const handlerModerators = (emails: any[]) => {
        const fullNames: string[] = []
        const moderatorsEmail: string[] = []
        if (emails.length == 0) {
            return ;
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
        setModerator(moderatorsResponse)
    }

    const convertObjectToMap = (data: string) => {
        const map = new Map(Object.entries(data));
        const inputs: Input[] = []
        map.forEach((value, key) => {
            const input: Input = {
                key: key,
                value: value
            }
            inputs.push(input)
        })
        return inputs
    }

    useEffect(() => {
        fetchData(`components/${componentId}`).then((component: any) => {

            console.log(component.roles)

            if (typeof component.externalIds !== "undefined") {
                setExternalIds(convertObjectToMap(component.externalIds))
            }

            if (typeof component.additionalData !== "undefined") {
                setAddtionalData(convertObjectToMap(component.additionalData))
            }

            if (typeof component['_embedded']['sw360:moderators'] !== "undefined") {
                handlerModerators(component['_embedded']['sw360:moderators'])
            }

            if (typeof component['_embedded']['defaultVendor'] !== "undefined") {
                const vendor: Vendor = {
                    id: component.defaultVendorId,
                    fullName: component['_embedded']['defaultVendor']['fullName']
                }
                setVendor(vendor)
            }

            if (typeof component['_embedded']['componentOwner'] !== "undefined") {
                const componentOwner: ComponentOwner = {
                    email: component['_embedded']['componentOwner']['email'],
                    fullName: component['_embedded']['componentOwner']['fullName']
                }
                setComponentOwner(componentOwner)
            }

            let modifiedBy = '';
            if (typeof component['_embedded']['modifiedBy'] !== "undefined") {
                modifiedBy = component['_embedded']['modifiedBy']['fullName'];
            }

            let creatBy = '';
            if (typeof component['_embedded']['modifiedBy'] !== "undefined") {
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
                externalIds: null,
                additionalData: null,
                defaultVendorId: '',
                categories: component.categories,
                homepage: component.homepage,
                mailinglist: component.mailinglist,
                wiki: component.wiki,
                blog: component.blog,
            }
            setComponentPayload(componentPayloadData)
        })
    }, [componentId, fetchData])

    const tabList = [
        {
            id: CommonTabIds.SUMMARY,
            name: 'Summary',
        },
    ]

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

    const setRoles = (roles: MapData[]) => {
        const roleDatas = convertRoles(roles)
        setComponentPayload({
            ...componentPayload,
            roles: roleDatas,
        })
    }

    const handleCancelClick = () => {
        router.push('/components')
    }

    const convertRoles = (datas: any[]) => {
        const contributors: string[] = []
        const commiters: string[] = []
        const expecters: string[] = []
        datas.forEach((data) => {
            if (data.role === 'Contributor') {
                contributors.push(data.email)
            } else if (data.role === 'Committer') {
                commiters.push(data.email)
            } else if (data.role === 'Expert') {
                expecters.push(data.email)
            }
        })
        const roles = {
            Contributor: contributors,
            Committer: commiters,
            Expert: expecters,
        }
        return roles
    }

    const notify = (text: string, type: TypeOptions) =>
        toast(text, {
            type,
            position: toast.POSITION.TOP_LEFT,
            theme: 'colored',
        })

    const submit = async () => {
        const response = await ApiUtils.PUT('components', componentPayload, session.user.access_token)

        if (response.status == HttpStatus.CREATED) {
            const data = await response.json()
            notify(t('Component is created'), 'success')
            router.push('/components/detail/' + data.id)
        } else {
            notify(t('Component is Duplicate'), 'error')
        }
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
                    submit()
                }}
            >
                <ToastContainer className='foo' style={{ width: '300px', height: '100px' }} />
                <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
                    <div className='row'>
                        <div className='col-2 sidebar'>
                            <SideBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabList={tabList} />
                        </div>
                        <div className='col'>
                            <div className='row' style={{ marginBottom: '20px' }}>
                                <div className='col-auto'>
                                    <div className='btn-toolbar' role='toolbar'>
                                        <div className='btn-group' role='group'>
                                            <button type='submit' className='btn btn-primary'>
                                                {t('Update Component')}
                                            </button>
                                        </div>
                                        <div className='btn-group' role='group'>
                                            <button
                                                type='button'
                                                id='mergeButton'
                                                className='btn btn-secondary'
                                                onClick={handleCancelClick}
                                            >
                                                {t('Cancel')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                    </div>
                </div>
            </form>
        </>
    )
}
