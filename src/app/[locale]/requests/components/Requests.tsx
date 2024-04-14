// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

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


function Requests() {

    const t = useTranslations('default')
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
            fieldName: t('RequestingUserEmail'),
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
                    text: t('Approved'),
                },
                {
                    key: 'pending',
                    text: t('Pending'),
                },
                {
                    key: 'rejected',
                    text: t('Rejected'),
                },
                {
                    key: 'inProgress',
                    text: t('In Progress'),
                }
            ],
            paramName: 'state',
        }
    ]

    return (
        <>
            <div className='ms-5 mt-3'>
                <Tab.Container defaultActiveKey='openModerationrequests' mountOnEnter={true} unmountOnExit={true}>
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
                        <Col md={9}>
                            <Row className='text-truncate buttonheader-title '>
                                {t('MODERATIONS')}
                            </Row>
                            <Row className='mt-3' style={{ marginRight: '0px' }}>
                                <Tab.Content>
                                    <Tab.Pane eventKey='openModerationrequests'>
                                        <OpenModerationRequest/>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='closedModerationrequests'>
                                        <ClosedModerationRequest/>
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

export default Requests
