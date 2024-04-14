// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE


'use client'

import { HttpStatus } from '@/object-types'
import { ApiUtils } from '@/utils/index'
import { notFound } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { signOut, useSession } from 'next-auth/react'
import styles from '../moderationRequestDetail.module.css'
import { Button, Col, Row, Tab, Card, Collapse } from 'react-bootstrap'
import { ModerationRequestDetails } from '@/object-types'


function ModerationRequestDetail({ moderationRequestId }: { moderationRequestId: string }) {

    const t = useTranslations('default')
    const [openCardIndex, setOpenCardIndex] = useState<number>(0);
    const { data: session, status } = useSession()
    const [moderationRequestData, setModerationRequestData] = useState
                                            <ModerationRequestDetails | undefined>(undefined)

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
                                {'Moderation Request test'}
                            </Col>
                        </Row>
                        <Col className='ps-2 me-3 mt-3'>
                                <Row className='d-flex justify-content-between'>
                                    <Col lg={6}>
                                        <Row>
                                            <Button
                                                variant='success'
                                                className='me-2 col-auto'
                                                // onClick={() => handleEditProject(projectId)}
                                            >
                                                {t('Accept Request')}
                                            </Button>
                                            <Button variant='danger' className='me-2 col-auto'
                                                // onClick={() => setShow(true)}
                                                >
                                                {t('Decline Request')}
                                            </Button>
                                            <Button variant='secondary' className='me-2 col-auto'
                                                // onClick={() => setShow(true)}
                                                >
                                                {t('Postpone Request')}
                                            </Button>
                                            <Button variant='secondary' className='me-2 col-auto'
                                                // onClick={() => setShow(true)}
                                                >
                                                {t('Remove Me From Moderators')}
                                            </Button>
                                            <Button variant='dark' className='me-2 col-auto'
                                                // onClick={() => setShow(true)}
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
                                                    className = {`${styles['card-header']}
                                                                  ${openCardIndex === 0 ?
                                                                  styles['card-header-expanded'] : ''}`}>
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
                                                    This content is collapsible!
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
                                                    className = {`${styles['card-header']}
                                                                  ${openCardIndex === 1 ?
                                                                  styles['card-header-expanded'] : ''}`}>
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
                                                    This content is collapsible!
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
                                                    className = {`${styles['card-header']}
                                                                  ${openCardIndex === 2 ?
                                                                  styles['card-header-expanded'] : ''}`}>
                                                <Button
                                                    variant="button"
                                                    className={`p-0 border-0 ${styles['header-button']}`}
                                                    aria-controls="example-collapse-text-3"
                                                    aria-expanded={openCardIndex === 2}
                                                >
                                                {t('Current Component')}
                                                </Button>
                                            </Card.Header>
                                        </div>
                                        <Collapse in={openCardIndex === 2}>
                                            <div id="example-collapse-text-3">
                                                <Card.Body className = {`${styles['card-body']}`}>
                                                    his content is collapsible!
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
