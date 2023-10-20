// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-bootstrap'

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
    ToastData,
} from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { PageButtonHeader, SideBar, ToastMessage } from 'next-sw360'
import DeleteComponentDialog from '../../../components/DeleteComponentDialog'
import ComponentEditSummary from './ComponentEditSummary'
import Releases from './Releases'

interface Props {
    componentId?: string
}

type embeddedAttachments = Embedded<Attachment, 'sw360:attachmentDTOes'>

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

const EditComponent = ({ componentId }: Props) => {
    const t = useTranslations('default')
    const { data: session } = useSession()
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
        attachmentDTOs: null,
    })

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

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
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
                setComponent(await response.json())
            } catch (e) {
                console.error(e)
            }
        })()
        ;(async () => {
            try {
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
                const dataAttachments: embeddedAttachments = await response.json()
                if (!CommonUtils.isNullOrUndefined(dataAttachments)) {
                    setAttachmentData(dataAttachments._embedded['sw360:attachmentDTOes'])
                }
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [params, session, componentId])

    const submit = async () => {
        const response = await ApiUtils.PATCH(`components/${componentId}`, componentPayload, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            alert(true, 'Success', `Success:Component ${componentPayload.name}  updated successfully!`, 'success')
            router.push('/components/detail/' + componentId)
        } else {
            alert(true, 'Duplicate', t('Edit Component Fail'), 'danger')
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
            <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
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
                        <div className='row' hidden={selectedTab != CommonTabIds.ATTACHMENTS ? true : false}>
                            <EditAttachments
                                documentId={componentId}
                                documentType={DocumentTypes.COMPONENT}
                                componentPayload={componentPayload}
                                setComponentPayload={setComponentPayload}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

export default EditComponent
