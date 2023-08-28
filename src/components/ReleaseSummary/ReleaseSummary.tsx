// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import styles from './ReleaseSummary.module.css'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BiInfoCircle } from 'react-icons/bi'
import { Session } from '@/object-types/Session'
import Vendor from '@/object-types/Vendor'
import Licenses from '@/object-types/Licenses'
import ModeratorsDiaglog from '../sw360/SearchModerators/ModeratorsDiaglog'
import Moderators from '@/object-types/Moderators'
import ReleasePayload from '@/object-types/ReleasePayload'
interface Props {
    session?: Session
    releasePayload: ReleasePayload
    setReleasePayload: React.Dispatch<React.SetStateAction<ReleasePayload>>
    vendor?: Vendor
    setVendor?: React.Dispatch<React.SetStateAction<Vendor>>
    mainLicensesId?: Licenses
    setMainLicensesId?: React.Dispatch<React.SetStateAction<Licenses>>
    otherLicensesId?: Licenses
    setOtherLicensesId?: React.Dispatch<React.SetStateAction<Licenses>>
    contributor?: Moderators
    setContributor?: React.Dispatch<React.SetStateAction<Moderators>>
    moderator?: Moderators
    setModerator?: React.Dispatch<React.SetStateAction<Moderators>>
}

const getDate = () => {
    const today = new Date()
    const month = today.getMonth() + 1
    const year = today.getFullYear()
    const date = today.getDate()
    return `${month}/${date}/${year}`
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
    );
};

