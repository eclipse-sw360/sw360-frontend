// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { AddKeyValueComponent } from '@/components/sw360'
import { AddAdditionalRolesComponent } from '@/components/sw360'
import { SearchUsersModal } from '@/components/sw360'
import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import { useRouter } from 'next/navigation'
import ComponentPayload from '@/object-types/ComponentPayLoad'
import MapData from '@/object-types/MapData'
import { Session } from '@/object-types/Session'
import { SideBar } from '@/components/sw360'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import { toast, TypeOptions, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import GeneralInfoComponent from './GeneralInfoComponent'
import RolesInformation from './RolesInformation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
interface Props {
    session: Session
}

export default function ComponentAddSummary({ session }: Props) {
    const t = useTranslations(COMMON_NAMESPACE)
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const router = useRouter()
    const [componentPayload, setComponentPayload] = useState<ComponentPayload>({
        name: '',
        description: '',
        componentType: '',
        moderators: null,
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

    const tabList = [
        {
            id: CommonTabIds.SUMMARY,
            name: 'Summary',
        },
    ]

    const setAddtionalData = (additionalDatas: Map<string, string>) => {
        const obj = Object.fromEntries(additionalDatas)
        setComponentPayload({
            ...componentPayload,
            additionalData: obj,
        })
    }

    const setExternalIds = (externalIds: Map<string, string>) => {
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
        const response = await ApiUtils.POST('components', componentPayload, session.user.access_token)

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
            <SearchUsersModal />
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
                                                {t('Create Component')}
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
                                    componentPayload={componentPayload}
                                    setComponentPayload={setComponentPayload}
                                />
                                <RolesInformation
                                    session={session}
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
                                    />
                                </div>
                                <div className='row mb-4'>
                                    <AddKeyValueComponent
                                        header={t('Additional Data')}
                                        keyName={'additional data'}
                                        setData={setAddtionalData}
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
