// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import React, { useCallback, useState } from 'react'

import { ComponentPayload } from '@/object-types'
import { SelectUsersDialog, SelectCountry } from 'next-sw360'

interface Props {
    componentPayload?: ComponentPayload
    setComponentPayload?: React.Dispatch<React.SetStateAction<ComponentPayload>>
    componentOwner?: { [k: string]: string }
    setComponentOwner?: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    moderators?: { [k: string]: string }
    setModerators?: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
}

const RolesInformation = ({
    componentPayload,
    setComponentPayload,
    componentOwner,
    setComponentOwner,
    moderators,
    setModerators,
}: Props) => {
    const t = useTranslations('default')
    const [dialogOpenComponentOwner, setDialogOpenComponentOwner] = useState(false)
    const [dialogOpenModerators, setDialogOpenModerators] = useState(false)
    const handleClickSearchComponentOwner = useCallback(() => setDialogOpenComponentOwner(true), [])
    const handleClickSearchModerators = useCallback(() => setDialogOpenModerators(true), [])

    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setComponentPayload({
            ...componentPayload,
            [e.target.name]: e.target.value,
        })
    }

    const setComponentOwnerToPayload = (user: { [k: string]: string }) => {
        const userEmails = Object.keys(user)
        if (userEmails.length === 0) {
            setComponentOwner({})
            setComponentPayload({
                ...componentPayload,
                componentOwner: '',
            })
        } else {
            setComponentOwner(user)
            setComponentPayload({
                ...componentPayload,
                componentOwner: userEmails[0],
            })
        }
    }

    const setModeratorsToPayload = (users: { [k: string]: string }) => {
        setModerators(users)
        setComponentPayload({
            ...componentPayload,
            moderators: Object.keys(users),
        })
    }

    const handleClearComponentOwner = () => {
        setComponentOwner({})
        setComponentPayload({
            ...componentPayload,
            componentOwner: '',
        })
    }

    const handleClearModerators = () => {
        setModerators({})
        setComponentPayload({
            ...componentPayload,
            moderators: [],
        })
    }

    return (
        <>
            <div className='row mb-4' style={{ padding: '0px 12px' }}>
                <div className='section-header mb-2'>
                    <span className='fw-bold'>{t('Roles')}</span>
                </div>
                <div className='row with-divider pt-2 pb-2'>
                    <div className='col-lg-4'>
                        <label htmlFor='component_owner' className='form-label fw-bold'>
                            {t('Component Owner')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            data-bs-toggle='modal'
                            data-bs-target='#search_users_modal'
                            placeholder={t('Click to edit')}
                            id='component_owner'
                            aria-describedby='component_owner'
                            readOnly={true}
                            name='componentOwner'
                            onClick={handleClickSearchComponentOwner}
                            value={(Object.values(componentOwner).length === 0) ? '' : Object.values(componentOwner)[0]}
                        />
                        <SelectUsersDialog
                            show={dialogOpenComponentOwner}
                            setShow={setDialogOpenComponentOwner}
                            setSelectedUsers={setComponentOwnerToPayload}
                            selectedUsers={componentOwner}
                            multiple={false}
                        />
                        <span onClick={handleClearComponentOwner}>x</span>
                    </div>
                    <div className='col-lg-4'>
                        <label htmlFor='owner_accounting_unit' className='form-label fw-bold'>
                            {t('Owner Accounting Unit')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={t('Enter Owner Accounting Unit')}
                            id='owner_accounting_unit'
                            aria-describedby='Owner Accounting Unit'
                            name='ownerAccountingUnit'
                            onChange={updateField}
                            value={componentPayload.ownerAccountingUnit ?? ''}
                        />
                    </div>
                    <div className='col-lg-4'>
                        <label htmlFor='owner_billing_group' className='form-label fw-bold'>
                            {t('Owner Billing Group')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={t('Enter Owner Billing Group')}
                            id='owner_billing_group'
                            aria-describedby='Owner Billing Group'
                            name='ownerGroup'
                            onChange={updateField}
                            value={componentPayload.ownerGroup ?? ''}
                        />
                    </div>
                </div>
                <div className='row with-divider pt-2 pb-2'>
                    <div className='col-lg-4'>
                        <SelectCountry selectCountry={updateField} value={componentPayload.ownerCountry ?? ''} />
                    </div>
                    <div className='col-lg-4'>
                        <label htmlFor='moderators' className='form-label fw-bold'>
                            {t('Moderators')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            data-bs-toggle='modal'
                            data-bs-target='#search_users_modal'
                            placeholder={t('Click to edit')}
                            id='moderators'
                            aria-describedby='Moderators'
                            readOnly={true}
                            name='moderators'
                            onChange={updateField}
                            value={Object.values(moderators).join(', ')}
                            onClick={handleClickSearchModerators}
                        />
                        <SelectUsersDialog
                            show={dialogOpenModerators}
                            setShow={setDialogOpenModerators}
                            setSelectedUsers={setModeratorsToPayload}
                            selectedUsers={moderators}
                            multiple={true}
                        />
                        <span onClick={handleClearModerators}>x</span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default React.memo(RolesInformation)
