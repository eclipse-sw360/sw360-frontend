// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Dispatch, SetStateAction, useCallback, useState } from "react"
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap"
import { CreateClearingRequestPayload } from "@/object-types"
import { FaRegQuestionCircle } from "react-icons/fa"
import { ShowInfoOnHover } from "next-sw360"

interface Props {
    show?: boolean
    setShow?: Dispatch<SetStateAction<boolean>>
}

export default function ReopenClosedClearingRequestModal({ show,
                                                           setShow
                                                         }: Props) {
    const t = useTranslations('default')
    const { status } = useSession()
    const [message, setMessage] = useState('')
    const [variant, setVariant] = useState('success')
    const [reloadPage, setReloadPage] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [createClearingRequestPayload, setCreateClearingRequestPayload] = 
                                        useState<CreateClearingRequestPayload>({
            requestedClearingDate: '',
            clearingType: '',
            priority: '',
            requestingUserComment: ''
    })

    const handleError = useCallback(() => {
        displayMessage('danger', t('Error when processing'))
        setReloadPage(true)
    }, [t])

    const displayMessage = (variant: string, message: string) => {
        setVariant(variant)
        setMessage(message)
        setShowMessage(true)
    }

    const reopenClearingRequest = () => {
        console.log('reopen closed CR')
        handleError()
    }

    const handleSubmit = () => {
        reopenClearingRequest()
    }

    const handleCloseDialog = () => {
        setShow(!show)
        setIsDisabled(false)
        setShowMessage(false)
        setCreateClearingRequestPayload({
            requestedClearingDate: '',
            clearingType: '',
            priority: '',
            requestingUserComment: ''
        })
        if (reloadPage === true) {
            window.location.reload()
        }
    }

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement |
                                                       HTMLInputElement |
                                                       HTMLTextAreaElement>) => {
        setCreateClearingRequestPayload({
            ...createClearingRequestPayload,
            [event.target.name]: event.target.value,
        })
    }
    

    if (status === 'unauthenticated') {
        signOut()
    } else {
        return (
            <>
                <Modal
                    size='lg'
                    centered
                    show={show}
                    onHide={() => {
                        setShow(false)
                    }}
                    aria-labelledby={t('Reopen Clearing Request')}
                    scrollable
                >
                    <Modal.Header closeButton style={{ color: '#2E5AAC' }}>
                        <Modal.Title id='reopen-clearing-request-modal'>
                            <FaRegQuestionCircle style={{ marginBottom: '5px',
                                                     color: '#2E5AAC',
                                                     fontSize: '19px'}} />
                                {' '}
                                { t('reopen clearing request')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant={variant}
                            onClose={() => setShowMessage(false)}
                            show={showMessage}
                            dismissible>
                            {message}
                        </Alert>
                        <Form>
                            <Form.Group>
                                <Form.Label className='mb-1'>
                                    {t('Please enter details to re-open clearing request')}
                                </Form.Label>
                                <br />
                            </Form.Group>
                            <hr />
                            <Row className='mb-3'>                                
                                <Col md={6}>
                                    <Form.Group className='mb-2'>
                                        <Form.Label style={{ fontWeight: 'bold' }}>
                                            {t('Preferred Clearing Date')} :
                                            <span className='text-red'
                                                  style={{ color: '#F7941E' }}>
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            type='date'
                                            id='createClearingRequest.requestedClearingDate'
                                            name='requestedClearingDate'
                                            value={createClearingRequestPayload?.requestedClearingDate ?? ''}
                                            onChange={updateInputField}
                                            disabled={isDisabled}
                                            required
                                        />
                                        <div className='form-text'
                                             id='createClearingRequest.requestedClearingDate.HelpBlock'>
                                            <ShowInfoOnHover text={t('Requested Clearing Date Info')}/>
                                                {' '}{t('Learn more about preferred clearing date')}.
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className='mb-2'>
                                        <Form.Label style={{ fontWeight: 'bold' }}>
                                            {t('Clearing Type')} :
                                            <span className='text-red'
                                                  style={{ color: '#F7941E' }}>
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Select
                                            id='createClearingRequest.clearingType'
                                            name='clearingType'
                                            value={createClearingRequestPayload.clearingType}
                                            onChange={updateInputField}
                                            disabled={isDisabled}
                                            required
                                        >
                                            <option value='' hidden></option>
                                            <option value='DEEP'>{t('Deep Level CLX')}</option>
                                            <option value='HIGH'>{t('High Level ISR')}</option>
                                        </Form.Select>
                                        <div className='form-text'
                                             id='createClearingRequest.clearingType.HelpBlock'>
                                            <ShowInfoOnHover text={t('Clearing Type Info')}/>
                                                {' '}{t('Learn more about clearing request type')}.
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        <Button className='btn-secondary'
                                variant='light'
                                onClick={handleCloseDialog} >
                            {' '}
                            {t('Close')}{' '}
                        </Button>
                        <Button
                            className='login-btn'
                            variant='primary'
                            disabled={!createClearingRequestPayload.clearingType ||
                                      !createClearingRequestPayload.requestedClearingDate}
                            onClick={() => handleSubmit()}
                            hidden={reloadPage}
                        >
                            {t('Reopen Clearing Request')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )}
}