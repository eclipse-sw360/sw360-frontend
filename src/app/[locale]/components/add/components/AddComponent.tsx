// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AddAdditionalRoles, AddKeyValue, SearchUsersModal } from 'next-sw360'
import { ReactNode, useEffect, useState } from 'react'
import { Col, ListGroup, Row, Tab } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import GeneralInfoComponent from '@/components/GeneralInfoComponent/GeneralInfoComponent'
import RolesInformation from '@/components/RolesInformation/RolesInformation'
import { useConfigValue } from '@/contexts'
import {
    Component,
    ComponentPayload,
    DocumentTypes,
    InputKeyValue,
    UIConfigKeys,
    UserGroupType,
    Vendor,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

function AddComponent(): ReactNode {
    const t = useTranslations('default')
    const router = useRouter()
    const { data: session, status } = useSession()
    const [externalIds, setExternalIds] = useState<InputKeyValue[]>([])
    const [addtionalData, setAddtionalData] = useState<InputKeyValue[]>([])
    const [vendor, setVendor] = useState<Vendor>({
        id: '',
        fullName: '',
    })

    const [componentOwner, setComponentOwner] = useState<{
        [k: string]: string
    }>({})

    const [moderators, setModerators] = useState<{
        [k: string]: string
    }>({})

    const [componentPayload, setComponentPayload] = useState<ComponentPayload>({
        name: '',
        createBy: '',
        description: '',
        componentType: '',
        moderators: null,
        modifiedBy: '',
        modifiedOn: '',
        componentOwner: null,
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

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

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

    const handleCancelClick = () => {
        router.push('/components')
    }

    const submit = async () => {
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.POST('components', componentPayload, session.user.access_token)

        if (response.status === StatusCodes.CREATED) {
            const data = (await response.json()) as Component
            router.push('/components/edit/' + data.id)
            MessageService.success(t('Component is created'))
        } else {
            MessageService.error(t('Component is Duplicate'))
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
                <div className='container page-content'>
                    <Tab.Container defaultActiveKey='summary'>
                        <Row>
                            <Col
                                sm={2}
                                className='me-3'
                            >
                                <ListGroup>
                                    <ListGroup.Item
                                        action
                                        eventKey='summary'
                                    >
                                        <div className='my-2'>{t('Summary')}</div>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col className='me-3'>
                                <Row className='mb-3'>
                                    <div
                                        className='px-0 btn-toolbar'
                                        role='toolbar'
                                    >
                                        <div
                                            className='btn-group'
                                            role='group'
                                        >
                                            <button
                                                type='submit'
                                                className='btn btn-primary'
                                            >
                                                {t('Create Component')}
                                            </button>
                                        </div>
                                        <div
                                            className='btn-group'
                                            role='group'
                                        >
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
                                </Row>
                                <Row>
                                    <Tab.Content>
                                        <Tab.Pane eventKey='summary'>
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
                                                <AddAdditionalRoles documentType={DocumentTypes.COMPONENT} />
                                            </div>
                                            <div className='row mb-4'>
                                                <AddKeyValue
                                                    header={t('External Ids')}
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
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Row>
                            </Col>
                        </Row>
                    </Tab.Container>
                </div>
            </form>
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(AddComponent, [
    UserGroupType.SECURITY_USER,
])
