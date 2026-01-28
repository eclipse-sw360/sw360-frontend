// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { notFound, useParams, useRouter } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'
import { Breadcrumb, Button, Card, Col, Collapse, Row, Tab } from 'react-bootstrap'

import { AccessControl } from '@/components/AccessControl/AccessControl'
import { ModerationRequestDetails, ModerationRequestPayload, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import CurrentComponentDetail from './currentComponent/CurrentComponentDetail'
import CurrentProjectDetail from './currentProject/CurrentProjectDetail'
import CurrentReleaseDetail from './currentRelease/CurrentReleaseDetail'
import ModerationDecision from './ModerationDecision'
import ModerationRequestInfo from './ModerationRequestInfo'
import ProposedChanges from './ProposedChanges'

function ModerationRequestDetail({ moderationRequestId }: { moderationRequestId: string }): ReactNode | undefined {
    const t = useTranslations('default')
    const [openCardIndex, setOpenCardIndex] = useState<number>(0)
    const { status } = useSession()
    const router = useRouter()
    const param = useParams()
    const locale = (param.locale as string) || 'en'
    const requestsPath = `/${locale}/requests`
    const [moderationRequestData, setModerationRequestData] = useState<ModerationRequestDetails | undefined>({
        id: '',
        revision: '',
        timestamp: undefined,
        timestampOfDecision: undefined,
        documentId: '',
        documentType: '',
        requestingUser: '',
        moderators: [],
        documentName: '',
        moderationState: '',
        reviewer: '',
        requestDocumentDelete: false,
        requestingUserDepartment: '',
        componentType: '',
        commentRequestingUser: '',
        commentDecisionModerator: undefined,
        componentAdditions: {},
        releaseAdditions: {},
        projectAdditions: {},
        licenseAdditions: {},
        user: {},
        componentDeletions: {},
        releaseDeletions: {},
        projectDeletions: {},
        licenseDeletions: {},
        moderatorsSize: undefined,
    })
    const [moderationRequestPayload, setModerationRequestPayload] = useState<ModerationRequestPayload>({
        action: '',
        comment: '',
    })
    const [isAssignedModerator, setIsAssignedModerator] = useState<boolean>(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const fetchData = async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == StatusCodes.OK) {
            const data = (await response.json()) as ModerationRequestDetails
            return data
        } else if (response.status == StatusCodes.UNAUTHORIZED) {
            return signOut()
        } else {
            notFound()
        }
    }

    useEffect(() => {
        const load = async () => {
            const moderationRequestDetails = await fetchData(`moderationrequest/${moderationRequestId}`)
            setModerationRequestData(moderationRequestDetails)
        }
        void load()

        // Call assignModerationRequest on page load
        void assignModerationRequest()
    }, [])

    const handleCommentValidation = () => {
        if (!moderationRequestPayload.comment.trim()) {
            return false
        }
        return true
    }

    const assignModerationRequest = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const updatedAssignPayload = {
                ...moderationRequestPayload,
                action: 'ASSIGN',
            }
            setModerationRequestPayload(updatedAssignPayload)
            const response = await ApiUtils.PATCH(
                `moderationrequest/${moderationRequestId}`,
                updatedAssignPayload,
                session.user.access_token,
            )
            if (response.status == StatusCodes.ACCEPTED) {
                await response.json()
                setIsAssignedModerator(true)
                MessageService.success(t('You have assigned yourself to this moderation request'))
            } else if (response.status == StatusCodes.UNAUTHORIZED) {
                return signOut()
            } else {
                return notFound()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleAcceptModerationRequest = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const hasComment = handleCommentValidation()
            if (hasComment) {
                const updatedAcceptPayload = {
                    ...moderationRequestPayload,
                    action: 'ACCEPT',
                }
                setModerationRequestPayload(updatedAcceptPayload)
                const response = await ApiUtils.PATCH(
                    `moderationrequest/${moderationRequestId}`,
                    updatedAcceptPayload,
                    session.user.access_token,
                )
                if (response.status == StatusCodes.ACCEPTED) {
                    await response.json()
                    MessageService.success(t('You have accepted the moderation request'))
                    router.push('/requests')
                } else if (response.status == StatusCodes.UNAUTHORIZED) {
                    return signOut()
                } else {
                    MessageService.error(t('There are some errors while updating moderation request'))
                    router.push(`/requests/moderationRequest/${moderationRequestId}`)
                }
            } else {
                MessageService.error(t('Mandatory fields are empty please provide required data'))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleRejectModerationRequest = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const hasComment = handleCommentValidation()
            if (hasComment) {
                const updatedRejectPayload = {
                    ...moderationRequestPayload,
                    action: 'REJECT',
                }
                setModerationRequestPayload(updatedRejectPayload)
                const response = await ApiUtils.PATCH(
                    `moderationrequest/${moderationRequestId}`,
                    updatedRejectPayload,
                    session.user.access_token,
                )
                if (response.status == StatusCodes.ACCEPTED) {
                    await response.json()
                    MessageService.success(t('You have rejected the moderation request'))
                    router.push('/requests')
                } else if (response.status == StatusCodes.UNAUTHORIZED) {
                    return signOut()
                } else {
                    MessageService.error(t('There are some errors while updating moderation request'))
                    router.push(`/requests/moderationRequest/${moderationRequestId}`)
                }
            } else {
                MessageService.error(t('Mandatory fields are empty please provide required data'))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handlePostponeModerationRequest = async () => {
        try {
            const hasComment = handleCommentValidation()
            if (hasComment) {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const updatedPostponePayload = {
                    ...moderationRequestPayload,
                    action: 'POSTPONE',
                }
                setModerationRequestPayload(updatedPostponePayload)
                const response = await ApiUtils.PATCH(
                    `moderationrequest/${moderationRequestId}`,
                    updatedPostponePayload,
                    session.user.access_token,
                )
                if (response.status == StatusCodes.ACCEPTED) {
                    await response.json()
                    MessageService.success(t('You have postponed the moderation request'))
                    router.push('/requests')
                } else if (response.status == StatusCodes.UNAUTHORIZED) {
                    return signOut()
                } else {
                    MessageService.error(t('There are some errors while updating moderation request'))
                    router.push(`/requests/moderationRequest/${moderationRequestId}`)
                }
            } else {
                MessageService.error(t('Mandatory fields are empty please provide required data'))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleUnassignModerationRequest = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const updatedUnassignPayload = {
                ...moderationRequestPayload,
                action: 'UNASSIGN',
            }
            setModerationRequestPayload(updatedUnassignPayload)
            const response = await ApiUtils.PATCH(
                `moderationrequest/${moderationRequestId}`,
                updatedUnassignPayload,
                session.user.access_token,
            )
            if (response.status == StatusCodes.ACCEPTED) {
                await response.json()
                MessageService.success(t('You have unassigned yourself from the moderation request'))
                router.push('/requests')
            } else if (response.status == StatusCodes.CONFLICT) {
                await response.json()
                MessageService.warn(t('You are the last moderator for this request you are not allowed to unsubscribe'))
                router.push('/requests')
            } else if (response.status == StatusCodes.UNAUTHORIZED) {
                return signOut()
            } else {
                MessageService.error(t('There are some errors while updating moderation request'))
                router.push(`/requests/moderationRequest/${moderationRequestId}`)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleCancel = () => {
        router.push('/requests')
    }

    const toggleCollapse = (index: number) => {
        setOpenCardIndex((prevIndex) => (prevIndex === index ? -1 : index))
    }

    // Check if user is assigned as moderator based on assignment status
    const canShowModerationActions = () => {
        return isAssignedModerator
    }

    return (
        <>
            <Breadcrumb className='container page-content'>
                <Breadcrumb.Item
                    linkAs={Link}
                    href={requestsPath}
                >
                    {t('Requests')}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    {moderationRequestData &&
                    (moderationRequestData.documentType === 'COMPONENT' ||
                        moderationRequestData.documentType === 'RELEASE')
                        ? `${moderationRequestData.documentName} (${moderationRequestData.componentType})`
                        : moderationRequestData?.documentName || moderationRequestId}
                </Breadcrumb.Item>
            </Breadcrumb>
            <div className='ms-5 mt-2'>
                <Tab.Container>
                    <Row>
                        <Row>
                            <Col
                                lg={12}
                                className='text-truncate buttonheader-title me-3'
                            >
                                {moderationRequestData &&
                                    (moderationRequestData.documentType === 'COMPONENT' ||
                                        moderationRequestData.documentType === 'RELEASE') &&
                                    `${moderationRequestData.documentName}
                            (${moderationRequestData.componentType})`}
                                {moderationRequestData &&
                                    moderationRequestData.documentType === 'PROJECT' &&
                                    `${moderationRequestData.documentName}`}
                            </Col>
                        </Row>
                        <Col className='ps-2 me-3 mt-3'>
                            {canShowModerationActions() && (
                                <Row className='d-flex justify-content-between'>
                                    <Col lg={6}>
                                        <Row>
                                            <Button
                                                variant='success'
                                                className='me-2 col-auto'
                                                onClick={handleAcceptModerationRequest}
                                            >
                                                {t('Accept Request')}
                                            </Button>
                                            <Button
                                                variant='danger'
                                                className='me-2 col-auto'
                                                onClick={handleRejectModerationRequest}
                                            >
                                                {t('Decline Request')}
                                            </Button>
                                            <Button
                                                variant='secondary'
                                                className='me-2 col-auto'
                                                onClick={handlePostponeModerationRequest}
                                            >
                                                {t('Postpone Request')}
                                            </Button>
                                            <Button
                                                variant='secondary'
                                                className='me-2 col-auto'
                                                onClick={handleUnassignModerationRequest}
                                            >
                                                {t('Remove Me From Moderators')}
                                            </Button>
                                            <Button
                                                variant='dark'
                                                className='me-2 col-auto'
                                                onClick={handleCancel}
                                            >
                                                {t('Cancel')}
                                            </Button>
                                        </Row>
                                    </Col>
                                </Row>
                            )}
                            <Row className='mt-3'>
                                <Card className='request-card'>
                                    <div
                                        onClick={() => toggleCollapse(0)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '0',
                                        }}
                                    >
                                        <Card.Header
                                            className={openCardIndex === 0 ? 'request-card-header-expanded' : ''}
                                            id='request-card-header'
                                        >
                                            <Button
                                                variant='button'
                                                className='p-0 border-0 request-header-button'
                                                aria-controls='example-collapse-text-1'
                                                aria-expanded={openCardIndex === 0}
                                            >
                                                {t('Moderation Request Information')}
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 0}>
                                        <div id='example-collapse-text-1'>
                                            <Card.Body className='request-card-body'>
                                                <div className='row'>
                                                    <div className='col'>
                                                        <ModerationRequestInfo data={moderationRequestData} />
                                                    </div>
                                                    <div className='col'>
                                                        <ModerationDecision
                                                            data={moderationRequestData}
                                                            moderationRequestPayload={moderationRequestPayload}
                                                            setModerationRequestPayload={setModerationRequestPayload}
                                                        />
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </div>
                                    </Collapse>
                                </Card>
                            </Row>
                            <Row>
                                <Card className='request-card'>
                                    <div
                                        onClick={() => toggleCollapse(1)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '0',
                                        }}
                                    >
                                        <Card.Header
                                            className={openCardIndex === 1 ? 'request-card-header-expanded' : ''}
                                            id='request-card-header'
                                        >
                                            <Button
                                                variant='button'
                                                className='p-0 border-0 request-header-button'
                                                aria-controls='example-collapse-text-2'
                                                aria-expanded={openCardIndex === 1}
                                            >
                                                {t('Proposed Changes')}
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 1}>
                                        <div id='example-collapse-text-2'>
                                            <Card.Body className='request-card-body'>
                                                <div className='row'>
                                                    <div className='col'>
                                                        <ProposedChanges
                                                            moderationRequestData={moderationRequestData}
                                                        />
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </div>
                                    </Collapse>
                                </Card>
                            </Row>
                            <Row>
                                <Card className='request-card'>
                                    <div
                                        onClick={() => toggleCollapse(2)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '0',
                                        }}
                                    >
                                        <Card.Header
                                            className={openCardIndex === 2 ? 'request-card-header-expanded' : ''}
                                            id='request-card-header'
                                        >
                                            <Button
                                                variant='button'
                                                className='p-0 border-0 request-header-button'
                                                aria-controls='example-collapse-text-3'
                                                aria-expanded={openCardIndex === 2}
                                            >
                                                {(moderationRequestData?.documentType === 'COMPONENT' &&
                                                    t('Current Component')) ||
                                                    (moderationRequestData?.documentType === 'RELEASE' &&
                                                        t('Current Release')) ||
                                                    (moderationRequestData?.documentType === 'PROJECT' &&
                                                        t('Current Project')) ||
                                                    (moderationRequestData?.documentType === 'LICENSE' &&
                                                        t('Current License'))}
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 2}>
                                        <div id='example-collapse-text-3'>
                                            <Card.Body className='request-card-body'>
                                                {(moderationRequestData?.documentType === 'COMPONENT' && (
                                                    <CurrentComponentDetail
                                                        componentId={moderationRequestData.documentId}
                                                    />
                                                )) ||
                                                    (moderationRequestData?.documentType === 'PROJECT' && (
                                                        <CurrentProjectDetail
                                                            projectId={moderationRequestData.documentId}
                                                        />
                                                    )) ||
                                                    (moderationRequestData?.documentType === 'RELEASE' && (
                                                        <CurrentReleaseDetail
                                                            releaseId={moderationRequestData.documentId}
                                                        />
                                                    ))}
                                            </Card.Body>
                                        </div>
                                    </Collapse>
                                </Card>
                            </Row>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(ModerationRequestDetail, [
    UserGroupType.SECURITY_USER,
])
