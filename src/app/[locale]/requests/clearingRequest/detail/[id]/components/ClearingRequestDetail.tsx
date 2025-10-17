// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { notFound, useParams, useRouter } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ShowInfoOnHover } from 'next-sw360'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Breadcrumb, Button, Card, Col, Collapse, Row, Tab } from 'react-bootstrap'
import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { ClearingRequestDetails, HttpStatus, UserGroupType } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import ReopenClosedClearingRequestModal from '../../../edit/[id]/components/ReopenClosedClearingRequestModal'
import ClearingDecision from './ClearingDecision'
import ClearingRequestInfo from './ClearingRequestInfo'

function ClearingRequestDetail({ clearingRequestId }: { clearingRequestId: string }): ReactNode | undefined {
    const t = useTranslations('default')
    const [openCardIndex, setOpenCardIndex] = useState<number>(0)
    const router = useRouter()
    const toastShownRef = useRef(false)
    const [isProjectDeleted, setIsProjectDeleted] = useState<boolean>(false)
    const [isReopenClosedCR, setIsReopenClosedCR] = useState<boolean>(false)
    const [showReopenClearingRequestModal, setShowReopenClearingRequestModal] = useState<boolean>(false)
    const [clearingRequestData, setClearingRequestData] = useState<ClearingRequestDetails | undefined>()
    const { status } = useSession()
    const param = useParams()
    const locale = (param.locale as string) || 'en'
    const requestsPath = `/${locale}/requests`

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const ClearingComments = dynamic(() => import('./ClearingComments'), {
        ssr: false,
    })

    const fetchData = async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as ClearingRequestDetails
            return data
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            notFound()
        }
    }

    useEffect(() => {
        if (!toastShownRef.current) {
            toastShownRef.current = true
        }
        void fetchData(`clearingrequest/${clearingRequestId}`).then(
            (clearingRequestDetails: ClearingRequestDetails | undefined) => {
                if (!Object.hasOwn(clearingRequestDetails ?? {}, 'projectId')) {
                    setIsProjectDeleted(true)
                }

                if (
                    clearingRequestDetails?.clearingState === 'CLOSED' ||
                    clearingRequestDetails?.clearingState === 'REJECTED'
                ) {
                    setIsReopenClosedCR(true)
                }
                setClearingRequestData(clearingRequestDetails)
            },
        )
    }, [
        clearingRequestId,
    ])

    const handleEditClearingRequest = (requestId: string | undefined) => {
        router.push(`/requests/clearingRequest/edit/${requestId}`)
    }

    const toggleCollapse = (index: number) => {
        setOpenCardIndex((prevIndex) => (prevIndex === index ? -1 : index))
    }

    return (
        <>
            <ReopenClosedClearingRequestModal
                show={showReopenClearingRequestModal}
                setShow={setShowReopenClearingRequestModal}
            />
            <Breadcrumb className='container page-content'>
                <Breadcrumb.Item
                    linkAs={Link}
                    href={requestsPath}
                >
                    {t('Requests')}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{clearingRequestData?.id || clearingRequestId}</Breadcrumb.Item>
            </Breadcrumb>
            <div className='ms-5 mt-2'>
                <Tab.Container>
                    <Row>
                        <Row>
                            <Col
                                lg={12}
                                className='text-truncate buttonheader-title me-3'
                            >
                                {clearingRequestData && `${clearingRequestData.id}`}
                            </Col>
                        </Row>
                        <Col className='ps-2 me-3 mt-3'>
                            <Row className='d-flex justify-content-between'>
                                <Col lg={6}>
                                    <Row>
                                        <Button
                                            variant='btn btn-primary'
                                            className='me-2 col-auto'
                                            onClick={() => {
                                                if (isReopenClosedCR) {
                                                    setShowReopenClearingRequestModal(true)
                                                } else {
                                                    handleEditClearingRequest(clearingRequestData?.id)
                                                }
                                            }}
                                            hidden={isProjectDeleted}
                                        >
                                            {isReopenClosedCR ? t('Reopen Request') : t('Edit Request')}
                                        </Button>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className='mt-3'>
                                <Card className={`${styles['card']}`}>
                                    <div
                                        onClick={() => toggleCollapse(0)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '0',
                                        }}
                                    >
                                        <Card.Header
                                            className={`
                                                        ${openCardIndex === 0 ? styles['cardHeader-expanded'] : ''}`}
                                            id={`${styles['cardHeader']}`}
                                        >
                                            <Button
                                                variant='button'
                                                className={`p-0 border-0 ${styles['header-button']}`}
                                                aria-controls='example-collapse-text-1'
                                                aria-expanded={openCardIndex === 0}
                                            >
                                                <div>
                                                    <ShowInfoOnHover text={''} />{' '}
                                                    {isProjectDeleted ? (
                                                        t('Clearing Request Information For DELETED Project')
                                                    ) : (
                                                        <>
                                                            {t('Clearing Request Information For Project') + ` `}
                                                            {clearingRequestData?._embedded !== undefined && (
                                                                <Link
                                                                    href={`/projects/detail/${clearingRequestData.projectId}`}
                                                                    className='text-link'
                                                                >
                                                                    {`${clearingRequestData._embedded['sw360:project']?.name ?? ''}(${clearingRequestData._embedded['sw360:project']?.version ?? ''})`}
                                                                </Link>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 0}>
                                        <div id='example-collapse-text-1'>
                                            <Card.Body className={`${styles['card-body']}`}>
                                                <div className='row'>
                                                    <div className='col'>
                                                        <ClearingRequestInfo data={clearingRequestData} />
                                                    </div>
                                                    <div className='col'>
                                                        <ClearingDecision data={clearingRequestData} />
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
                                        style={{
                                            cursor: 'pointer',
                                            padding: '0',
                                        }}
                                    >
                                        <Card.Header
                                            className={`
                                                        ${openCardIndex === 1 ? styles['cardHeader-expanded'] : ''}`}
                                            id={`${styles['cardHeader']}`}
                                        >
                                            <Button
                                                variant='button'
                                                className={`p-0 border-0 ${styles['header-button']}`}
                                                aria-controls='example-collapse-text-2'
                                                aria-expanded={openCardIndex === 1}
                                            >
                                                {t('Clearing Request Comments') +
                                                    ' ' +
                                                    `(${clearingRequestData?.comments?.length ?? 0})`}
                                            </Button>
                                        </Card.Header>
                                    </div>
                                    <Collapse in={openCardIndex === 1}>
                                        <div id='example-collapse-text-2'>
                                            <Card.Body className={`${styles['card-body']}`}>
                                                <div>
                                                    <div className='col'>
                                                        {openCardIndex === 1 && (
                                                            <ClearingComments
                                                                clearingRequestId={clearingRequestData?.id}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
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
export default AccessControl(ClearingRequestDetail, [
    UserGroupType.SECURITY_USER,
])
