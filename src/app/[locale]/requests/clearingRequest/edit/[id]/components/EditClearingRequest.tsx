// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { notFound, useParams, useRouter } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ShowInfoOnHover } from 'next-sw360'
import { ReactNode, useEffect, useState } from 'react'
import { Breadcrumb, Button, Card, Col, Collapse, Row, Spinner, Tab } from 'react-bootstrap'
import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { ClearingRequestDetails, UpdateClearingRequestPayload, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import ClearingComments from './../../../detail/[id]/components/ClearingComments'
import EditClearingDecision from './EditClearingDecision'
import EditClearingRequestInfo from './EditClearingRequestInfo'

function EditClearingRequest({ clearingRequestId }: { clearingRequestId: string }): ReactNode {
    const t = useTranslations('default')
    const [openCardIndex, setOpenCardIndex] = useState<number>(0)
    const router = useRouter()
    const { status } = useSession()
    const [clearingRequestData, setClearingRequestData] = useState<ClearingRequestDetails | undefined>()
    const [updateClearingRequestPayload, setUpdateClearingRequestPayload] = useState<UpdateClearingRequestPayload>({
        clearingType: '',
        clearingState: '',
        priority: '',
        clearingTeam: '',
        agreedClearingDate: '',
        requestingUser: '',
    })
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

    const fetchData = async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == StatusCodes.OK) {
            const data = (await response.json()) as ClearingRequestDetails
            return data
        } else if (response.status == StatusCodes.UNAUTHORIZED) {
            return signOut()
        } else {
            notFound()
        }
    }

    useEffect(() => {
        void fetchData(`clearingrequest/${clearingRequestId}`).then(
            (clearingRequestDetails: ClearingRequestDetails | undefined) => {
                setClearingRequestData(clearingRequestDetails)
            },
        )
    }, [
        clearingRequestId,
    ])

    useEffect(() => {
        if (!clearingRequestData) return

        setUpdateClearingRequestPayload({
            clearingType: clearingRequestData.clearingType ?? '',
            clearingState: clearingRequestData.clearingState ?? '',
            priority: clearingRequestData.priority ?? '',
            clearingTeam: clearingRequestData.clearingTeam ?? '',
            agreedClearingDate: clearingRequestData.agreedClearingDate ?? '',
            requestingUser: clearingRequestData.requestingUser ?? '',
        })
    }, [
        clearingRequestData,
    ])

    const handleUpdateClearingRequest = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        try {
            const response = await ApiUtils.PATCH(
                `clearingrequest/${clearingRequestData?.id}`,
                updateClearingRequestPayload,
                session.user.access_token,
            )
            if (response.status == StatusCodes.OK) {
                MessageService.success(
                    t('Clearing Request') + `${clearingRequestData?.id} ` + t('updated successfully'),
                )
                router.push(`/requests/clearingRequest/detail/${clearingRequestData?.id}`)
            } else if (response.status == StatusCodes.UNAUTHORIZED) {
                await signOut()
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleCancelUpdateClearingRequest = (requestId: string | undefined) => {
        router.push(`/requests/clearingRequest/detail/${requestId}`)
    }

    const toggleCollapse = (index: number) => {
        setOpenCardIndex((prevIndex) => (prevIndex === index ? -1 : index))
    }

    return (
        <>
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
                        {clearingRequestData ? (
                            <>
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
                                                    onClick={() => void handleUpdateClearingRequest()}
                                                >
                                                    {t('Update Request')}
                                                </Button>
                                                <Button
                                                    variant='btn btn-secondary'
                                                    className='me-2 col-auto'
                                                    onClick={() =>
                                                        handleCancelUpdateClearingRequest(clearingRequestData?.id)
                                                    }
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
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '0',
                                                }}
                                            >
                                                <Card.Header
                                                    className={`
                                                            ${
                                                                openCardIndex === 0 ? styles['cardHeader-expanded'] : ''
                                                            }`}
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
                                                        </div>
                                                    </Button>
                                                </Card.Header>
                                            </div>
                                            <Collapse in={openCardIndex === 0}>
                                                <div id='example-collapse-text-1'>
                                                    <Card.Body className={`${styles['card-body']}`}>
                                                        <div className='row'>
                                                            <div className='col'>
                                                                <EditClearingRequestInfo
                                                                    clearingRequestData={clearingRequestData}
                                                                    updateClearingRequestPayload={
                                                                        updateClearingRequestPayload
                                                                    }
                                                                    setUpdateClearingRequestPayload={
                                                                        setUpdateClearingRequestPayload
                                                                    }
                                                                />
                                                            </div>
                                                            <div className='col'>
                                                                <EditClearingDecision
                                                                    clearingRequestData={clearingRequestData}
                                                                    updateClearingRequestPayload={
                                                                        updateClearingRequestPayload
                                                                    }
                                                                    setUpdateClearingRequestPayload={
                                                                        setUpdateClearingRequestPayload
                                                                    }
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
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '0',
                                                }}
                                            >
                                                <Card.Header
                                                    className={`
                                                            ${
                                                                openCardIndex === 1 ? styles['cardHeader-expanded'] : ''
                                                            }`}
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
                                                            `(${clearingRequestData?.comments?.length})`}
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
                            </>
                        ) : (
                            <div className='col-12 mt-1 text-center'>
                                <Spinner className='spinner' />
                            </div>
                        )}
                    </Row>
                </Tab.Container>
            </div>
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(EditClearingRequest, [
    UserGroupType.SECURITY_USER,
])
