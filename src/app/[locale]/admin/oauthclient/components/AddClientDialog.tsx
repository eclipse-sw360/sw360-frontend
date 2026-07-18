// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'

import { useTranslations } from 'next-intl'
import { SelectUsersDialog } from 'next-sw360'
import { ReactNode, useEffect, useState } from 'react'
import { Button, Col, Form, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { BsClipboard } from 'react-icons/bs'
import { OAuthClient } from '@/object-types'
import MessageService from '@/services/message.service'
import { getAuthenticatedAccessToken } from '@/utils/api/authenticatedApi.util'
import { SW360_API_URL } from '@/utils/env'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    client: OAuthClient | null
}

interface FormState {
    description: string
    authorities: string
    readAccess: boolean
    writeAccess: boolean
    accessTokenValidity: string
    refreshTokenValidity: string
    accessTokenUnit: 'Days' | 'Seconds'
    refreshTokenUnit: 'Days' | 'Seconds'
}

enum TokenUnit {
    Days = 'Days',
    Seconds = 'Seconds',
}

enum TokenType {
    Access = 'access',
    Refresh = 'refresh',
}

const defaultState: FormState = {
    description: '',
    authorities: 'BASIC',
    readAccess: false,
    writeAccess: false,
    accessTokenValidity: '',
    refreshTokenValidity: '',
    accessTokenUnit: TokenUnit.Days,
    refreshTokenUnit: TokenUnit.Days,
}

