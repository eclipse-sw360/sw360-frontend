// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { type JSX, useState } from 'react'
import { Col, ListGroup, Row, Tab } from 'react-bootstrap'

import FeatureConfigurations from '@/app/[locale]/admin/configurations/components/FeatureConfigurations'
import FrontEndConfigs from '@/app/[locale]/admin/configurations/components/FrontEndConfigs'

export default function ConfigurationsTabs(): JSX.Element {
    const t = useTranslations('default')
    const DEFAULT_ACTIVE_TAB = 'backend'
    const [activeKey, setActiveKey] = useState(DEFAULT_ACTIVE_TAB)

    const router = useRouter()
    const handleSelect = (key: string | null) => {
        setActiveKey(key ?? DEFAULT_ACTIVE_TAB)
        router.push(`?tab=${key}`)
    }

    return (
        <>
            <div className='container page-content'>
                <Tab.Container
                    activeKey={activeKey}
                    onSelect={(k) => handleSelect(k)}
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
                                    eventKey='backend'
                                >
                                    <div className='my-2'>{t('Backend Configurations')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='frontend'
                                >
                                    <div className='my-2'>{t('Frontend Configurations')}</div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col className='ps-2 me-3'>
                            <Row className='mt-3'>
                                <Tab.Content>
                                    <Tab.Pane eventKey='backend'>
                                        <FeatureConfigurations />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='frontend'>
                                        <FrontEndConfigs />
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
