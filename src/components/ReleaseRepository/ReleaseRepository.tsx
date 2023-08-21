// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import styles from '@/css/AddKeyValue.module.css'
import React from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

const ReleaseRepository = () => {
    const t = useTranslations(COMMON_NAMESPACE)

    return (
        <>
            <div className='row mb-4'>
                <div className={`${styles['header']} mb-2`}>
                    <p className='fw-bold mt-3'> {t('Release Repository')}</p>
                </div>
                <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='repository_type' className='form-label fw-bold'>
                                {t('Repository Type')} <span className='text-red'>*</span>
                            </label>
                            <select
                                className='form-select'
                                aria-label='component_type'
                                id='repository_type'
                                required
                                name='repositorytype'
                            >
                                <option value='UNKNOWN'>{t('Unknown')}</option>
                                <option value='GIT'>{t('Git')}</option>
                                <option value='CLEARCASE'>{t('ClearCase')}</option>
                                <option value='SVN'>{t('Subversion (SVN)')}</option>
                                <option value='CVS'>{t('CVS')}</option>
                                <option value='MERCURIAL'>{t('Mercurial')}</option>
                                <option value='PERFORCE'>{t('Perforce')}</option>
                                <option value='VISUAL_SOURCESAFE'>{t('Visual SourceSafe')}</option>
                                <option value='BAZAAR'>{t('Bazaar')}</option>
                                <option value='ALIENBRAIN'>{t('Alienbrain')}</option>
                                <option value='TEAM_FOUNDATION_SERVER'>{t('Team Foundation Server')}</option>
                                <option value='RATIONAL_SYNERGY'>{t('IBM Rational Synergy')}</option>
                                <option value='PTC_INTEGRITY'>{t('PTC Integrity')}</option>
                                <option value='DTR'>{t('SAP Design Time Repository (DTR)')}</option>
                                <option value='DARCS'>{t('Darcs')}</option>
                                <option value='FOSSIL'>{t('Fossil')}</option>
                                <option value='GNU_ARCH'>{t('GNU arch')}</option>
                                <option value='MONOTONE'>{t('Monotone')}</option>
                                <option value='BIT_KEEPER'>{t('BitKeeper')}</option>
                                <option value='RATIONAL_TEAM_CONCERT'>{t('Rational Team Concert')}</option>
                                <option value='RCS'>{t('Revision Control System (RCS)')}</option>
                            </select>
                            <div id='learn_more_about_component_type' className='form-text'>
                                <i className='bi bi-info-circle'></i>(i)Learn more about repository types.
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='version' className='form-label fw-bold'>
                                {t('Repository URL')}
                            </label>
                            <input
                                type='URL'
                                className='form-control'
                                placeholder='Enter URL'
                                id='version'
                                aria-describedby='version'
                                required
                                name='url'
                            />
                        </div>
                    </div>
            </div>
        </>
    )
}

export default React.memo(ReleaseRepository)