const AddClientDialog = ({ show, setShow, client }: Props): ReactNode => {
    const t = useTranslations('default')
    const [formState, setFormState] = useState<FormState>(defaultState)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [selectedOwner, setSelectedOwner] = useState<{
        [k: string]: string
    }>({})
    const [showOwnerDialog, setShowOwnerDialog] = useState(false)
    const [createdClientResponseJson, setCreatedClientResponseJson] = useState<string | null>(null)
    const [showCreatedClientResponse, setShowCreatedClientResponse] = useState(false)
    const [copied, setCopied] = useState(false)

    const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    useEffect(() => {
        if (client !== null) {
            const ownerEmail = client.owner_email ?? ''
            setFormState({
                description: client.description,
                authorities: client.authorities.join(', '),
                readAccess: client.scope.includes('READ'),
                writeAccess: client.scope.includes('WRITE'),
                accessTokenValidity: client.access_token_validity.toString(),
                refreshTokenValidity: client.refresh_token_validity.toString(),
                accessTokenUnit: 'Seconds',
                refreshTokenUnit: 'Seconds',
            })
            setSelectedOwner(
                ownerEmail === ''
                    ? {}
                    : {
                          [ownerEmail]: ownerEmail,
                      },
            )
        } else {
            setFormState(defaultState)
            setSelectedOwner({})
        }
        setErrors({})
    }, [
        show,
        client,
    ])

    const convertTokenValidity = (value: string, fromUnit: 'Days' | 'Seconds', toUnit: 'Days' | 'Seconds') => {
        const numValue = Number(value)
        if (fromUnit === toUnit) return numValue.toString()
        return fromUnit === 'Days' ? (numValue * 86400).toString() : (numValue / 86400).toString()
    }

    const handleTokenUnitChange = (tokenType: TokenType) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUnit = e.target.value as TokenUnit
        updateField(`${tokenType}TokenUnit`, newUnit)
        updateField(
            `${tokenType}TokenValidity`,
            convertTokenValidity(formState[`${tokenType}TokenValidity`], formState[`${tokenType}TokenUnit`], newUnit),
        )
    }

    const handleClose = () => {
        setShow(!show)
    }

    const selectedOwnerEmail = Object.keys(selectedOwner)[0] ?? ''

    const selectedOwnerDisplayName = (() => {
        if (selectedOwnerEmail === '') return ''
        const selectedOwnerName = selectedOwner[selectedOwnerEmail]
        return selectedOwnerName === '' || selectedOwnerName === selectedOwnerEmail
            ? selectedOwnerEmail
            : `${selectedOwnerName} (${selectedOwnerEmail})`
    })()

    const calculateValidity = (value: string, unit: 'Days' | 'Seconds') =>
        Number(value) * (unit === 'Seconds' ? 1 : 86400)

    const requestBody: OAuthClient = {
        client_id: client?.client_id ?? '',
        client_secret: client?.client_secret ?? '',
        description: formState.description,
        ...(client === null && selectedOwnerEmail !== ''
            ? {
                  owner_email: selectedOwnerEmail,
              }
            : {}),
        access_token_validity: calculateValidity(formState.accessTokenValidity, formState.accessTokenUnit),
        refresh_token_validity: calculateValidity(formState.refreshTokenValidity, formState.refreshTokenUnit),
        authorities: [
            formState.authorities,
        ],
        scope: [
            formState.readAccess ? 'READ' : '',
            formState.writeAccess ? 'WRITE' : '',
        ].filter(Boolean),
    }

    const sendOAuthClientRequest = async (data: OAuthClient, token: string): Promise<Response> => {
        return await fetch(`${SW360_API_URL}/authorization/client-management`, {
            method: 'POST',
            headers: {
                Accept: 'application/*',
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(data),
        })
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formState.description.trim()) {
            newErrors.description = t('Description is required')
        }
        if (client === null && selectedOwnerEmail === '') {
            newErrors.ownerEmail = t('Owner user is required')
        }
        if (!formState.authorities.trim()) {
            newErrors.authorities = t('Authorities is required')
        }
        if (!formState.readAccess && !formState.writeAccess) {
            newErrors.scope = t('At least one scope must be selected')
        }
        if (!formState.accessTokenValidity) {
            newErrors.accessTokenValidity = t('Access Token Validity is required')
        } else if (Number(formState.accessTokenValidity) < 0) {
            newErrors.accessTokenValidity = t('Access Token Validity cannot be negative')
        }
        if (!formState.refreshTokenValidity) {
            newErrors.refreshTokenValidity = t('Refresh Token Validity is required')
        } else if (Number(formState.refreshTokenValidity) < 0) {
            newErrors.refreshTokenValidity = t('Refresh Token Validity cannot be negative')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }
        const response = await sendOAuthClientRequest(requestBody, await getAuthenticatedAccessToken())
        if (response.status === StatusCodes.OK || response.status === StatusCodes.CREATED) {
            const responseBody: unknown = await response.json()
            MessageService.success(
                client === null ? t('OAuth client created successfully') : t('OAuth client updated successfully'),
            )
            setShow(false)
            if (client === null) {
                setCreatedClientResponseJson(JSON.stringify(responseBody, null, 2))
                setShowCreatedClientResponse(true)
            }
        } else {
            MessageService.error(t('Failed to create OAuth client'))
        }
    }

    async function handleCopy() {
        if (createdClientResponseJson === null) return
        try {
            await navigator.clipboard.writeText(createdClientResponseJson)
            setCopied(true)
        } catch (e) {
            MessageService.error(t('Failed to copy to clipboard'))
            console.error(e)
        }
    }

    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop='static'
                centered
                size='lg'
            >
                <Modal.Header closeButton>
                    <Modal.Title>{client === null ? t('Create new client') : t('Edit client')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className='mb-3'>
                            <Form.Label className='fw-bold'>
                                {t('Description')}
                                <span className='text-danger'>*</span>
                            </Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter Description'
                                value={formState.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                isInvalid={!!errors.description}
                            />
                            <Form.Control.Feedback type='invalid'>{errors.description}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label className='fw-bold'>
                                {t('Owner Email')}
                                {client === null && <span className='text-danger'>*</span>}
                            </Form.Label>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type='text'
                                        id='ownerEmail'
                                        name='ownerEmail'
                                        value={selectedOwnerDisplayName}
                                        placeholder={t('Select Owner')}
                                        isInvalid={!!errors.ownerEmail}
                                        readOnly={true}
                                        disabled={client !== null}
                                        onClick={() => setShowOwnerDialog(true)}
                                    />
                                    <Form.Control.Feedback type='invalid'>{errors.ownerEmail}</Form.Control.Feedback>
                                    <SelectUsersDialog
                                        show={showOwnerDialog}
                                        setShow={setShowOwnerDialog}
                                        setSelectedUsers={setSelectedOwner}
                                        selectedUsers={selectedOwner}
                                        multiple={false}
                                    />
                                </Col>
                            </Row>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label className='fw-bold'>
                                        {t('Authorities')}
                                        <span className='text-danger'>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type='text'
                                        value={formState.authorities}
                                        onChange={(e) => updateField('authorities', e.target.value)}
                                        isInvalid={!!errors.authorities}
                                    />
                                    <Form.Control.Feedback type='invalid'>{errors.authorities}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label className='fw-bold'>
                                        {t('Scope')}
                                        <span className='text-danger'>*</span>
                                    </Form.Label>
                                    <div>
                                        <Form.Check
                                            type='checkbox'
                                            label='Read Access'
                                            checked={formState.readAccess}
                                            onChange={(e) => updateField('readAccess', e.target.checked)}
                                            isInvalid={!!errors.scope}
                                        />
                                        <Form.Check
                                            type='checkbox'
                                            label='Write Access'
                                            checked={formState.writeAccess}
                                            onChange={(e) => updateField('writeAccess', e.target.checked)}
                                            isInvalid={!!errors.scope}
                                        />
                                        {errors.scope && <div className='text-danger small'>{errors.scope}</div>}
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label className='fw-bold'>
                                        {t('Access Token Validity')}
                                        <span className='text-danger'>*</span>
                                    </Form.Label>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type='number'
                                                placeholder='Enter access token validity'
                                                value={formState.accessTokenValidity}
                                                onChange={(e) => updateField('accessTokenValidity', e.target.value)}
                                                isInvalid={!!errors.accessTokenValidity}
                                            />
                                            <Form.Control.Feedback type='invalid'>
                                                {errors.accessTokenValidity}
                                            </Form.Control.Feedback>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                as='select'
                                                value={formState.accessTokenUnit}
                                                onChange={handleTokenUnitChange(TokenType.Access)}
                                            >
                                                <option>{TokenUnit.Days}</option>
                                                <option>{TokenUnit.Seconds}</option>
                                            </Form.Control>
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label className='fw-bold'>
                                        {t('Refresh Token Validity')}
                                        <span className='text-danger'>*</span>
                                    </Form.Label>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type='number'
                                                placeholder='Enter refresh token validity'
                                                value={formState.refreshTokenValidity}
                                                onChange={(e) => updateField('refreshTokenValidity', e.target.value)}
                                                isInvalid={!!errors.refreshTokenValidity}
                                            />
                                            <Form.Control.Feedback type='invalid'>
                                                {errors.refreshTokenValidity}
                                            </Form.Control.Feedback>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                as='select'
                                                value={formState.refreshTokenUnit}
                                                onChange={handleTokenUnitChange(TokenType.Refresh)}
                                            >
                                                <option>{TokenUnit.Days}</option>
                                                <option>{TokenUnit.Seconds}</option>
                                            </Form.Control>
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='secondary'
                        onClick={handleClose}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant='primary'
                        onClick={() => void handleSubmit()}
                    >
                        {client === null ? t('Create') : t('Update')}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={showCreatedClientResponse}
                onHide={() => setShowCreatedClientResponse(false)}
                backdrop='static'
                centered
                size='lg'
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t('Created OAuth client')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {t.rich('COPY_CLIENT_SECRET', {
                            strong: (chunks) => <strong>{chunks}</strong>,
                        })}{' '}
                        <span className='text-danger fw-bold'>*</span>
                    </p>
                    <div className='position-relative'>
                        <Form.Control
                            as='textarea'
                            readOnly
                            rows={16}
                            value={createdClientResponseJson ?? ''}
                            className='oauth-client-response-json font-monospace bg-light pe-5'
                        />
                        <OverlayTrigger
                            trigger={[
                                'hover',
                                'focus',
                            ]}
                            placement='top'
                            overlay={(props) => (
                                <Tooltip {...props}>{copied ? t('Copied') : t('Copy to Clipboard')}</Tooltip>
                            )}
                            onToggle={(show) => {
                                if (show) setCopied(false)
                            }}
                        >
                            <Button
                                variant='link'
                                className='position-absolute top-0 end-0 m-2 p-1 text-body'
                                onClick={() => void handleCopy()}
                                aria-label={t('Copy to Clipboard')}
                            >
                                <BsClipboard size={20} />
                            </Button>
                        </OverlayTrigger>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='secondary'
                        onClick={() => setShowCreatedClientResponse(false)}
                    >
                        {t('Close')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
export default AddClientDialog
