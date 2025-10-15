// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ShowInfoOnHover } from 'next-sw360'
import React, { ReactNode, useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useConfigValue } from '@/contexts'
import { UIConfigKeys } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import styles from '../preferences.module.css'
import TokensTable from './TokensTable'

const UserAccessToken = (): ReactNode => {
    const t = useTranslations('default')
    const [validated, setValidated] = useState(false)
    const [tokenData, setTokenData] = useState({
        name: '',
        expirationDate: '',
        authorities: [
            'READ',
        ],
    })
    const [generatedToken, setGeneratedToken] = useState<string>('')
    const { status } = useSession()

    // Config values from backend
    const writeAuthorityAllowed =
        useConfigValue(UIConfigKeys.UI_REST_APITOKEN_WRITE_GENERATOR_ENABLE) === null
            ? true
            : (useConfigValue(UIConfigKeys.UI_REST_APITOKEN_WRITE_GENERATOR_ENABLE) as boolean)

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const generateToken = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget

        if (form.checkValidity() === false) {
            event.stopPropagation()
            setValidated(true)
        } else {
            setValidated(false)
            try {
                if (!writeAuthorityAllowed && 'WRITE' in tokenData.authorities) {
                    tokenData.authorities = tokenData.authorities.filter((v) => v.toLowerCase() !== 'write')
                }
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.POST('users/tokens', tokenData, session.user.access_token)

                if (response.status === StatusCodes.CREATED) {
                    const data: string = (await response.json()) as string
                    setGeneratedToken(data)
                    setTokenData({
                        name: '',
                        expirationDate: '',
                        authorities: [
                            'READ',
                        ],
                    })
                } else {
                    const errorData: Record<string, string> = (await response.json()) as Record<string, string>
                    MessageService.error(errorData.string)
                }
            } catch (error) {
                console.error('An error occurred:', error)
            }
        }
    }

    const handleChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGeneratedToken('')
        setTokenData({
            ...tokenData,
            [event.target.name]: event.target.value,
        })
    }

    const handleChangeAuthorities = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGeneratedToken('')
        let currentAuthorities = tokenData.authorities
        if (event.target.checked === false) {
            currentAuthorities = currentAuthorities.filter((authority) => authority !== event.target.value)
        } else {
            currentAuthorities.push(event.target.value)
        }
        setTokenData({
            ...tokenData,
            authorities: currentAuthorities,
        })
    }

    return (
        <>
            <div className='row'>
                <div className='col'>
                    <h4 className={styles.decorator}>{t('REST API Tokens')}</h4>
                    <Form
                        noValidate
                        validated={validated}
                        id='generateTokenForm'
                        onSubmit={(event) => {
                            generateToken(event).catch((error) => console.error(error))
                        }}
                    >
                        <table
                            className='table summary-table'
                            id='restInfoTable'
                        >
                            <thead>
                                <tr>
                                    <th colSpan={2}>{t('REST API Token')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{t('Name')}:</td>
                                    <td>
                                        <Form.Group>
                                            <Form.Control
                                                required
                                                name='name'
                                                className='form-control'
                                                id='rest_token'
                                                type='text'
                                                placeholder='Enter token name'
                                                value={tokenData.name}
                                                onChange={handleChangeText}
                                            />
                                            <Form.Control.Feedback type='invalid'>
                                                {t('Please enter a token name')}!
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </td>
                                </tr>
                                <tr>
                                    <td>{t('Authorities')}:</td>
                                    <td>
                                        <Form.Group>
                                            <Form.Check
                                                type='checkbox'
                                                id='authorities_read'
                                                name='authorities'
                                                value='READ'
                                                label='Read Access'
                                                required
                                                feedback='Read Access is required'
                                                feedbackType='invalid'
                                                checked={tokenData.authorities.includes('READ')}
                                                onChange={handleChangeAuthorities}
                                            />
                                            {writeAuthorityAllowed && (
                                                <Form.Check
                                                    type='checkbox'
                                                    value='WRITE'
                                                    id='authorities_write'
                                                    name='authorities'
                                                    label='Write Access'
                                                    checked={tokenData.authorities.includes('WRITE')}
                                                    onChange={handleChangeAuthorities}
                                                />
                                            )}
                                        </Form.Group>
                                    </td>
                                </tr>
                                <tr>
                                    <td>{t('Expiration Date')}:</td>
                                    <td>
                                        <Form.Control
                                            type='date'
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                            name='expirationDate'
                                            onChange={handleChangeText}
                                            value={tokenData.expirationDate}
                                        />
                                        <Form.Control.Feedback type='invalid'>
                                            {t('Please enter a valid expiration date')}!
                                        </Form.Control.Feedback>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {t('Token')}{' '}
                                        <ShowInfoOnHover text='Authorization Header (Authorization: Token <API-Token>)' />
                                        :
                                    </td>
                                    <td>
                                        <label
                                            id='accesstoken'
                                            className='inlinelabel'
                                        >
                                            <b>{generatedToken}</b>
                                        </label>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button
                            type='submit'
                            className='btn btn-secondary'
                        >
                            {t('Generate Token')}
                        </button>
                    </Form>
                </div>
            </div>
            <br />
            <TokensTable generatedToken={generatedToken} />
        </>
    )
}

export default UserAccessToken
