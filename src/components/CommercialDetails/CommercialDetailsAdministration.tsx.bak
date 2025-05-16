// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'

import { useCallback, useState, type JSX } from 'react';

import { Release } from '@/object-types'
import { SelectUsersDialog } from 'next-sw360'

interface Props {
    releasePayload: Release
    setReleasePayload: React.Dispatch<React.SetStateAction<Release>>
    cotsResponsible: { [k: string]: string }
    setCotsResponsible: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
}

const CommercialDetailsAdministration = ({
    releasePayload,
    setReleasePayload,
    cotsResponsible,
    setCotsResponsible,
}: Props): JSX.Element => {
    const t = useTranslations('default')
    const [dialogCotsResponsibleOpen, setDialogCotsResponsibleOpen] = useState(false)
    const handleClickSearchComponentOwner = useCallback(() => setDialogCotsResponsibleOpen(true), [])

    const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReleasePayload({
            ...releasePayload,
            cotsDetails: {
                ...releasePayload.cotsDetails,
                [e.target.name]: e.target.value,
            },
        })
    }

    const updateFieldChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReleasePayload({
            ...releasePayload,
            cotsDetails: {
                ...releasePayload.cotsDetails,
                [e.target.name]: e.target.checked,
            },
        })
    }

    const setCotsResponsibleToPayload = (responsibleUser: { [k: string]: string }) => {
        setCotsResponsible(responsibleUser)
        setReleasePayload({
            ...releasePayload,
            cotsDetails: {
                ...releasePayload.cotsDetails,
                cotsResponsible: (Object.keys(responsibleUser).length === 0) ? '' : Object.keys(responsibleUser)[0],
            },
        })
    }

    return (
        <>
            <div className='col' style={{ padding: '0px 12px' }}>
                <div className='row mb-4'>
                    <div className='section-header mb-2'>
                        <span className='fw-bold'>{t('Commercial Details Administration')}</span>
                    </div>
                    <div className='row with-divider pt-2 pb-2'>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='usageRightAvailable'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='usageRightAvailable'
                                    checked={releasePayload.cotsDetails?.usageRightAvailable ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='usageRightAvailable'>
                                    {t('Usage Right Available')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='COTS_responsible' className='form-label fw-bold'>
                                {t('COTS Responsible')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Click to edit'
                                id='COTS_responsible'
                                aria-describedby='COTS_responsible'
                                onClick={handleClickSearchComponentOwner}
                                readOnly={true}
                                name='COTS_responsible'
                                value={(Object.values(cotsResponsible).length === 0) ? '' : Object.values(cotsResponsible)[0]}
                            />
                            <SelectUsersDialog
                                show={dialogCotsResponsibleOpen}
                                setShow={setDialogCotsResponsibleOpen}
                                setSelectedUsers={setCotsResponsibleToPayload}
                                selectedUsers={cotsResponsible}
                                multiple={false}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='clearingDeadline' className='form-label fw-bold'>
                                {t('COTS Clearing Deadline')}
                            </label>
                            <input
                                type='date'
                                className='form-control'
                                placeholder='Enter material index number'
                                id='clearingDeadline'
                                aria-describedby='clearingDeadline'
                                name='clearingDeadline'
                                value={releasePayload.cotsDetails?.clearingDeadline ?? ''}
                                onChange={updateField}
                            />
                        </div>
                    </div>
                    <div className='row with-divider pt-2 pb-2'>
                        <div className='col-lg-4'>
                            <label htmlFor='licenseClearingReportURL' className='form-label fw-bold'>
                                {t('COTS Clearing Report URL')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter URL'
                                id='licenseClearingReportURL'
                                aria-describedby='licenseClearingReportURL'
                                name='licenseClearingReportURL'
                                value={releasePayload.cotsDetails?.licenseClearingReportURL ?? ''}
                                onChange={updateField}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CommercialDetailsAdministration
