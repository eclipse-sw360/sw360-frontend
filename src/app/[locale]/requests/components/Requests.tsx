// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { AccessControl } from '@/components/AccessControl/AccessControl'
import { ClearingRequest, Embedded, HttpStatus, ModerationRequest, UserGroupType } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AdvancedSearch } from 'next-sw360'
import { notFound } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { Col, ListGroup, Row, Tab } from 'react-bootstrap'
import ClosedClearingRequest from './ClosedClearingRequest'
import ClosedModerationRequest from './ClosedModerationRequest'
import OpenClearingRequest from './OpenClearingRequest'
import OpenModerationRequest from './OpenModerationRequest'

type EmbeddedModerationRequest = Embedded<ModerationRequest, 'sw360:moderationRequests'>
type EmbeddedClearingRequest = Embedded<ClearingRequest, 'sw360:clearingRequests'>

function Requests(): ReactNode | undefined {
    const t = useTranslations('default')
    const { status } = useSession()
    const [openModerationRequestCount, setOpenModerationRequestCount] = useState(0)
    const [closedModerationRequestCount, setClosedModerationRequestCount] = useState(0)
    const [openClearingRequestCount, setOpenClearingRequestCount] = useState(0)
    const [closedClearingRequestCount, setClosedClearingRequestCount] = useState(0)
    const advancedSearch = [
        {
            fieldName: t('Date'),
            value: [
                {
                    key: 'equalTo',
                    text: '=',
                },
                {
                    key: 'greaterThanEqualTo',
                    text: '>=',
                },
                {
                    key: 'lessThanEqualTo',
                    text: '<=',
                },
                {
                    key: 'BETWEEN',
                    text: t('Between'),
                },
            ],
            paramName: 'createdOn',
        },
        {
            fieldName: t('Type'),
            value: [
                {
                    key: 'Customer Project',
                    text: t('Customer Project'),
                },
                {
                    key: 'Internal Project',
                    text: t('Internal Project'),
                },
                {
                    key: 'Product',
                    text: t('Product'),
                },
                {
                    key: 'Service',
                    text: t('Service'),
                },
                {
                    key: 'Inner Source',
                    text: t('Inner Source'),
                },
                {
                    key: 'Cloud Backend',
                    text: t('Cloud Backend'),
                },
            ],
            paramName: 'type',
        },
        {
            fieldName: t('Document Name'),
            value: '',
            paramName: 'name',
        },
        {
            fieldName: t('Requesting User Email'),
            value: '',
            paramName: 'requestingUser',
        },
        {
            fieldName: t('Department'),
            value: [
                {
                    key: 'none',
                    text: t('None'),
                },
            ],
            paramName: 'group',
        },

        {
            fieldName: t('Moderators'),
            value: '',
            paramName: 'moderators',
        },
        {
            fieldName: t('State'),
            value: [
                {
                    key: 'approved',
                    text: t('APPROVED'),
                },
                {
                    key: 'pending',
                    text: t('Pending'),
                },
                {
                    key: 'rejected',
                    text: t('REJECTED'),
                },
                {
                    key: 'inProgress',
                    text: t('In Progress'),
                },
            ],
            paramName: 'state',
        },
    ]

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const moderationRequestsPrmosies = ApiUtils.GET('moderationrequest', session.user.access_token, signal)
                const clearingRequestsPromises = ApiUtils.GET('clearingrequests', session.user.access_token, signal)

                const responses = await Promise.all([moderationRequestsPrmosies, clearingRequestsPromises])
                if (responses[0].status !== HttpStatus.OK || responses[1].status !== HttpStatus.OK) {
                    return notFound()
                }

                const moderationRequests = (await responses[0].json()) as EmbeddedModerationRequest
                let openMRCount = 0
                let closedMRCount = 0
                moderationRequests['_embedded']['sw360:moderationRequests'].map((item: ModerationRequest) => {
                    if (item.moderationState === 'PENDING' || item.moderationState === 'INPROGRESS') {
                        openMRCount++
                    } else if (item.moderationState === 'APPROVED' || item.moderationState === 'REJECTED') {
                        closedMRCount++
                    }
                })
                setOpenModerationRequestCount(openMRCount)
                setClosedModerationRequestCount(closedMRCount)

                const clearingRequests = (await responses[1].json()) as EmbeddedClearingRequest
                let openCRCount = 0
                let closedCRCount = 0
                clearingRequests['_embedded']['sw360:clearingRequests'].map((item: ClearingRequest) => {
                    if (
                        item.clearingState === 'NEW' ||
                        item.clearingState === 'ACCEPTED' ||
                        item.clearingState === 'IN_QUEUE' ||
                        item.clearingState === 'IN_PROGRESS' ||
                        item.clearingState === 'AWAITING_RESPONSE' ||
                        item.clearingState === 'ON_HOLD' ||
                        item.clearingState === 'SANITY_CHECK' ||
                        item.clearingState === 'PENDING_INPUT'
                    ) {
                        openCRCount++
                    } else if (item.clearingState === 'CLOSED' || item.clearingState === 'REJECTED') {
                        closedCRCount++
                    }
                })
                setOpenClearingRequestCount(openCRCount)
                setClosedClearingRequestCount(closedCRCount)
            } catch (e) {
                console.error(e)
            }
        })()
        return () => {
            controller.abort()
        }
    }, [])

    if (status === 'unauthenticated') {
        void signOut()
    } else {
        return (
            <>
                <div className='container page-content'>
                    <Tab.Container
                        defaultActiveKey='openModerationrequests'
                        mountOnEnter={true}
                        unmountOnExit={true}
                    >
                        <Row>
                            <Col
                                sm='auto'
                                className='me-3'
                            >
                                <ListGroup>
                                    <ListGroup.Item
                                        action
                                        eventKey='openModerationrequests'
                                    >
                                        <div className='my-2'>{t('Open Moderation Requests')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey='closedModerationrequests'
                                    >
                                        <div className='my-2'>{t('Closed Moderation Requests')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey='openClearingRequests'
                                    >
                                        <div className='my-2'>{t('Open Clearing Requests')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey='closedClearingRequests'
                                    >
                                        <div className='my-2'>{t('Closed Clearing Requests')}</div>
                                    </ListGroup.Item>
                                </ListGroup>
                                <div className='mt-4 mb-4'>
                                    <AdvancedSearch
                                        title='Advanced Search'
                                        fields={advancedSearch}
                                    />
                                </div>
                            </Col>
                            <Col>
                                <Row
                                    className='mt-3'
                                    style={{ marginRight: '0px' }}
                                >
                                    <Tab.Content>
                                        <Tab.Pane eventKey='openModerationrequests'>
                                            <Row className='text-truncate buttonheader-title '>
                                                {t('MODERATIONS') +
                                                    `(${openModerationRequestCount}/
                                                ${closedModerationRequestCount})`}
                                            </Row>
                                            <OpenModerationRequest />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey='closedModerationrequests'>
                                            <Row className='text-truncate buttonheader-title '>
                                                {t('MODERATIONS') +
                                                    `(${openModerationRequestCount}/
                                                ${closedModerationRequestCount})`}
                                            </Row>
                                            <ClosedModerationRequest />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey='openClearingRequests'>
                                            <Row className='text-truncate buttonheader-title '>
                                                {t('CLEARING') +
                                                    `(${openClearingRequestCount}/
                                                ${closedClearingRequestCount})`}
                                            </Row>
                                            <OpenClearingRequest />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey='closedClearingRequests'>
                                            <Row className='text-truncate buttonheader-title '>
                                                {t('CLEARING') +
                                                    `(${openClearingRequestCount}/
                                                ${closedClearingRequestCount})`}
                                            </Row>
                                            <ClosedClearingRequest />
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Row>
                            </Col>
                        </Row>
                    </Tab.Container>
                </div>
            </>
        )
    }
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(Requests, [UserGroupType.SECURITY_USER])
