// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE


'use client'

import { HttpStatus, ModerationRequestPayload } from '@/object-types'
import { ApiUtils } from '@/utils/index'
import { notFound, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { signOut, useSession } from 'next-auth/react'
import styles from '../moderationRequestDetail.module.css'
import { Button, Col, Row, Tab, Card, Collapse } from 'react-bootstrap'
import { ModerationRequestDetails } from '@/object-types'
import ModerationRequestInfo from './ModerationRequestInfo'
import ModerationDecision from './ModerationDecision'
import MessageService from '@/services/message.service'
import ProposedChanges from './ProposedChanges'
import CurrentProjectDetail from './currentProject/CurrentProjectDetail'
import CurrentReleaseDetail from './currentRelease/CurrentReleaseDetail'
import CurrentComponentDetail from './currentComponent/CurrentComponentDetail'


function ModerationRequestDetail({ moderationRequestId }: { moderationRequestId: string }) {

    const t = useTranslations('default')
    const [openCardIndex, setOpenCardIndex] = useState<number>(0);
    const { data: session, status } = useSession()
    const router = useRouter()
    const [moderationRequestData, setModerationRequestData] = useState<ModerationRequestDetails>({
        id: '',
        revision: '',
        timestamp: null,
        timestampOfDecision: null,
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
        commentDecisionModerator: null,
        componentAdditions: {},
        releaseAdditions: {},
        projectAdditions: {},
        licenseAdditions: {},
        user: {},
        componentDeletions: {},
        releaseDeletions: {},
        projectDeletions: {},
        licenseDeletions: {},
        moderatorsSize: null
    })
    const [moderationRequestPayload, setModerationRequestPayload] =
                                         useState<ModerationRequestPayload | undefined>({
        action: ''
    })

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as ModerationRequestDetails
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[session]
    )

    useEffect(() => {
        void fetchData(`moderationrequest/${moderationRequestId}`).then(
                      (moderationRequestDetails: ModerationRequestDetails) => {
            setModerationRequestData(moderationRequestDetails)
            console.log(moderationRequestData)
        })}, [fetchData, session])


    const handleAcceptModerationRequest = async () => {
        const updatedAcceptPayload = {
            ...moderationRequestPayload,
            action: "ACCEPT"
        }
        setModerationRequestPayload(updatedAcceptPayload)
        const response = await ApiUtils.PATCH(`moderationrequest/${moderationRequestId}`,
                                               updatedAcceptPayload,
                                               session.user.access_token)
        if (response.status == HttpStatus.ACCEPTED) {
            await response.json()
            MessageService.success(t('You have accepted the moderation request'))
            router.push('/requests')
        }
        else if (response.status == HttpStatus.UNAUTHORIZED) {
            return signOut()
        }
        else {
            MessageService.error(t('There are some errors while updating moderation request'))
            router.push(`/requests/moderationRequest/${moderationRequestId}`)
        }
    };

    const handleRejectModerationRequest = async () => {
        const updatedRejectPayload = {
            ...moderationRequestPayload,
            action: "REJECT"
        }
        setModerationRequestPayload(updatedRejectPayload)
        const response = await ApiUtils.PATCH(`moderationrequest/${moderationRequestId}`,
                                               updatedRejectPayload,
                                               session.user.access_token)
        if (response.status == HttpStatus.ACCEPTED) {
            await response.json()
            MessageService.success(t('You have rejected the moderation request'))
            router.push('/requests')
        }
        else if (response.status == HttpStatus.UNAUTHORIZED) {
            return signOut()
        }
        else {
            MessageService.error(t('There are some errors while updating moderation request'))
            router.push(`/requests/moderationRequest/${moderationRequestId}`)
        }
    };

    const handleUnassignModerationRequest = async () => {
        const updatedUnassignPayload = {
            ...moderationRequestPayload,
            action: "UNASSIGN"
        }
        setModerationRequestPayload(updatedUnassignPayload)
        const response = await ApiUtils.PATCH(`moderationrequest/${moderationRequestId}`,
                                               updatedUnassignPayload,
                                               session.user.access_token)
        if (response.status == HttpStatus.ACCEPTED) {
            await response.json()
            MessageService.success(t('You have unassigned yourself from the moderation request'))
            router.push('/requests')
        }
        else if (response.status == HttpStatus.CONFLICT) {
            await response.json()
            MessageService.warn(t('You are the last moderator for this request you are not allowed to unsubscribe'))
            router.push('/requests')
        }
        else if (response.status == HttpStatus.UNAUTHORIZED) {
            return signOut()
        }
        else {
            MessageService.error(t('There are some errors while updating moderation request'))
            router.push(`/requests/moderationRequest/${moderationRequestId}`)
        }
    };

    const handleCancel = () => {
        router.push('/requests')
    }

    const toggleCollapse = (index: number) => {
        setOpenCardIndex(prevIndex => (prevIndex === index ? -1 : index));
    };


    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <div className='ms-5 mt-2'>
                <Tab.Container>
                    <Row>
                        <Row>
                            <Col lg={12} className='text-truncate buttonheader-title me-3'>
                                {moderationRequestData &&
                                 (moderationRequestData.documentType === "COMPONENT" ||
                                 moderationRequestData.documentType === "RELEASE") &&
                                `${moderationRequestData.documentName}
                                (${moderationRequestData.componentType})`}
                                {moderationRequestData &&
                                 moderationRequestData.documentType === "PROJECT" &&
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
                                        <Button variant='secondary' className='me-2 col-auto'
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
                                <Card className = {`${styles['card']}`}>
                                    <div onClick={() => toggleCollapse(0)}
                                            style={{ cursor: 'pointer', padding: '0'}}
                                    >
                                        <Card.Header
                                                className = {`
                                                                ${openCardIndex === 0 ?
                                                                styles['cardHeader-expanded'] : ''}`}
                                                id = {`${styles['cardHeader']}`}>

                                            <Button
                                                variant="button"
                                                className={`p-0 border-0 ${styles['header-button']}`}
                                                aria-controls="example-collapse-text-1"
                                                aria-expanded={openCardIndex === 0}
                                            >
                                            {t('Moderation Request Information')}
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 0}>
                                        <div id="example-collapse-text-1">
                                            <Card.Body className = {`${styles['card-body']}`}>
                                                <div className="row">
                                                    <div className="col">
                                                        <ModerationRequestInfo
                                                            data={moderationRequestData}
                                                        />
                                                    </div>
                                                    <div className="col">
                                                        <ModerationDecision
                                                            data={moderationRequestData}
                                                            moderationRequestPayload = {moderationRequestPayload}
                                                            setModerationRequestPayload = {setModerationRequestPayload}
                                                        />
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </div>
                                    </Collapse>
                                </Card>
                            </Row>
                            <Row>
                                <Card className = {`${styles['card']}`}>
                                    <div onClick={() => toggleCollapse(1)}
                                            style={{ cursor: 'pointer', padding: '0'}}>
                                        <Card.Header
                                                className = {`
                                                                ${openCardIndex === 1 ?
                                                                styles['cardHeader-expanded'] : ''}`}
                                                                id = {`${styles['cardHeader']}`}>
                                            <Button
                                                variant="button"
                                                className={`p-0 border-0 ${styles['header-button']}`}
                                                aria-controls="example-collapse-text-2"
                                                aria-expanded={openCardIndex === 1}
                                            >
                                            {t('Proposed Changes')}
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 1}>
                                        <div id="example-collapse-text-2">
                                            <Card.Body className = {`${styles['card-body']}`}>
                                                <div className="row">
                                                    <div className="col">
                                                        <ProposedChanges data={moderationRequestData}/>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </div>
                                    </Collapse>
                                </Card>
                            </Row>
                            <Row>
                                <Card className = {`${styles['card']}`}>
                                    <div onClick={() => toggleCollapse(2)}
                                            style={{ cursor: 'pointer', padding: '0'}}>
                                        <Card.Header
                                                className = {`
                                                                ${openCardIndex === 2 ?
                                                                styles['cardHeader-expanded'] : ''}`}
                                                                id = {`${styles['cardHeader']}`}>
                                            <Button
                                                variant="button"
                                                className={`p-0 border-0 ${styles['header-button']}`}
                                                aria-controls="example-collapse-text-3"
                                                aria-expanded={openCardIndex === 2}
                                            >
                                            { moderationRequestData.documentType === "COMPONENT" && t('Current Component') ||
                                                moderationRequestData.documentType === "RELEASE" && t('Current Release') ||
                                                moderationRequestData.documentType === "PROJECT" && t('Current Project') ||
                                                moderationRequestData.documentType === "LICENSE" && t('Current License')
                                            }
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 2}>
                                        <div id="example-collapse-text-3">
                                            <Card.Body className = {`${styles['card-body']}`}>
                                            {
                                                moderationRequestData.documentType === 'COMPONENT'
                                                    && <CurrentComponentDetail componentId={moderationRequestData.documentId} /> ||
                                                moderationRequestData.documentType === 'PROJECT'
                                                    && <CurrentProjectDetail projectId={moderationRequestData.documentId} /> ||
                                                moderationRequestData.documentType === 'RELEASE'
                                                    && <CurrentReleaseDetail releaseId={moderationRequestData.documentId} />
                                            }
                                            </Card.Body>
                                        </div>
                                    </Collapse>
                                </Card>
                            </Row>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
    )}
}

export default ModerationRequestDetail
