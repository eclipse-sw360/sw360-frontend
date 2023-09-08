// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useSession } from 'next-auth/react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import { useEffect, useState } from 'react'
import HttpStatus from '@/object-types/enums/HttpStatus'
import ApiUtils from '@/utils/api/api.util'
import { signOut } from 'next-auth/react'
import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

const DEFAULT_RELEASE_INFO: any = { name: '', version: '', _embedded: { 'sw360:attachments': [] } }

interface Props {
    releaseId?: string
    show?: boolean
    setShow?: React.Dispatch<React.SetStateAction<boolean>>
}

const DeleteReleaseModal = ({ releaseId, show, setShow }: Props) => {
    const { data: session }: any = useSession()
    const t = useTranslations(COMMON_NAMESPACE)
    const [release, setRelease] = useState(DEFAULT_RELEASE_INFO)
    const [variant, setVariant] = useState('success')
    const [message, setMessage] = useState('')
    const [showMessage, setShowMessage] = useState(false)
    const [reloadPage, setReloadPage] = useState(false)

    const displayMessage = (variant: string, message: string) => {
        setVariant(variant)
        setMessage(message)
        setShowMessage(true)
    }

    const handleError = useCallback(() => {
        displayMessage('danger', 'Error when processing!')
        setReloadPage(true)
    }, [])

    const deleteComponent: any = async () => {
        const response = await ApiUtils.DELETE(`releases/${releaseId}`, session.user.access_token)
        try {
            if (response.status == HttpStatus.MULTIPLE_STATUS) {
                const body = await response.json()
                const deleteStatus = body[0].status
                if (deleteStatus == HttpStatus.OK) {
                    displayMessage('success', 'Delete release success!')
                    setReloadPage(true)
                } else if (deleteStatus == HttpStatus.CONFLICT) {
                    displayMessage(
                        'danger',
                        'I could not delete the release, since it is used by another component (release) or project'
                    )
                } else if (deleteStatus == HttpStatus.ACCEPTED) {
                    displayMessage('success', 'Created moderation request!')
                } else {
                    displayMessage('danger', 'Error when processing!')
                }
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                signOut()
            } else {
                handleError()
            }
        } catch (err) {
            handleError()
        }
    }

    const fetchData: any = useCallback(
        async (signal: any) => {
            if (session) {
                const releaseResponse = await ApiUtils.GET(`releases/${releaseId}`, session.user.access_token, signal)
                if (releaseResponse.status == HttpStatus.OK) {
                    const release = await releaseResponse.json()
                    setRelease(release)
                } else if (releaseResponse.status == HttpStatus.UNAUTHORIZED) {
                    signOut()
                } else {
                    setRelease(DEFAULT_RELEASE_INFO)
                    handleError()
                }
            }
        },
        [releaseId, handleError, session]
    )

    const handleSubmit = () => {
        deleteComponent()
    }

    const handleCloseDialog = () => {
        setShow(!show)
        setShowMessage(false)
        if (reloadPage === true) {
            window.location.reload()
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        fetchData(signal)

        return () => {
            controller.abort()
        }
    }, [show, releaseId, fetchData])

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton style={{ color: 'red' }}>
                <Modal.Title>{t('Delete Release')} ?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant={variant} onClose={() => setShowMessage(false)} dismissible show={showMessage}>
                    {t(message)}
                </Alert>
                <Form>
                    {t.rich('Do you really want to delete the release?', {
                        name: release.name + release.version,
                        strong: (chunks) => <b>{chunks}</b>,
                    })}
                    <br />
                    <br />
                    {release['_embedded'] && release['_embedded']['sw360:attachments'] && (
                        <>
                            {t.rich('This release contains', {
                                name: release.name + release.version,
                                strong: (chunks) => <b>{chunks}</b>,
                            })}
                            <br />
                            <ul>
                                <li>{`${t('Attachments')}: ${release['_embedded']['sw360:attachments'].length}`}</li>
                            </ul>
                        </>
                    )}
                    <hr />
                    <Form.Group className='mb-3'>
                        <Form.Label style={{ fontWeight: 'bold' }}>{t('Please comment your changes')}</Form.Label>
                        <Form.Control as='textarea' aria-label='With textarea' />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button className='delete-btn' variant='light' onClick={handleCloseDialog}>
                    {' '}
                    {t('Close')}{' '}
                </Button>
                <Button className='login-btn' variant='danger' onClick={handleSubmit} hidden={reloadPage}>
                    {t('Delete Release')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteReleaseModal
