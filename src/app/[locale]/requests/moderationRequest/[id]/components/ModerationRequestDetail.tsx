// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { HttpStatus, ModerationRequestDetails, ModerationRequestPayload } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Button, Card, Col, Collapse, Row, Tab } from 'react-bootstrap'
import ModerationDecision from './ModerationDecision'
import ModerationRequestInfo from './ModerationRequestInfo'
import ProposedChanges from './ProposedChanges'
import CurrentComponentDetail from './currentComponent/CurrentComponentDetail'
import CurrentProjectDetail from './currentProject/CurrentProjectDetail'
import CurrentReleaseDetail from './currentRelease/CurrentReleaseDetail'

function ModerationRequestDetail({ moderationRequestId }: { moderationRequestId: string }): ReactNode | undefined {
    const t = useTranslations('default')
    const [openCardIndex, setOpenCardIndex] = useState<number>(0)
    const { status } = useSession()
    const router = useRouter()
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
    const toastShownRef = useRef(false)

    const fetchData = async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as ModerationRequestDetails
            return data
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            notFound()
        }
    }

    useEffect(() => {
        if (!toastShownRef.current) {
            MessageService.success(t('You have assigned yourself to this moderation request'))
            toastShownRef.current = true
        }

        void fetchData(`moderationrequest/${moderationRequestId}`).then(
            (moderationRequestDetails: ModerationRequestDetails | undefined) => {
                setModerationRequestData(moderationRequestDetails)
            },
        )
    }, [])

    const handleCommentValidation = () => {
        if (!moderationRequestPayload.comment.trim()) {
            return false
        }
        return true
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
                if (response.status == HttpStatus.ACCEPTED) {
                    await response.json()
                    MessageService.success(t('You have accepted the moderation request'))
                    router.push('/requests')
                } else if (response.status == HttpStatus.UNAUTHORIZED) {
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
                if (response.status == HttpStatus.ACCEPTED) {
                    await response.json()
                    MessageService.success(t('You have rejected the moderation request'))
                    router.push('/requests')
                } else if (response.status == HttpStatus.UNAUTHORIZED) {
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
                if (response.status == HttpStatus.ACCEPTED) {
                    await response.json()
                    MessageService.success(t('You have postponed the moderation request'))
                    router.push('/requests')
                } else if (response.status == HttpStatus.UNAUTHORIZED) {
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
            if (response.status == HttpStatus.ACCEPTED) {
                await response.json()
                MessageService.success(t('You have unassigned yourself from the moderation request'))
                router.push('/requests')
            } else if (response.status == HttpStatus.CONFLICT) {
                await response.json()
                MessageService.warn(t('You are the last moderator for this request you are not allowed to unsubscribe'))
                router.push('/requests')
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
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

    if (status === 'unauthenticated') {
        return signOut()
    } else {
        return (
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
                            <Row className='mt-3'>
                                <Card className={`${styles['card']}`}>
                                    <div
                                        onClick={() => toggleCollapse(0)}
                                        style={{ cursor: 'pointer', padding: '0' }}
                                    >
                                        <Card.Header
                                            className={`
                                                                ${
                                                                    openCardIndex === 0
                                                                        ? styles['cardHeader-expanded']
                                                                        : ''
                                                                }`}
                                            id={`${styles['cardHeader']}`}
                                        >
                                            <Button
                                                variant='button'
                                                className={`p-0 border-0 ${styles['header-button']}`}
                                                aria-controls='example-collapse-text-1'
                                                aria-expanded={openCardIndex === 0}
                                            >
                                                {t('Moderation Request Information')}
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 0}>
                                        <div id='example-collapse-text-1'>
                                            <Card.Body className={`${styles['card-body']}`}>
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
                                <Card className={`${styles['card']}`}>
                                    <div
                                        onClick={() => toggleCollapse(1)}
                                        style={{ cursor: 'pointer', padding: '0' }}
                                    >
                                        <Card.Header
                                            className={`
                                                                ${
                                                                    openCardIndex === 1
                                                                        ? styles['cardHeader-expanded']
                                                                        : ''
                                                                }`}
                                            id={`${styles['cardHeader']}`}
                                        >
                                            <Button
                                                variant='button'
                                                className={`p-0 border-0 ${styles['header-button']}`}
                                                aria-controls='example-collapse-text-2'
                                                aria-expanded={openCardIndex === 1}
                                            >
                                                {t('Proposed Changes')}
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 1}>
                                        <div id='example-collapse-text-2'>
                                            <Card.Body className={`${styles['card-body']}`}>
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
                                <Card className={`${styles['card']}`}>
                                    <div
                                        onClick={() => toggleCollapse(2)}
                                        style={{ cursor: 'pointer', padding: '0' }}
                                    >
                                        <Card.Header
                                            className={`
                                                                ${
                                                                    openCardIndex === 2
                                                                        ? styles['cardHeader-expanded']
                                                                        : ''
                                                                }`}
                                            id={`${styles['cardHeader']}`}
                                        >
                                            <Button
                                                variant='button'
                                                className={`p-0 border-0 ${styles['header-button']}`}
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
                                            <Card.Body className={`${styles['card-body']}`}>
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
        )
    }
}

export default ModerationRequestDetail
