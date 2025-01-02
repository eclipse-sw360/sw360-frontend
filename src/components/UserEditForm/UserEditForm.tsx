// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { UserPayload } from '@/object-types'
import { useTranslations } from 'next-intl'
import UserOperationType from './UserOperationType'

interface Props {
    userPayload: UserPayload
    handleChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => void
    userOperationType: UserOperationType
}

const UserRoles = {
    USER: 'User',
    ADMIN: 'Admin',
    CLEARING_ADMIN: 'Clearing Admin',
    CLEARING_EXPERT: 'Clearing Expert',
    ECC_ADMIN: 'ECC Admin',
    SERCURITY_ADMIN: 'Security Admin',
    SW360_ADMIN: 'SW360 Admin',
}

const UserEditForm = ( { userPayload, handleChange, userOperationType }: Props) : JSX.Element => {
    const t = useTranslations('default')

    return <div className='row mb-4 mx-0'>
        <div className='row header mb-2 pb-2 px-2'>
            <h6>{t('General Information')}</h6>
        </div>
        <div className='row mb-3'>
            <div className='col-lg-6'>
                <label htmlFor='user.givenName' className='form-label fw-medium'>
                    {t('Given Name')}{' '}
                    <span className='required'>
                        *
                    </span>
                </label>
                <input
                    type='text'
                    name='givenName'
                    value={userPayload.givenName}
                    onChange={handleChange}
                    className='form-control'
                    id='user.givenName'
                    placeholder={t('Enter user given name')}
                    required
                />
            </div>
            <div className='col-lg-6'>
                <label htmlFor='user.lastName' className='form-label fw-medium'>
                    {t('Last Name')}{' '}
                    <span className='required'>
                        *
                    </span>
                </label>
                <input
                    type='text'
                    name='lastName'
                    value={userPayload.lastName}
                    onChange={handleChange}
                    className='form-control'
                    id='user.lastName'
                    placeholder={t('Enter user last name')}
                    required
                />
            </div>
        </div>
        <div className='row mb-3'>
            <div className='col-lg-6'>
                <label htmlFor='user.email' className='form-label fw-medium'>
                    {t('Email')}{' '}
                    <span className='required'>
                        *
                    </span>
                </label>
                <input
                    type='email'
                    name='email'
                    value={userPayload.email}
                    onChange={handleChange}
                    className='form-control'
                    id='user.email'
                    placeholder={t('Enter user email')}
                    required
                />
            </div>
            <div className='col-lg-6'>
                <label htmlFor='user.password' className='form-label fw-medium'>
                    {t('Password')}{' '}
                    {
                        (userOperationType === UserOperationType.CREATE)
                            ? <span className='required'>*</span>
                            : <span> {`(${t('Keep password empty to reuse old password')})`} </span>
                    }
                </label>
                <input
                    type='password'
                    name='password'
                    value={userPayload.password}
                    onChange={handleChange}
                    className='form-control'
                    id='user.password'
                    placeholder={t('Enter user password')}
                    autoComplete='new-password'
                    required={userOperationType === UserOperationType.CREATE}
                />
            </div>
        </div>
        <div className='row mb-3'>
            <div className='col-lg-6'>
                <label htmlFor='user.department' className='form-label fw-medium'>
                    {t('Department')}{' '}
                    <span className='required'>
                        *
                    </span>
                </label>
                <input
                    type='text'
                    name='department'
                    value={userPayload.department}
                    onChange={handleChange}
                    className='form-control'
                    id='user.department'
                    placeholder={t('Enter user primary department')}
                    required
                />
            </div>
            <div className='col-lg-6'>
                <label htmlFor='user.primary.role' className='form-label fw-medium'>
                    {t('Primary role')}{' '}
                    <span className='required'>
                        *
                    </span>
                </label>
                <select className='form-control' name='userGroup' defaultValue={userPayload.userGroup} onChange={handleChange} required>
                    <option value=''>{t('Select primary role')}</option>
                    {
                        Object.entries(UserRoles).map(([key, value]) => <option key={key} value={key}>{value}</option>)
                    }
                </select>
            </div>
        </div>
    </div>
}

export default UserEditForm