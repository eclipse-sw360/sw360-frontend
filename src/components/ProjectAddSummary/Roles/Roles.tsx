// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { GiCancel } from 'react-icons/gi'

import { SelectCountry } from 'next-sw360'
import DepartmentModal from './DepartmentModal'
import UsersModal from './UsersModal'
import {ProjectPayload} from '@/object-types'

interface Props{
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}


export default function Roles({projectPayload, setProjectPayload}:Props) {
    const t = useTranslations('default')

    const [showDepartmentModal, setShowDepartmentModal] = useState<boolean>(false)
    const [showUsersModal, setShowUsersModal] = useState<boolean>(false)

    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setProjectPayload({
            ...projectPayload,
            [e.target.name]: e.target.value,
        })
    }

    return (
        <>
            <DepartmentModal show={showDepartmentModal} setShow={setShowDepartmentModal} />
            <UsersModal show={showUsersModal} setShow={setShowUsersModal} />
            <div className='row mb-4'>
                <h6 className='header pb-2 px-2'>{t('Roles')}</h6>
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.group' className='form-label fw-medium'>
                            {t('Group')} <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.group'
                            aria-label={t('Group')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            required
                            onClick={() => setShowDepartmentModal(true)}
                        />
                        <div className='form-text'>
                            {' '}
                            <GiCancel />
                        </div>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.projectManager' className='form-label fw-medium'>
                            {t('Project Manager')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.projectManager'
                            aria-label={t('Project Manager')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            onClick={() => setShowUsersModal(true)}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.projectOwner' className='form-label fw-medium'>
                            {t('Project Owner')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.projectOwner'
                            aria-label={t('Project Owner')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            onClick={() => setShowUsersModal(true)}
                        />
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.ownerAccountingUnit' className='form-label fw-medium'>
                            {t('Owner Accounting Unit')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            aria-label={t('Owner Accounting Unit')}
                            id='addProjects.ownerAccountingUnit'
                            placeholder={t('owner_account_unit')}
                            name='ownerAccountingUnit'
                            onChange={updateField}
                            value={projectPayload.ownerAccountingUnit ?? ''}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.ownerBillingGroup' className='form-label fw-medium'>
                            {t('Owner Billing Group')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            aria-label={t('Owner Billing Group')}
                            id='addProjects.ownerGroup'
                            placeholder={t('Enter Owner Billing Group')}
                            name='ownerGroup'
                            onChange={updateField}
                            value={projectPayload.ownerGroup ?? ''}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <SelectCountry selectCountry={updateField} value={projectPayload.ownerCountry ?? ''} />
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.leadArchitect' className='form-label fw-medium'>
                            {t('Lead Architect')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.leadArchitect'
                            aria-label={t('Lead Architect')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            onClick={() => setShowUsersModal(true)}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.moderators' className='form-label fw-medium'>
                            {t('Moderators')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.moderators'
                            aria-label={t('Moderators')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            onClick={() => setShowUsersModal(true)}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.contributors' className='form-label fw-medium'>
                            {t('Contributors')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.contributors'
                            aria-label={t('Contributors')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            onClick={() => setShowUsersModal(true)}
                        />
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.securityResponsibles' className='form-label fw-medium'>
                            {t('Security Responsibles')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.securityResponsibles'
                            aria-label={t('Security Responsibles')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            onClick={() => setShowUsersModal(true)}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
