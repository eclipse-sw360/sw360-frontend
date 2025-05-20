// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'

enum FossologyStatus {
    SUCCESS = 'Success',
    FAILURE = 'Failure',
}

export default function FossologyOverview() : ReactNode {
    const t = useTranslations('default')
    const [loading, setLoading] = useState(false)
    const [recheckConnection, setRecheckConnection] = useState(false)
    const [toggleGeneralInformation, setToggleGeneralInformation] = useState(false)
    const [fossologyStatus, setFossologyStatus] = useState<FossologyStatus>(FossologyStatus.SUCCESS)


    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            return HttpStatus.OK
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        fetchData('fossology/reServerConnection')
            .then((response: number | undefined) => {
                if (response === HttpStatus.OK) {
                    setFossologyStatus(FossologyStatus.SUCCESS)
                }
                else {
                    setFossologyStatus(FossologyStatus.FAILURE)
                }
                setLoading(false)
                setRecheckConnection(false)
            })
            .catch((err) => console.error(err))
    }, [fetchData, recheckConnection])
    

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
                        <button type='button' className='btn btn-primary col-auto me-2'>
                            {t('Save configuration')}
                        </button>
                        <button type='button' className='btn btn-secondary col-auto me-2'>
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
                            setToggleGeneralInformation(!toggleGeneralInformation)
                        }}
                    >
                        <tr>
                            <th colSpan={3}>{t('Connection Status')}</th>
                        </tr>
                    </thead>
                    <tbody hidden={toggleGeneralInformation}>
                        <tr>
                            <td>{t('Connection to FOSSology is currently in state')}:</td>
                            <td>
                                {
                                    loading ?
                                        <div className='col-12 mt-1 text-center'>
                                            <Spinner className='spinner' />
                                        </div> 
                                    :
                                        fossologyStatus === 'Success' ?
                                            <span className='badge bg-success capsule-right'
                                                style={{ fontSize: '0.8rem' }}>
                                                {t(`${fossologyStatus}`)}
                                            </span>
                                        :
                                            <span className='badge bg-danger capsule-right'
                                                style={{ fontSize: '0.8rem' }}>
                                                {t(`${fossologyStatus}`)}
                                            </span>
                                }
                            </td>
                            <td>
                                {t('checked on saved configuration')}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}
