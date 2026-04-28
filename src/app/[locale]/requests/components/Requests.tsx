// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { notFound } from 'next/navigation'

import { useTranslations } from 'next-intl'
import { AdvancedSearch } from 'next-sw360'
import { ReactNode, useEffect, useState } from 'react'
import { Col, ListGroup, Row, Tab } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { ClearingRequest, Embedded, PaginationMeta, RequestType, UserGroupType } from '@/object-types'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import ClearingRequestComponent from './ClearingRequest'
import ModerationRequestComponent from './ModerationRequest'

type EmbeddedClearingRequest = Embedded<ClearingRequest, 'sw360:clearingRequests'>

function Requests(): ReactNode | undefined {
    const t = useTranslations('default')
    const [openModerationRequestCount, setOpenModerationRequestCount] = useState(0)
    const [closedModerationRequestCount, setClosedModerationRequestCount] = useState(0)
    const [totalModerationRequestCount, setTotalModerationRequestCount] = useState(0)
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
                    key: 'PROJECT',
                    text: t('Project'),
                },
                {
                    key: 'COMPONENT',
                    text: t('Component'),
                },
                {
                    key: 'RELEASE',
                    text: t('Release'),
                },
            ],
            paramName: 'type',
        },
        {
            fieldName: t('Document Name'),
            value: '',
            paramName: 'documentName',
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
            paramName: 'requestingUserDepartment',
        },

        {
            fieldName: t('Moderators'),
            value: '',
            paramName: 'moderators',
        },
    ]

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        void (async () => {
            try {
                const moderationRequestsPromsies = ApiUtils.GET(
                    'moderationrequest?moderationState=all&page_entries=1',
                    signal,
                )
                const clearingRequestsPromises = ApiUtils.GET('clearingrequests', signal)

                const responses = await Promise.all([
                    moderationRequestsPromsies,
                    clearingRequestsPromises,
                ])
                if (responses[0].status !== StatusCodes.OK || responses[1].status !== StatusCodes.OK) {
                    return notFound()
                }

                const moderationRequests = (await responses[0].json()) as {
                    page: PaginationMeta
                }
                setTotalModerationRequestCount(moderationRequests.page.totalElements)

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
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()
        return () => {
            controller.abort()
        }
    }, [])

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
                                    dateField='requestDate'
                                />
                            </div>
                        </Col>
                        <Col>
                            <Row
                                className='mt-3'
                                style={{
                                    marginRight: '0px',
                                }}
                            >
                                <Tab.Content>
                                    <Tab.Pane eventKey='openModerationrequests'>
                                        <Row className='text-truncate buttonheader-title '>
                                            {t('MODERATIONS') +
                                                `(${openModerationRequestCount}/${totalModerationRequestCount})`}
                                        </Row>
                                        <ModerationRequestComponent
                                            status='open'
                                            setModerationRequestCount={setOpenModerationRequestCount}
                                        />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='closedModerationrequests'>
                                        <Row className='text-truncate buttonheader-title '>
                                            {t('MODERATIONS') +
                                                `(${closedModerationRequestCount}/${totalModerationRequestCount})`}
                                        </Row>
                                        <ModerationRequestComponent
                                            status='closed'
                                            setModerationRequestCount={setClosedModerationRequestCount}
                                        />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='openClearingRequests'>
                                        <Row className='text-truncate buttonheader-title '>
                                            {t('CLEARING') +
                                                `(${openClearingRequestCount}/${closedClearingRequestCount})`}
                                        </Row>
                                        <ClearingRequestComponent requestType={RequestType.OPEN} />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='closedClearingRequests'>
                                        <Row className='text-truncate buttonheader-title '>
                                            {t('CLEARING') +
                                                `(${openClearingRequestCount}/${closedClearingRequestCount})`}
                                        </Row>
                                        <ClearingRequestComponent requestType={RequestType.CLOSED} />
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

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(Requests, [
    UserGroupType.SECURITY_USER,
    UserGroupType.VIEWER,
])
