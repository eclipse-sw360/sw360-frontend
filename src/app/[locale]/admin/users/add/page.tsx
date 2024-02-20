// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useState } from 'react'
import { CreateUserPayload, HttpStatus, ToastData } from '@/object-types'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ApiUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { ToastMessage } from 'next-sw360'
import { ToastContainer } from 'react-bootstrap'

export default function CreateUser() { 
    const t = useTranslations('default')
    const [user, setUser] = useState<CreateUserPayload>({
        email: '',
        givenName: '',
        lastName: '',
        department: '',
        fullName: '',
        password: ''
    })
    const router = useRouter()

    const [toastData, setToastData] = useState<ToastData>({
        show: false,
        type: '',
        message: '',
        contextual: '',
    })

    const alert = (show_data: boolean, status_type: string, message: string, contextual: string) => {
        setToastData({
            show: show_data,
            type: status_type,
            message: message,
            contextual: contextual,
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleCreateUser = async () => {
        try {
            const session = await getSession()
            if (!session) {
                return signOut()
            }
            user.fullName = `${user.givenName} ${user.lastName}`
            const response = await ApiUtils.POST('users', user, session.user.access_token)
            if (response.status == HttpStatus.CREATED) {
                alert(true, 'Success', t('User is created'), 'success')
                router.push('/admin/users')
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else if (response.status === HttpStatus.CONFLICT) {
                alert(true, 'Duplicate', t('User with the same email already exists'), 'danger')
            } else {
                alert(true, 'Error', t('Something went wrong'), 'danger')
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleCancel = () => {
        router.push('/admin/users')
    }

    return (
        <>
            <div className='mx-5 mt-3'>
                <ToastContainer position='top-start'>
                    <ToastMessage
                        show={toastData.show}
                        type={toastData.type}
                        message={toastData.message}
                        contextual={toastData.contextual}
                        onClose={() => setToastData({ ...toastData, show: false })}
                        setShowToast={setToastData}
                    />
                </ToastContainer>
                <div className="row mb-4">
                    <button className='btn btn-primary col-auto me-2' onClick={handleCreateUser}>
                        {t('Create User')}
                    </button>
                    <button className='btn btn-light col-auto' onClick={handleCancel}>
                        {t('Cancel')}
                    </button>
                </div>
                <div className='row mb-4 mx-0'>
                    <div className='row header mb-2 pb-2 px-2'>
                        <h6>{t('General Information')}</h6>
                    </div>
                    <div className='row mb-3'>
                        <div className='col-lg-6'>
                            <label htmlFor='addUser.givenName' className='form-label fw-medium'>
                                {t('Given Name')}{' '}
                                <span className='required'>
                                    *
                                </span>
                            </label>
                            <input
                                type='text'
                                name='givenName'
                                value={user?.givenName}
                                onChange={handleChange}
                                className='form-control'
                                id='addUser.givenName'
                                placeholder={t('Enter user given name')}
                                required
                            />
                        </div>
                        <div className='col-lg-6'>
                            <label htmlFor='addUser.lastName' className='form-label fw-medium'>
                                {t('Last Name')}{' '}
                                <span className='required'>
                                    *
                                </span>
                            </label>
                            <input
                                type='text'
                                name='lastName'
                                value={user?.lastName}
                                onChange={handleChange}
                                className='form-control'
                                id='addUser.lastName'
                                placeholder={t('Enter user last name')}
                                required
                            />
                        </div>
                    </div>
                    <div className='row mb-3'>
                        <div className='col-lg-6'>
                            <label htmlFor='addUser.email' className='form-label fw-medium'>
                                {t('Email')}{' '}
                                <span className='required'>
                                    *
                                </span>
                            </label>
                            <input
                                type='text'
                                name='email'
                                value={user?.email}
                                onChange={handleChange}
                                className='form-control'
                                id='addUser.email'
                                placeholder={t('Enter user email')}
                                required
                            />
                        </div>
                        <div className='col-lg-6'>
                            <label htmlFor='addUser.password' className='form-label fw-medium'>
                                {t('Password')}{' '}
                                <span className='required'>
                                    *
                                </span>
                            </label>
                            <input
                                type='password'
                                name='password'
                                value={user?.password}
                                onChange={handleChange}
                                className='form-control'
                                id='addUser.password'
                                placeholder={t('Enter user password')}
                                required
                            />
                        </div>
                    </div>
                    <div className='row mb-3'>
                        <div className='col-lg-6'>
                            <label htmlFor='addUser.department' className='form-label fw-medium'>
                                {t('Department')}{' '}
                                <span className='required'>
                                    *
                                </span>
                            </label>
                            <input
                                type='text'
                                name='department'
                                value={user?.department}
                                onChange={handleChange}
                                className='form-control'
                                id='addUser.department'
                                placeholder={t('Enter user primary department')}
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}