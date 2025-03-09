// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { ClearingRequestDetails, HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { BsCheck2Square } from 'react-icons/bs'

interface Props {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    projectName?: string
    clearingRequestId?: string
}

export default function ViewClearingRequestModal({
    show,
    setShow,
    projectName,
    clearingRequestId,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const [message, setMessage] = useState('')
    const [variant, setVariant] = useState('success')
    const [showMessage, setShowMessage] = useState(false)
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
        reOpenedOn: undefined,
        createdOn: '',
        comments: [{}],
    })

    const displayMessage = (variant: string, message: string) => {
        setVariant(variant)
        setMessage(message)
        setShowMessage(true)
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        if (clearingRequestId === undefined || clearingRequestId === '') return

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(`clearingrequest/${clearingRequestId}`, session.user.access_token)
                if (response.status == HttpStatus.OK) {
                    const data = (await response.json()) as ClearingRequestDetails
                    setClearingRequestData(data)
                } else if (response.status == HttpStatus.FORBIDDEN) {
                    displayMessage('warning', t('Failed to fetch clearing request from database'))
                    return signOut()
                } else if (response.status == HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else {
                    notFound()
                }
            } catch (e) {
                console.error(e)
            }
        })()
        return () => controller.abort(signal)
    }, [clearingRequestId])

    const handleCloseDialog = () => {
        setShow(!show)
    }

    return (
        <Modal
            size='lg'
            centered
            show={show}
            onHide={() => {
                setShow(false)
            }}
            aria-labelledby={t('Create Clearing Request')}
            scrollable
        >
            <Modal.Header
                closeButton
                style={{ color: '#2E5AAC' }}
            >
                <Modal.Title id='create-clearing-request-modal'>
                    <BsCheck2Square style={{ marginBottom: '5px', color: '#2E5AAC', fontSize: '23px' }} />{' '}
                    {t('View Clearing Request')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert
                    variant={variant}
                    onClose={() => setShowMessage(false)}
                    show={showMessage}
                    dismissible
                >
                    {message}
                </Alert>
                <Form>
                    <Form.Group>
                        <Form.Label className='mb-4'>
                            {t.rich('View clearing request detail', {
                                id: clearingRequestData.id,
                                strong: (chunks) => (
                                    <b>
                                        <Link
                                            href={`/requests/clearingRequest/detail/${clearingRequestId}`}
                                            className='text-link'
                                        >
                                            {chunks}
                                        </Link>
                                    </b>
                                ),
                            })}
                            <b> {projectName}</b>
                        </Form.Label>
                        <br />
                    </Form.Group>
                    <>
                        <table className={`table label-value-table ${styles['summary-table']}`}>
                            <tbody>
                                <tr>
                                    <td className={`${styles['summary-table-view-cr']}`}>
                                        <b>{t('Requesting User')}:</b>
                                    </td>
                                    <td>{clearingRequestData.requestingUser ?? ''}</td>
                                </tr>
                                <tr>
                                    <td className={`${styles['summary-table-view-cr']}`}>
                                        <b>{t('Requester Comment')}:</b>
                                    </td>
                                    <td>{clearingRequestData.requestingUserComment ?? ''}</td>
                                </tr>
                                <tr>
                                    <td className={`${styles['summary-table-view-cr']}`}>
                                        <b>{t('Created On')}:</b>
                                    </td>
                                    <td>{clearingRequestData.createdOn ?? ''}</td>
                                </tr>
                                <tr>
                                    <td className={`${styles['summary-table-view-cr']}`}>
                                        <b>{t('Preferred Clearing Date')}:</b>
                                    </td>
                                    <td>{clearingRequestData.requestedClearingDate ?? ''}</td>
                                </tr>
                                <tr>
                                    <td className={`${styles['summary-table-view-cr']}`}>
                                        <b>{t('Clearing Team')}:</b>
                                    </td>
                                    <td>{clearingRequestData.clearingTeam ?? ''}</td>
                                </tr>
                                <tr>
                                    <td className={`${styles['summary-table-view-cr']}`}>
                                        <b>{t('Agreed Clearing Date')}:</b>
                                    </td>
                                    <td>{clearingRequestData.agreedClearingDate ?? ''}</td>
                                </tr>
                                <tr>
                                    <td className={`${styles['summary-table-view-cr']}`}>
                                        <b>{t('Priority')}:</b>
                                    </td>
                                    <td>{clearingRequestData.priority ?? ''}</td>
                                </tr>
                                <tr>
                                    <td className={`${styles['summary-table-view-cr']}`}>
                                        <b>{t('Request Status')}:</b>
                                    </td>
                                    <td>{clearingRequestData.clearingState ?? ''}</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                </Form>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    className='btn-secondary'
                    variant='light'
                    onClick={handleCloseDialog}
                >
                    {' '}
                    {t('Close')}{' '}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
