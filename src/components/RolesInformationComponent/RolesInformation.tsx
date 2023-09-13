// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import styles from '../GeneralInfoComponent/SummaryComponent.module.css'
import React, { useCallback, useState } from 'react'
import { Session } from '@/object-types/Session'
import 'react-toastify/dist/ReactToastify.css'
import ComponentOwner from '@/object-types/ComponentOwner'
import Moderators from '@/object-types/Moderators'
import SelectCountryComponent from '@/components/SelectCountry'
import ComponentPayload from '@/object-types/ComponentPayLoad'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import ModeratorsDialog from '../sw360/SearchModerators/ModeratorsDialog'
import ComponentOwnerDialog from '@/components/sw360/SearchComponentOwner/ComponentOwnerDialog'
interface Props {
    session?: Session
    componentPayload?: ComponentPayload
    setComponentPayload?: React.Dispatch<React.SetStateAction<ComponentPayload>>
    componentOwner?: ComponentOwner
    setComponentOwner?: React.Dispatch<React.SetStateAction<ComponentOwner>>
    moderator?: Moderators
    setModerator?: React.Dispatch<React.SetStateAction<Moderators>>
}

const RolesInformation = ({
    session,
    componentPayload,
    setComponentPayload,
    componentOwner,
    setComponentOwner,
    moderator,
    setModerator,
}: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
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

    const setComponentOwnerId = (componentOwnerResponse: ComponentOwner) => {
        const componentOwner: ComponentOwner = {
            email: componentOwnerResponse.email,
            fullName: componentOwnerResponse.fullName,
        }
        setComponentOwner(componentOwner)
        setComponentPayload({
            ...componentPayload,
            componentOwner: componentOwnerResponse.email,
        })
    }

    const setModerators = (moderatorsResponse: Moderators) => {
        const moderator: Moderators = {
            emails: moderatorsResponse.emails,
            fullName: moderatorsResponse.fullName,
        }
        setModerator(moderator)
        setComponentPayload({
            ...componentPayload,
            moderators: moderatorsResponse.emails,
        })
    }

    const handleClearComponentOwner = () => {
        const componentOwner: ComponentOwner = {
            email: '',
            fullName: '',
        }
        setComponentOwner(componentOwner)
        setComponentPayload({
            ...componentPayload,
            componentOwner: '',
        })
    }

    const handleClearModerators = () => {
        const moderator: Moderators = {
            emails: null,
            fullName: '',
        }
        setModerator(moderator)
        setComponentPayload({
            ...componentPayload,
            moderators: [],
        })
    }

    return (
        <>
            <div className='row mb-4' style={{ padding: '0px 12px' }}>
                <div className={`${styles['header']} mb-2`}>
                    <p className='fw-bold mt-3'> {t('Roles')}</p>
                </div>
                <div className='row'>
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
                            onChange={updateField}
                            value={componentOwner.fullName ?? ''}
                        />
                        <ComponentOwnerDialog
                            show={dialogOpenComponentOwner}
                            setShow={setDialogOpenComponentOwner}
                            session={session}
                            selectComponentOwner={setComponentOwnerId}
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
                <hr className='my-4' />
                <div className='row'>
                    <div className='col-lg-4'>
                        <SelectCountryComponent
                            selectCountry={updateField}
                            value={componentPayload.ownerCountry ?? ''}
                        />
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
                            value={moderator.fullName ?? ''}
                            onClick={handleClickSearchModerators}
                        />
                        <ModeratorsDialog
                            show={dialogOpenModerators}
                            setShow={setDialogOpenModerators}
                            session={session}
                            selectModerators={setModerators}
                        />
                        <span onClick={handleClearModerators}>x</span>
                    </div>
                </div>
                <hr className='my-4' />
            </div>
        </>
    )
}

export default React.memo(RolesInformation)
