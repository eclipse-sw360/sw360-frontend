// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { HttpStatus, OAuthClient } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { SW360_API_URL } from '@/utils/env'
import { getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'

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

    const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setFormState((prev) => ({ ...prev, [field]: value }))
    }

    useEffect(() => {
        if (client !== null) {
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
        } else {
            setFormState(defaultState)
        }
    }, [show])

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

    const calculateValidity = (value: string, unit: 'Days' | 'Seconds') =>
        Number(value) * (unit === 'Seconds' ? 1 : 86400)

    const requestBody = {
        ...(client && {
            client_id: client.client_id,
            client_secret: client.client_secret,
        }),
        description: formState.description,
        access_token_validity: calculateValidity(formState.accessTokenValidity, formState.accessTokenUnit),
        refresh_token_validity: calculateValidity(formState.refreshTokenValidity, formState.refreshTokenUnit),
        authorities: [formState.authorities],
        scope: [formState.readAccess ? 'READ' : '', formState.writeAccess ? 'WRITE' : ''].filter(Boolean),
    }

    const sendOAuthClientRequest = async (data: object, token: string): Promise<Response> => {
        return fetch(`${SW360_API_URL}/authorization/client-management`, {
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

        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return

        const response = await sendOAuthClientRequest(requestBody, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            MessageService.success(
                client === null ? t('OAuth client created successfully') : t('OAuth client updated successfully'),
            )
            setShow(false)
        } else {
            MessageService.error(t('Failed to create OAuth client'))
        }
    }

    return (
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
                        <Form.Label style={{ fontWeight: 'bold' }}>
                            {t('Description')}
                            <span
                                className='text-red'
                                style={{ color: 'red' }}
                            >
                                *
                            </span>
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
                    <Row>
                        <Col md={6}>
                            <Form.Group className='mb-3'>
                                <Form.Label style={{ fontWeight: 'bold' }}>
                                    {t('Authorities')}
                                    <span
                                        className='text-red'
                                        style={{ color: 'red' }}
                                    >
                                        *
                                    </span>
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
                                <Form.Label style={{ fontWeight: 'bold' }}>
                                    {t('Scope')}
                                    <span
                                        className='text-red'
                                        style={{ color: 'red' }}
                                    >
                                        *
                                    </span>
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
                                <Form.Label style={{ fontWeight: 'bold' }}>
                                    {t('Access Token Validity')}
                                    <span
                                        className='text-red'
                                        style={{ color: 'red' }}
                                    >
                                        *
                                    </span>
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
                                <Form.Label style={{ fontWeight: 'bold' }}>
                                    {t('Refresh Token Validity')}
                                    <span
                                        className='text-red'
                                        style={{ color: 'red' }}
                                    >
                                        *
                                    </span>
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
                    Cancel
                </Button>
                <Button
                    variant='primary'
                    onClick={handleSubmit}
                >
                    {client === null ? t('Create') : t('Update')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
export default AddClientDialog
