// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { FossologyConfig, HttpStatus } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'

enum FossologyStatus {
    SUCCESS = 'Success',
    UNKNOWN = 'Unknown',
}

export default function FossologyOverview(): ReactNode {
    const router = useRouter()
    const t = useTranslations('default')
    const [toggle, setToggle] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [recheckConnection, setRecheckConnection] = useState<boolean>(false)
    const [fossologyConfigData, setFossologyConfigData] = useState<FossologyConfig>({
        url: '',
        folderId: '',
        token: '',
        token_set: false,
    })
    const [fossologyStatus, setFossologyStatus] = useState<FossologyStatus>(FossologyStatus.UNKNOWN)

    const fetchData = useCallback(async (url: string, serverConfig: boolean) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            if (serverConfig) {
                const data = await response.json()
                return data
            } else return HttpStatus.OK
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        fetchData('fossology/reServerConnection', false)
            .then((response: number | undefined) => {
                if (response === HttpStatus.OK) {
                    setFossologyStatus(FossologyStatus.SUCCESS)
                } else {
                    setFossologyStatus(FossologyStatus.UNKNOWN)
                }
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            })
            .finally(() => {
                setLoading(false)
                setRecheckConnection(false)
            })
    }, [fetchData, recheckConnection])

    useEffect(() => {
        fetchData('fossology/configData', true)
            .then((response: FossologyConfig | undefined) => {
                if (response) {
                    setFossologyConfigData(response)
                }
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            })
    }, [fetchData])

    const updateInputField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFossologyConfigData({
            ...fossologyConfigData,
            [event.target.name]: event.target.value,
        })
    }

    const updateFossologyConfig = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.POST('fossology/saveConfig', fossologyConfigData, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            MessageService.success(t('Fossology configuration updated successfully'))
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.warn(t('Unauthorized request'))
            return
        } else {
            MessageService.error(t('Fossology configuration update failed'))
        }
    }

    const handleCancel = () => {
        router.push('/admin')
    }

    return (
        <>
            <div className='mt-4 mx-5'>
                <div className='row'>
                    <div className='col-lg-8'>
                        <button
                            type='button'
                            className='btn btn-primary col-auto me-2'
                            onClick={() => setRecheckConnection(true)}
                        >
                            {t('Re-Check connection')}
                        </button>
                        <button
                            type='button'
                            className='btn btn-primary col-auto me-2'
                            onClick={() => updateFossologyConfig()}
                        >
                            {t('Save configuration')}
                        </button>
                        <button
                            type='button'
                            className='btn btn-secondary col-auto me-2'
                            onClick={() => handleCancel()}
                        >
                            {t('Cancel')}
                        </button>
                    </div>
                    <div className='col-lg-4 d-flex justify-content-end buttonheader-title'>
                        {t('Fossology Connection Administration')}
                    </div>
                </div>

                <table className='table summary-table mt-4'>
                    <thead
                        title='Click to expand or collapse'
                        onClick={() => {
                            setToggle(!toggle)
                        }}
                    >
                        <tr>
                            <th colSpan={3}>{t('Connection Status')}</th>
                        </tr>
                    </thead>
                    <tbody hidden={toggle}>
                        <tr>
                            <td>{t('Connection to FOSSology is currently in state')}:</td>
                            <td>
                                {loading ? (
                                    <div className='col-12 mt-1 text-center'>
                                        <Spinner className='spinner' />
                                    </div>
                                ) : fossologyStatus === 'Success' ? (
                                    <span
                                        className='badge bg-success capsule-right'
                                        style={{ fontSize: '0.8rem' }}
                                    >
                                        {t(`${fossologyStatus}`)}
                                    </span>
                                ) : (
                                    <span
                                        className='badge bg-danger capsule-right'
                                        style={{ fontSize: '0.8rem' }}
                                    >
                                        {t(`${fossologyStatus}`)}
                                    </span>
                                )}
                            </td>
                            <td>{t('checked on saved configuration')}</td>
                        </tr>
                    </tbody>
                </table>
                <div className='section-header mb-2'>
                    <span className='fw-bold'>{t('Connection Configuration')}</span>
                </div>
                <div className='row'>
                    <div className='col-lg-6 mb-3'>
                        <label
                            className='form-label fw-medium'
                            htmlFor='fossologyConfig.url'
                        >
                            {t('URL')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='fossologyConfig.url'
                            name='url'
                            required
                            value={fossologyConfigData.url}
                            onChange={updateInputField}
                        />
                    </div>
                    <div className='col-lg-6 mb-3'>
                        <label
                            className='form-label fw-medium'
                            htmlFor='fossologyConfig.folderId'
                        >
                            {t('Folder Id')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='fossologyConfig.folderId'
                            name='folderId'
                            required
                            value={fossologyConfigData.folderId}
                            onChange={updateInputField}
                        />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-lg-12 mb-3'>
                        <label
                            className='form-label fw-medium'
                            htmlFor='fossologyConfig.accessToken'
                        >
                            {t('Access Token')}
                        </label>
                        <input
                            type='password'
                            className='form-control'
                            id='fossologyConfig.token'
                            name='token'
                            required
                            placeholder={
                                (fossologyConfigData.token_set ?? false) ? t('Token exits') : t('No token found')
                            }
                            value={fossologyConfigData.token ?? ''}
                            onChange={updateInputField}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
