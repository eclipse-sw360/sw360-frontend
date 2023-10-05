// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ToastContainer } from 'react-bootstrap'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { ApiUtils, CommonUtils } from '@/utils'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { Component, InputKeyValue, HttpStatus, Session } from '@/object-types'
import { SearchUsersModal, SideBar } from 'next-sw360'
import AddAdditionalRolesComponent from '@/components/AddAdditionalRoles'
import AddKeyValueComponent from '@/components/AddKeyValue'
import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import ComponentOwner from '@/object-types/ComponentOwner'
import ComponentPayload from '@/object-types/ComponentPayLoad'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import GeneralInfoComponent from '@/components/GeneralInfoComponent/GeneralInfoComponent'
import Moderators from '@/object-types/Moderators'
import RolesInformation from '@/components/RolesInformationComponent/RolesInformation'
import ToastData from '@/object-types/ToastData'
import ToastMessage from '@/components/sw360/ToastContainer/Toast'
import Vendor from '@/object-types/Vendor'
interface Props {
    session: Session
}

export default function ComponentAddSummary({ session }: Props) {
    const t = useTranslations(COMMON_NAMESPACE)
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [externalIds, setExternalIds] = useState<InputKeyValue[]>([])
    const [addtionalData, setAddtionalData] = useState<InputKeyValue[]>([])
    const [roles, setRoles] = useState<InputKeyValue[]>([])
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

    const tabList = [
        {
            id: CommonTabIds.SUMMARY,
            name: 'Summary',
        },
    ]

    const [toastData, setToastData] = useState<ToastData>({
        show: false,
        type: '',
        message: '',
        contextual: '',
    })

    const alert = (show_data: boolean, status_type: string, message: string, contextual: string) => {
        setToastData({
            show: show_data,
            type: status_type,
            message: message,
            contextual: contextual,
        })
    }

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

    const setDataRoles = (roles: InputKeyValue[]) => {
        const roleDatas = CommonUtils.convertRoles(roles)
        setComponentPayload({
            ...componentPayload,
            roles: roleDatas,
        })
    }

    const handleCancelClick = () => {
        router.push('/components')
    }

    const submit = async () => {
        const response = await ApiUtils.POST('components', componentPayload, session.user.access_token)

        if (response.status == HttpStatus.CREATED) {
            const data = (await response.json()) as Component
            alert(true, 'Success', t('Component is created'), 'success')
            router.push('/components/detail/' + data.id)
        } else {
            alert(true, 'Duplicate', t('Component is Duplicate'), 'danger')
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
                    void submit()
                }}
            >
                <ToastContainer position='top-start'>
                    <ToastMessage
                        show={toastData.show}
                        type={toastData.type}
                        message={toastData.message}
                        contextual={toastData.contextual}
                        onClose={() => setToastData({ ...toastData, show: false })}
                        setShowToast={setToastData}
                    />
                </ToastContainer>
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
                                        setDataRoles={setDataRoles}
                                        roles={roles}
                                        setRoles={setRoles}
                                    />
                                </div>
                                <div className='row mb-4'>
                                    <AddKeyValueComponent
                                        header={t('External Ids')}
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
