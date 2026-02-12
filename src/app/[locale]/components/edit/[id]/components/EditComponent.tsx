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
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader, SideBar } from 'next-sw360'
import { ReactNode, useEffect, useState } from 'react'
import EditAttachments from '@/components/Attachments/EditAttachments'
import CreateMRCommentDialog from '@/components/CreateMRCommentDialog/CreateMRCommentDialog'
import {
    ActionType,
    Attachment,
    CommonTabIds,
    Component,
    ComponentPayload,
    DocumentTypes,
    Embedded,
    ErrorDetails,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'
import DeleteComponentDialog from '../../../components/DeleteComponentDialog'
import ComponentEditSummary from './ComponentEditSummary'
import Releases from './Releases'

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

const EditComponent = ({ componentId }: Props): ReactNode => {
    const t = useTranslations('default')
    const params = useSearchParams()
    const router = useRouter()
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [component, setComponent] = useState<Component>()
    const [attachmentData, setAttachmentData] = useState<Array<Attachment>>([])
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [showCommentModal, setShowCommentModal] = useState<boolean>(false)
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
        comment: '',
    })
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return

                const queryUrl = CommonUtils.createUrlWithParams(
                    `components/${componentId}`,
                    Object.fromEntries(params),
                )
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }
                const component = (await response.json()) as Component
                setComponent(component)
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()

                const queryUrl = CommonUtils.createUrlWithParams(
                    `components/${componentId}/attachments`,
                    Object.fromEntries(params),
                )
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === StatusCodes.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== StatusCodes.OK) {
                    return notFound()
                }
                const dataAttachments: EmbeddedAttachments = (await response.json()) as EmbeddedAttachments
                if (!CommonUtils.isNullOrUndefined(dataAttachments)) {
                    setAttachmentData(dataAttachments._embedded['sw360:attachments'])
                }
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()

        return () => controller.abort()
    }, [
        params,
        componentId,
    ])

    const updateComponent = async (payload?: ComponentPayload) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const dataToUpdate = payload ?? componentPayload
        const response = await ApiUtils.PATCH(`components/${componentId}`, dataToUpdate, session.user.access_token)
        if (response.status === StatusCodes.OK) {
            MessageService.success(`Component ${dataToUpdate.name}  updated successfully!`)
            router.push('/components/detail/' + componentId)
        } else if (response.status === StatusCodes.ACCEPTED) {
            MessageService.success(t('Moderation request is created'))
            router.push('/components/detail/' + componentId)
        } else {
            const data = await response.json()
            MessageService.error(data.message)
        }
    }

    const checkUpdateEligibility = async (componentId: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const url = CommonUtils.createUrlWithParams(`moderationrequest/validate`, {
            entityType: 'COMPONENT',
            entityId: componentId,
        })
        const response = await ApiUtils.POST(url, {}, session.user.access_token)
        switch (response.status) {
            case StatusCodes.UNAUTHORIZED:
                MessageService.warn(t('Unauthorized request'))
                return 'DENIED'
            case StatusCodes.FORBIDDEN:
                MessageService.warn(t('Access Denied'))
                return 'DENIED'
            case StatusCodes.BAD_REQUEST:
                MessageService.warn(t('Invalid input or missing required parameters'))
                return 'DENIED'
            case StatusCodes.INTERNAL_SERVER_ERROR:
                MessageService.error(t('Internal server error'))
                return 'DENIED'
            case StatusCodes.OK:
                MessageService.info(t('You can write to the entity'))
                return 'OK'
            case StatusCodes.ACCEPTED:
                MessageService.info(t('You are allowed to perform write with MR'))
                return 'ACCEPTED'
            default:
                MessageService.error(t('Error when processing'))
                return 'DENIED'
        }
    }

    const checkPreRequisite = async () => {
        const isEligible = await checkUpdateEligibility(componentId)
        if (isEligible === 'OK') {
            await updateComponent()
        } else if (isEligible === 'ACCEPTED') {
            setShowCommentModal(true)
        } else if (isEligible === 'DENIED') {
            return
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
            onClick: checkPreRequisite,
        },
        'Delete Component': {
            link: '/components/edit/' + componentId,
            type: 'danger',
            name: t('Delete Component'),
            onClick: handleDeleteComponent,
        },
        Cancel: {
            link: '/components/detail/' + componentId,
            type: 'secondary',
            name: t('Cancel'),
        },
    }

    return (
        component && (
            <>
                <CreateMRCommentDialog<ComponentPayload>
                    show={showCommentModal}
                    setShow={setShowCommentModal}
                    updateEntity={updateComponent}
                    setEntityPayload={setComponentPayload}
                />
                <div className='container page-content'>
                    <div className='row'>
                        <DeleteComponentDialog
                            componentId={componentId}
                            show={deleteDialogOpen}
                            setShow={setDeleteDialogOpen}
                            actionType={ActionType.EDIT}
                        />
                        <div className='col-2 sidebar'>
                            <SideBar
                                selectedTab={selectedTab}
                                setSelectedTab={setSelectedTab}
                                tabList={tabList}
                            />
                        </div>
                        <div className='col'>
                            <div
                                className='row'
                                style={{
                                    marginBottom: '20px',
                                }}
                            >
                                <PageButtonHeader
                                    title={component.name}
                                    buttons={headerButtons}
                                ></PageButtonHeader>
                            </div>
                            <div
                                className='row'
                                hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}
                            >
                                <ComponentEditSummary
                                    attachmentData={attachmentData}
                                    componentId={componentId}
                                    componentPayload={componentPayload}
                                    setComponentPayload={setComponentPayload}
                                />
                            </div>
                            <div
                                className='row'
                                hidden={selectedTab !== CommonTabIds.RELEASES ? true : false}
                            >
                                <Releases componentId={componentId} />
                            </div>
                            <div
                                className='row'
                                hidden={selectedTab !== CommonTabIds.ATTACHMENTS ? true : false}
                            >
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
            </>
        )
    )
}

export default EditComponent
