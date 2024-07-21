// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE


'use client'

import { ClearingRequestDetails, HttpStatus } from '@/object-types'
import { ApiUtils } from '@/utils/index'
import { notFound, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { signOut, useSession } from 'next-auth/react'
import styles from './../../../moderationRequest/[id]/moderationRequestDetail.module.css'
import { Button, Col, Row, Tab, Card, Collapse } from 'react-bootstrap'
import { ShowInfoOnHover } from 'next-sw360'
import ClearingRequestInfo from './ClearingRequestInfo'
import ClearingDecision from './ClearingDecision'


function ClearingRequestDetail({ clearingRequestId }: { clearingRequestId: string }) {

    const t = useTranslations('default')
    const [openCardIndex, setOpenCardIndex] = useState<number>(0)
    const { data: session, status } = useSession()
    const router = useRouter()
    const toastShownRef = useRef(false);
    const [isProjectDeleted, setIsProjectDeleted] = useState<boolean>(false)
    const [clearingRequestData, setClearingRequestData] = useState<ClearingRequestDetails>({
        id: '',
        requestedClearingDate: '',
        projectId: '',
        projectName: '',
        requestingUser: '',
        projectBU: '',
        requestingUserComment: '',
        clearingTeam: '',
        agreedClearingDate: '',
        priority: '',
        clearingType: '',
        reOpenOn: null,
        comments: [{}]
    })

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as ClearingRequestDetails
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[session]
    )

    useEffect(() => {
        if (!toastShownRef.current) {
            toastShownRef.current = true;
        }

        void fetchData(`clearingrequest/${clearingRequestId}`).then(
                      (clearingRequestDetails: ClearingRequestDetails) => {
            if (!Object.hasOwn(clearingRequestDetails, 'projectId')){
                setIsProjectDeleted(true)
            }
            setClearingRequestData(clearingRequestDetails)
        })}, [fetchData, session])

    const handleEditClearingRequest = () => {
        
        // Temp code
        console.log('Edit Clearing Request')
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
                                {clearingRequestData &&
                                `${clearingRequestData.id}`}
                            </Col>
                        </Row>
                        <Col className='ps-2 me-3 mt-3'>
                            <Row className='d-flex justify-content-between'>
                                <Col lg={6}>
                                    <Row>
                                        <Button
                                            variant='btn btn-primary'
                                            className='me-2 col-auto'
                                            onClick={handleEditClearingRequest}
                                            hidden={isProjectDeleted}
                                        >
                                            {t('Edit Request')}
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
                                            <div>
                                                <ShowInfoOnHover text={''} />
                                                {' '}
                                                {isProjectDeleted ? (
                                                    t('Clearing Request Information For DELETED Project')
                                                ) : ( <>
                                                        {t('Clearing Request Information For Project') + ` `}
                                                        <a href={`/projects/detail/${clearingRequestData.projectId}`}>
                                                            {clearingRequestData.projectId}
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 0}>
                                        <div id="example-collapse-text-1">
                                            <Card.Body className = {`${styles['card-body']}`}>
                                                <div className="row">
                                                    <div className="col">
                                                        <ClearingRequestInfo
                                                            data={clearingRequestData}
                                                        />
                                                    </div>
                                                    <div className="col">
                                                        <ClearingDecision
                                                            data={clearingRequestData}
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
                                            {t('Clearing Request Comments')}
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 1}>
                                        <div id="example-collapse-text-2">
                                            <Card.Body className = {`${styles['card-body']}`}>
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

export default ClearingRequestDetail
