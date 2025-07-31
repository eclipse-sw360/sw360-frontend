// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useCallback, useState, type JSX } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'

import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

interface SelectedVulnerability {
    releaseId: string
    vulnerExternalId: string
    index: string
}

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    state: string
    selectedVulner: Array<SelectedVulnerability>
}

interface ChangeStatePayload {
    releaseVulnerabilityRelationDTOs: [
        {
            externalId: string
        },
    ]
    comment: string
    verificationState: string
}

const ChangeStateDialog = ({ show, setShow, state, selectedVulner }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [comment, setComment] = useState('')

    const handleCloseDialog = () => {
        setShow(!show)
    }

    const updateState = useCallback(async (url: string, data: ChangeStatePayload) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        await ApiUtils.PATCH(url, data, session.user.access_token)
    }, [])

    const handleSubmit = async () => {
        if (selectedVulner.length > 0) {
            for (const item of selectedVulner) {
                const payload: ChangeStatePayload = {
                    releaseVulnerabilityRelationDTOs: [
                        {
                            externalId: item.vulnerExternalId,
                        },
                    ],
                    comment: comment,
                    verificationState: state,
                }
                await updateState(`releases/${item.releaseId}/vulnerabilities`, payload)
            }
            window.location.reload()
        }
    }

    return (
        <Modal
            show={show}
            onHide={handleCloseDialog}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <b>{t('Change Vulnerability Rating And Action?')}</b>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {t.rich('The verification of vulnerabilities will be changed to', {
                        number: selectedVulner.length,
                        strong: (chunks) => <b>{chunks}</b>,
                    })}
                    : <b>{t(state as never)}</b>.
                    <hr />
                    <Form.Group className='mb-3'>
                        <Form.Label style={{ fontWeight: 'bold' }}>{t('Please comment your changes')}</Form.Label>
                        <Form.Control
                            as='textarea'
                            aria-label='With textarea'
                            size='lg'
                            onChange={(event) => setComment(event.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    className='delete-btn'
                    variant='light'
                    onClick={handleCloseDialog}
                >
                    {' '}
                    {t('Close')}{' '}
                </Button>
                <Button
                    className='login-btn'
                    variant='primary'
                    onClick={() => void handleSubmit()}
                >
                    {t('Change State')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ChangeStateDialog