const ReleaseSummary = ({
    session,
    releasePayload,
    setReleasePayload,
    vendor,
    setVendor,
    mainLicensesId,
    setMainLicensesId,
    otherLicensesId,
    setOtherLicensesId,
    contributor,
    setContributor,
    moderator,
    setModerator,
}: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [currentDate, setCurrentDate] = useState(getDate())
    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setReleasePayload({
            ...releasePayload,
            [e.target.name]: e.target.value,
        })
    }

    const setArrayData = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const data: string[] = splitValueCategories(e.target.value)
        setReleasePayload({
            ...releasePayload,
            [e.target.name]: data,
        })
    }

    const splitValueCategories = (valueCatergories: string) => {
        return valueCatergories.split(',')
    }

    return (
        <>
            <div className='col' style={{ padding: '0px 12px' }}>
                <div className='row mb-4'>
                    <div className={`${styles['header']} mb-2`}>
                        <p className='fw-bold mt-3'>{t('Release Summary')}</p>
                    </div>
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='default_vendor' className='form-label fw-bold'>
                                {t('Vendor')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                data-bs-toggle='modal'
                                data-bs-target='#search_vendors_modal'
                                placeholder={t('Click to set vendor')}
                                id='default_vendor'
                                aria-describedby='Vendor'
                                readOnly={true}
                                name='defaultVendorId'
                                value={vendor.fullName ?? ''}
                            />
                            <span >x</span>
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='name' className='form-label fw-bold'>
                                {t('Name')} <span className='text-red' style={{color: '#F7941E'}}>*</span>
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Enter Name')}
                                id='name'
                                name='name'
                                aria-describedby='name'
                                readOnly={true}
                                value={releasePayload.name ?? ''}
                            />
                            <div id='learn_more_about_component_name' className='form-text'>
                                <ShowInfoOnHover text={t('NAME_COMPONENT')} />
                                {t('Name of the component')}.
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='version' className='form-label fw-bold'>
                                {t('Version')} <span className='text-red' style={{color: '#F7941E'}}>*</span>
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter Version'
                                id='version'
                                aria-describedby='version'
                                required
                                name='version'
                                onChange={updateField}
                            />
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='programming_languages' className='form-label fw-bold'>
                                {t('Programming Languages')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='e.g., Java,C++, C#,...'
                                id='programming_languages'
                                aria-describedby='programming_languages'
                                name='languages'
                                onChange={setArrayData}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='operating_systems' className='form-label fw-bold'>
                                {t('Operating Systems')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='e.g.,Linux,MAC,Windows,...'
                                id='operating_systems'
                                aria-describedby='operating_systems'
                                name='operatingSystems'
                                onChange={setArrayData}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='tag' className='form-label fw-bold'>
                                {t('CPE ID')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter CPE ID'
                                id='tag'
                                aria-describedby='Tag'
                                name='cpeid'
                                onChange={updateField}
                            />
                            <div id='learn_more_about_cpe' className='form-text'>
                                <ShowInfoOnHover text={t('CPE_ID')} />
                                {t('Learn more about the CPE ID format')}.
                            </div>
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='blog_url' className='form-label fw-bold'>
                                {t('Software Platforms')}
                            </label>
                            <input
                                type='URL'
                                className='form-control'
                                placeholder='e.g.,Adobe AIR,.NET,Qt,...'
                                id='blog_url'
                                aria-describedby='blog_url'
                                name='softwarePlatforms'
                                onChange={setArrayData}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='releaseDate' className='form-label fw-bold'>
                                {t('Release date')}
                            </label>
                            <input
                                type='date'
                                className='form-control'
                                placeholder='Enter Release Date'
                                id='releaseDate'
                                aria-describedby='releaseDate'
                                name='releaseDate'
                                onChange={updateField}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='mainLicenseIds' className='form-label fw-bold'>
                                {t('Main Licenses')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                data-bs-toggle='modal'
                                data-bs-target='#search_vendors_modal'
                                placeholder={t('Click to set vendor')}
                                id='mainLicenseIds'
                                aria-describedby='Vendor'
                                readOnly={true}
                                name='mainLicenseIds'
                                value={mainLicensesId.fullName ?? ''}
                            />
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='otherLicenseIds' className='form-label fw-bold'>
                                {t('Other licenses')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                data-bs-toggle='modal'
                                data-bs-target='#search_vendors_modal'
                                placeholder={t('Click to set vendor')}
                                id='otherLicenseIds'
                                aria-describedby='Vendor'
                                readOnly={true}
                                name='otherLicenseIds'
                                value={otherLicensesId.fullName ?? ''}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='sourceCodeDownloadurl' className='form-label fw-bold'>
                                {t('Source Code Download URL')}
                            </label>
                            <input
                                type='URL'
                                className='form-control'
                                placeholder={t('Enter URL')}
                                id='wiki_url'
                                aria-describedby='wiki_url'
                                name='sourceCodeDownloadurl'
                                onChange={updateField}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='binaryDownloadurl' className='form-label fw-bold'>
                                {t('Binary Download URL')}
                            </label>
                            <input
                                type='URL'
                                className='form-control'
                                placeholder={t('Enter URL')}
                                id='binaryDownloadurl'
                                aria-describedby='wiki_url'
                                name='binaryDownloadurl'
                                onChange={updateField}
                            />
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='modified_on' className='form-label fw-bold'>
                                {t('Clearing State')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='modified_on'
                                aria-describedby='Modified on'
                                readOnly={true}
                                value='NEW'
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='mainlineState' className='form-label fw-bold'>
                                {t('Release Mainline State')}
                            </label>
                            <select
                                className='form-select'
                                aria-label='component_type'
                                id='mainlineState'
                                required
                                name='mainlineState'
                                onChange={updateField}
                            >
                                <option value='OPEN'>{t('OPEN')}</option>
                                <option value='MAINLINE'> {t('MAINLINE')}</option>
                                <option value='SPECIFIC'>{t('SPECIFIC')}</option>
                                <option value='PHASEOUT'>{t('PHASEOUT')}</option>
                                <option value='DENIED'>{t('DENIED')}</option>
                            </select>
                            <div id='mainlineState-i' className='form-text'>
                                <ShowInfoOnHover text={t('RELEASE_MAIN_STATE')} />
                                {t('Learn more about mainline states')}.
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='createdOn' className='form-label fw-bold'>
                                {t('Created on')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='createdOn'
                                aria-describedby='Modified on'
                                readOnly={true}
                                value={currentDate}
                            />
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='createdBy' className='form-label fw-bold'>
                                {t('Created by')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='createdBy'
                                placeholder='Will be set automatically'
                                aria-describedby='Modified on'
                                readOnly={true}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='contributors' className='form-label fw-bold'>
                                {t('Contributors')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                data-bs-toggle='modal'
                                data-bs-target='#search_users_modal'
                                placeholder={t('Click to edit')}
                                id='contributors'
                                aria-describedby='component_owner'
                                readOnly={true}
                                name='contributors'
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
                                value={moderator.fullName ?? ''}
                            />
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='modified_on' className='form-label fw-bold'>
                                {t('Modified On')}
                            </label>
                            <input
                                type='date'
                                className='form-control'
                                id='modified_on'
                                aria-describedby='Modified on'
                                readOnly={true}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='modified_by' className='form-label fw-bold'>
                                {t('Modified By')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Will be set automatically')}
                                id='modified_by'
                                aria-describedby='Modified By'
                                readOnly={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default React.memo(ReleaseSummary)
