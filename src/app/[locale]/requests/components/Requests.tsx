// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { AdvancedSearch} from 'next-sw360'
import { Col, ListGroup, Row, Tab} from 'react-bootstrap'
import OpenModerationRequest from './OpenModerationRequest'
import ClosedModerationRequest from './ClosedModerationRequest'
import OpenClearingRequest from './OpenClearingRequest'
import ClosedClearingRequest from './ClosedClearingRequest'
import { useCallback, useEffect, useState } from 'react'
import { ApiUtils } from '@/utils/index'
import { Embedded, HttpStatus, ModerationRequest } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { notFound } from 'next/navigation'


type EmbeddedModerationRequest = Embedded<ModerationRequest, 'sw360:moderationRequests'>

function Requests() {

    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [openModerationRequestCount, setOpenModerationRequestCount] = useState(0)
    const [closedModerationRequestCount, setClosedModerationRequestCount] = useState(0)
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
                }
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
                }
            ],
            paramName: 'state',
        }
    ]

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as EmbeddedModerationRequest
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[session]
    )

    useEffect(() => {
        void fetchData('moderationrequest')
                .then((moderationRequests: EmbeddedModerationRequest) => {
                    let openMRCount = 0
                    let closedMRCount = 0
                    moderationRequests['_embedded']['sw360:moderationRequests']
                    .filter((item: ModerationRequest) => {
                        if (  item.moderationState === 'PENDING' ||
                              item.moderationState === 'INPROGRESS'){
                                openMRCount++;
                        }
                        else if ( item.moderationState === 'APPROVED' ||
                                  item.moderationState === 'REJECTED'){
                                    closedMRCount++;
                        }
                    })
                setOpenModerationRequestCount(openMRCount)
                setClosedModerationRequestCount(closedMRCount)
            })
        }, [fetchData, session])

    if (status === 'unauthenticated') {
        signOut()
    } else {
        return (
            <>
                <div className='container page-content'>
                    <Tab.Container defaultActiveKey='openModerationrequests'
                                mountOnEnter={true}
                                unmountOnExit={true}>
                        <Row>
                            <Col sm='auto' className='me-3'>
                                <ListGroup>
                                    <ListGroup.Item action eventKey='openModerationrequests'>
                                        <div className='my-2'>{t('Open Moderation Requests')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item action eventKey='closedModerationrequests'>
                                        <div className='my-2'>{t('Closed Moderation Requests')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item action eventKey='openClearingRequests'>
                                        <div className='my-2'>{t('Open Clearing Requests')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item action eventKey='closedClearingRequests'>
                                        <div className='my-2'>{t('Closed Clearing Requests')}</div>
                                    </ListGroup.Item>
                                </ListGroup>
                                <div className='mt-4 mb-4'>
                                    <AdvancedSearch title='Advanced Search' fields={advancedSearch} />
                                </div>
                            </Col>
                            <Col>
                                <Row className='text-truncate buttonheader-title '>
                                    {t('MODERATIONS') +
                                    `(${openModerationRequestCount}/${closedModerationRequestCount})`}
                                </Row>
                                <Row className='mt-3' style={{ marginRight: '0px' }}>
                                    <Tab.Content>
                                        <Tab.Pane eventKey='openModerationrequests'>
                                            <OpenModerationRequest/>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey='closedModerationrequests'>
                                            <ClosedModerationRequest/>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey='openClearingRequests'>
                                            <OpenClearingRequest/>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey='closedClearingRequests'>
                                            <ClosedClearingRequest/>
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

export default Requests
