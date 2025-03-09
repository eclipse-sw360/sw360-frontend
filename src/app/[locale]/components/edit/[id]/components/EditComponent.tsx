// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

import EditAttachments from '@/components/Attachments/EditAttachments'
import {
    ActionType,
    Attachment,
    CommonTabIds,
    Component,
    ComponentPayload,
    DocumentTypes,
    Embedded,
    HttpStatus,
} from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { PageButtonHeader, SideBar } from 'next-sw360'
import DeleteComponentDialog from '../../../components/DeleteComponentDialog'
import ComponentEditSummary from './ComponentEditSummary'
import Releases from './Releases'
import MessageService from '@/services/message.service'

interface Props {
    componentId: string
}

type EmbeddedAttachments = Embedded<Attachment, 'sw360:attachments'>

const tabList = [
    {
        id: CommonTabIds.SUMMARY,
        name: 'Summary',
    },
    {
        id: CommonTabIds.RELEASES,
        name: 'Release',
    },
    {
        id: CommonTabIds.ATTACHMENTS,
        name: 'Attachments',
    },
]

const EditComponent = ({ componentId }: Props) : ReactNode => {
    const t = useTranslations('default')
    const params = useSearchParams()
    const router = useRouter()
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [component, setComponent] = useState<Component>()
    const [attachmentData, setAttachmentData] = useState<Array<Attachment>>([])
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
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
        attachments: null,
    })

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session))
                    return signOut()

                const queryUrl = CommonUtils.createUrlWithParams(
                    `components/${componentId}`,
                    Object.fromEntries(params)
                )
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const component = await response.json() as Component
                setComponent(component)
            } catch (e) {
                console.error(e)
            }
        })()
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session))
                    return signOut()

                const queryUrl = CommonUtils.createUrlWithParams(
                    `components/${componentId}/attachments`,
                    Object.fromEntries(params)
                )
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const dataAttachments: EmbeddedAttachments = await response.json() as EmbeddedAttachments
                if (!CommonUtils.isNullOrUndefined(dataAttachments)) {
                    setAttachmentData(dataAttachments._embedded['sw360:attachments'])
                }
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [params, componentId])

    const submit = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session))
            return
        const response = await ApiUtils.PATCH(`components/${componentId}`, componentPayload, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            MessageService.success(`Component ${componentPayload.name}  updated successfully!`)
            router.push('/components/detail/' + componentId)
        } else if (response.status === HttpStatus.ACCEPTED) {
            MessageService.success(t('Moderation request is created'))
            router.push('/components/detail/' + componentId)
        } else {
            const data = await response.json()
            MessageService.error(data.message)
        }
    }

    const handleDeleteComponent = () => {
        setDeleteDialogOpen(true)
    }

    const headerButtons = {
        'Update Component': {
            link: '/components/edit/' + componentId,
            type: 'primary',
            name: t('Update Component'),
            onClick: submit,
        },
        'Delete Component': {
            link: '/components/edit/' + componentId,
            type: 'danger',
            name: t('Delete Component'),
            onClick: handleDeleteComponent,
        },
        Cancel: { link: '/components/detail/' + componentId, type: 'secondary', name: t('Cancel') },
    }

    return (
        component && (
            <div className='container page-content'>
                <div className='row'>
                    <DeleteComponentDialog
                        componentId={componentId}
                        show={deleteDialogOpen}
                        setShow={setDeleteDialogOpen}
                        actionType={ActionType.EDIT}
                    />
                    <div className='col-2 sidebar'>
                        <SideBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabList={tabList} />
                    </div>
                    <div className='col'>
                        <div className='row' style={{ marginBottom: '20px' }}>
                            <PageButtonHeader title={component.name} buttons={headerButtons}></PageButtonHeader>
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}>
                            <ComponentEditSummary
                                attachmentData={attachmentData}
                                componentId={componentId}
                                componentPayload={componentPayload}
                                setComponentPayload={setComponentPayload}
                            />
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.RELEASES ? true : false}>
                            <Releases componentId={componentId} />
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.ATTACHMENTS ? true : false}>
                            <EditAttachments
                                documentId={componentId}
                                documentType={DocumentTypes.COMPONENT}
                                documentPayload={componentPayload}
                                setDocumentPayload={setComponentPayload}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

export default EditComponent
