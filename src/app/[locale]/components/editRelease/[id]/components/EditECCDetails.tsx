// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BiInfoCircle } from 'react-icons/bi'

import { Release } from '@/object-types'

interface Props {
    releasePayload: Release
    setReleasePayload: React.Dispatch<React.SetStateAction<Release>>
}

const ShowInfoOnHover = ({ text }: { text: string }) => {
    return (
        <>
            <OverlayTrigger overlay={<Tooltip>{text}</Tooltip>}>
                <span className='d-inline-block'>
                    <BiInfoCircle />
                </span>
            </OverlayTrigger>
        </>
    )
}

const EditECCDetails = ({ releasePayload, setReleasePayload }: Props) => {
    const t = useTranslations('default')
    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setReleasePayload({
            ...releasePayload,
            eccInformation: {
                ...releasePayload.eccInformation,
                [e.target.name]: e.target.value,
            },
        })
    }

    return (
        <>
            <div
                className='container'
                style={{ maxWidth: '98vw', marginTop: '10px', fontSize: '0.875rem' }}
            >
                <div
                    className='col'
                    style={{ padding: '0px 12px', fontSize: '0.875rem' }}
                >
                    <div className='row mb-4'>
                        <div className='section-header mb-2'>
                            <span className='fw-bold'>{t('ECC Information')}</span>
                        </div>
                        <div className='row with-divider pt-2 pb-2'>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='ECC_Status'
                                    className='form-label fw-bold'
                                >
                                    {t('ECC Status')}
                                </label>
                                <select
                                    className='form-select'
                                    aria-label='component_type'
                                    id='ECC_Status'
                                    required
                                    name='eccStatus'
                                    value={releasePayload.eccInformation?.eccStatus ?? ''}
                                    onChange={updateField}
                                >
                                    <option value='OPEN'>{t('OPEN')}</option>
                                    <option value='IN_PROGRESS'> {t('IN_PROGRESS')}</option>
                                    <option value='APPROVED'>{t('APPROVED')}</option>
                                    <option value='REJECTED'>{t('REJECTED')}</option>
                                </select>
                                <div
                                    className='form-text'
                                    id='addProjects.visibility.HelpBlock'
                                >
                                    <ShowInfoOnHover text={t('ECC_STATUS')} />
                                    {t('Learn more about ECC statuses')}.
                                </div>
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='ECC_comment'
                                    className='form-label fw-bold'
                                >
                                    {t('ECC Comment')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder='Enter ECC comment'
                                    id='ECC_comment'
                                    aria-describedby='version'
                                    required
                                    name='eccComment'
                                    value={releasePayload.eccInformation?.eccComment ?? ''}
                                    onChange={updateField}
                                />
                            </div>
                        </div>
                        <div className='row with-divider pt-2 pb-2'>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='ausfuhrliste'
                                    className='form-label fw-bold'
                                >
                                    {t('Ausfuhrliste')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder='Enter AL'
                                    id='ausfuhrliste'
                                    aria-describedby='ausfuhrliste'
                                    name='al'
                                    value={releasePayload.eccInformation?.al ?? ''}
                                    onChange={updateField}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='eccn'
                                    className='form-label fw-bold'
                                >
                                    {t('ECCN')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder='Enter ECCN'
                                    id='eccn'
                                    aria-describedby='eccn'
                                    name='eccn'
                                    value={releasePayload.eccInformation?.eccn ?? ''}
                                    onChange={updateField}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='material_index_number'
                                    className='form-label fw-bold'
                                >
                                    {t('Material Index Number')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder='Enter material index number'
                                    id='material_index_number'
                                    aria-describedby='material_index_number'
                                    name='materialIndexNumber'
                                    value={releasePayload.eccInformation?.materialIndexNumber ?? ''}
                                    onChange={updateField}
                                />
                            </div>
                        </div>
                        <div className='row with-divider pt-2 pb-2'>
                            <div className='col-lg-4'>
                                <label className='form-label fw-bold'>{t('Contains Cryptography')}</label>
                                <div>
                                    <div className='form-check'>
                                        <input
                                            className='form-check-input'
                                            type='radio'
                                            id='contains_cryptography_yes'
                                            name='containsCryptography'
                                            value='true'
                                            checked={releasePayload.eccInformation?.containsCryptography === true}
                                            onChange={(e) =>
                                                setReleasePayload({
                                                    ...releasePayload,
                                                    eccInformation: {
                                                        ...releasePayload.eccInformation,
                                                        containsCryptography: e.target.value === 'true',
                                                    },
                                                })
                                            }
                                        />
                                        <label
                                            className='form-check-label'
                                            htmlFor='contains_cryptography_yes'
                                        >
                                            {t('Yes')}
                                        </label>
                                    </div>
                                    <div className='form-check'>
                                        <input
                                            className='form-check-input'
                                            type='radio'
                                            id='contains_cryptography_no'
                                            name='containsCryptography'
                                            value='false'
                                            checked={releasePayload.eccInformation?.containsCryptography === false}
                                            onChange={(e) =>
                                                setReleasePayload({
                                                    ...releasePayload,
                                                    eccInformation: {
                                                        ...releasePayload.eccInformation,
                                                        containsCryptography: e.target.value === 'true',
                                                    },
                                                })
                                            }
                                        />
                                        <label
                                            className='form-check-label'
                                            htmlFor='contains_cryptography_no'
                                        >
                                            {t('No')}
                                        </label>
                                    </div>
                                </div>
                                <div
                                    className='form-text'
                                    id='containsCryptography.HelpBlock'
                                >
                                    <ShowInfoOnHover text={t('Contains Cryptography')} />
                                    {t('cryptoinfo')}.
                                </div>
                            </div>
                        </div>
                        <div className='row with-divider pt-2 pb-2'>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='assessor_contact_person'
                                    className='form-label fw-bold'
                                >
                                    {t('Assessor Contact Person')}
                                </label>
                                <input
                                    type='URL'
                                    className='form-control'
                                    placeholder='Will be set automatically'
                                    id='assessor_contact_person'
                                    aria-describedby='assessor_contact_person'
                                    name='assessorContactPerson'
                                    readOnly={true}
                                    value={releasePayload.eccInformation?.assessorContactPerson ?? ''}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='assessor_department'
                                    className='form-label fw-bold'
                                >
                                    {t('Assessor Department')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder='Will be set automatically'
                                    id='assessor_department'
                                    aria-describedby='assessor_department'
                                    name='assessorDepartment'
                                    readOnly={true}
                                    value={releasePayload.eccInformation?.assessorDepartment ?? ''}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='assessment_date'
                                    className='form-label fw-bold'
                                >
                                    {t('Assessment Date')}
                                </label>
                                <input
                                    type='date'
                                    className='form-control'
                                    data-bs-toggle='modal'
                                    data-bs-target='#search_vendors_modal'
                                    placeholder={t('Will be set automatically')}
                                    id='assessment_date'
                                    aria-describedby='assessment_date'
                                    readOnly={true}
                                    name='assessmentDate'
                                    value={releasePayload.eccInformation?.assessmentDate ?? ''}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default React.memo(EditECCDetails)
