// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import ShowInfoOnHover from '@/components/ShowInfoOnHover/ShowInfoOnHover'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

export default function Lifecycle() {
    const t = useTranslations(COMMON_NAMESPACE)

    const PROJECT_STATE_INFO = `
    Active:
    Phaseout:
    Unknown:
    `

    return (
        <>
            <div className='row mb-4'>
                <h6 className='header pb-2 px-2'>{t('Lifecycle')}</h6>
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.projectState' className='form-label fw-bold'>
                        {t('Project State')}
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.projectState'
                            defaultValue='Open'
                            aria-describedby='addProjects.projectState.HelpBlock'
                        >
                            <option value='Active'>{t('Active')}</option>
                            <option value='Phaseout'>{t('Phaseout')}</option>
                            <option value='Unknown'>{t('Unknown')}</option>
                        </select>
                        <div className='form-text' id='addProjects.projectState.HelpBlock'>
                            <ShowInfoOnHover text={PROJECT_STATE_INFO} /> {t('Learn more about project state')}
                        </div>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.systemTestBeginDate' className='form-label fw-bold'>
                        {t('System test begin date')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            aria-label='Deadline for pre-evaluation'
                            id='addProjects.systemTestBeginDate'
                            placeholder='System test begin date YYYY-MM-DD'
                            onFocus={(e) => {
                                ;(e.target.type as any) = 'date'
                            }}
                            onBlur={(e) => {
                                ;(e.target.type as any) = 'text'
                            }}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.systemTestEndDate' className='form-label fw-bold'>
                        {t('System test end date')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            aria-label='Deadline for pre-evaluation'
                            id='addProjects.systemTestEndDate'
                            placeholder='System test end date YYYY-MM-DD'
                            onFocus={(e) => {
                                ;(e.target.type as any) = 'date'
                            }}
                            onBlur={(e) => {
                                ;(e.target.type as any) = 'text'
                            }}
                        />
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.systemTestBeginDate' className='form-label fw-bold'>
                        {t('Delivery start date')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            aria-label='Deadline for pre-evaluation'
                            id='addProjects.systemTestBeginDate'
                            placeholder='Delivery start date YYYY-MM-DD'
                            onFocus={(e) => {
                                ;(e.target.type as any) = 'date'
                            }}
                            onBlur={(e) => {
                                ;(e.target.type as any) = 'text'
                            }}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.phaseOutDate' className='form-label fw-bold'>
                        {t('Phase-out date')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            aria-label='Deadline for pre-evaluation'
                            id='addProjects.phaseOutDate'
                            placeholder='Phase-out since YYYY-MM-DD'
                            onFocus={(e) => {
                                ;(e.target.type as any) = 'date'
                            }}
                            onBlur={(e) => {
                                ;(e.target.type as any) = 'text'
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
