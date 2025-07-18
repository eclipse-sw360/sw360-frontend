// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ReactNode, useCallback, useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap'

import { HttpStatus, LicensePayload } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { BsQuestionCircle } from 'react-icons/bs'

interface Props {
    licensePayload: LicensePayload
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

const DeleteLicenseDialog = ({ licensePayload, show, setShow }: Props): ReactNode => {
    const t = useTranslations('default')
    const router = useRouter()
    const [variant, setVariant] = useState('success')
    const [message, setMessage] = useState('')
    const [showMessage, setShowMessage] = useState(false)
    const [reloadPage, setReloadPage] = useState(false)
    const [loading, setLoading] = useState(false)

    const displayMessage = (variant: string, message: string) => {
        setVariant(variant)
        setMessage(message)
        setShowMessage(true)
    }

    const handleError = useCallback(() => {
        displayMessage('danger', t('Error when processing'))
        setReloadPage(true)
    }, [])

    const deleteLicense = async () => {
        setLoading(true)
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return
        const response = await ApiUtils.DELETE(`licenses/${licensePayload.shortName}`, session.user.access_token)
        try {
            if (response.status == HttpStatus.OK) {
                displayMessage('success', t('Delete license successful'))
                router.push('/licenses?delete=success')
                setReloadPage(true)
            } else if (response.status == HttpStatus.ACCEPTED) {
                displayMessage('success', t('Created moderation request'))
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else if (response.status == HttpStatus.BAD_REQUEST) {
                const errorResponse = await response.json()
                displayMessage('danger', errorResponse.message)
            } else {
                displayMessage('danger', t('Error when processing'))
            }
        } catch {
            handleError()
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = () => {
        deleteLicense().catch((err) => {
            console.log(err)
        })
    }

    const handleCloseDialog = () => {
        setShow(!show)
        setShowMessage(false)
        if (reloadPage === true) {
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
            <Modal.Header
                closeButton
                style={{ color: 'red' }}
            >
                <Modal.Title>
                    <BsQuestionCircle />
                    &nbsp;
                    {t('Delete License')}?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert
                    variant={variant}
                    onClose={() => setShowMessage(false)}
                    dismissible
                    show={showMessage}
                >
                    {message}
                </Alert>
                <Form>
                    {loading === false ? (
                        <p>
                            {t.rich('Do you really want to delete the license', {
                                name: `${licensePayload.fullName} (${licensePayload.shortName})`,
                                strong: (chunks) => <b>{chunks}</b>,
                            })}
                        </p>
                    ) : (
                        <div className='col-12 d-flex justify-content-center align-items-center'>
                            <Spinner className='spinner' />
                        </div>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    className='delete-btn'
                    variant='light'
                    onClick={handleCloseDialog}
                >
                    {t('Cancel')}
                </Button>
                <Button
                    className='login-btn'
                    variant='danger'
                    onClick={() => handleSubmit()}
                    hidden={reloadPage}
                >
                    {t('Delete License')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteLicenseDialog
