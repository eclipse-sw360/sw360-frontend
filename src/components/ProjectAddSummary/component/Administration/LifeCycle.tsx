// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'

import { Project } from '@/object-types'
import { ShowInfoOnHover } from 'next-sw360'

interface Props {
    projectPayload: Project
    setProjectPayload: React.Dispatch<React.SetStateAction<Project>>
}

export default function Lifecycle({ projectPayload, setProjectPayload }: Props) {
    const t = useTranslations('default')
    const PROJECT_STATE_INFO = `Active: \n Phaseout: \n Unknown:`
    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setProjectPayload({
            ...projectPayload,
            [event.target.name]: event.target.value,
        })
    }

    return (
        <>
            <div className='row mb-4'>
                <h6 className='header pb-2 px-2'>{t('Lifecycle')}</h6>
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.projectState' className='form-label fw-bold'>
                            {t('Project State')} <span style={{ color: 'red' }}>*</span>
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.projectState'
                            aria-describedby='addProjects.projectState.HelpBlock'
                            name='state'
                            value={projectPayload.state}
                            onChange={updateInputField}
                            required
                        >
                            <option value='ACTIVE'>{t('Active')}</option>
                            <option value='PHASE_OUT'>{t('Phaseout')}</option>
                            <option value='UNKNOWN'>{t('Unknown')}</option>
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
                            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                e.target.type = 'date'
                            }}
                            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                e.target.type = 'text'
                            }}
                            name='systemTestStart'
                            value={projectPayload.systemTestStart}
                            onChange={updateInputField}
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
                            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                e.target.type = 'date'
                            }}
                            onBlur={(e) => {
                                e.target.type = 'text'
                            }}
                            name='systemTestEnd'
                            value={projectPayload.systemTestEnd}
                            onChange={updateInputField}
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
                            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                e.target.type = 'date'
                            }}
                            onBlur={(e) => {
                                e.target.type = 'text'
                            }}
                            name='deliveryStart'
                            value={projectPayload.deliveryStart}
                            onChange={updateInputField}
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
                            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                e.target.type = 'date'
                            }}
                            onBlur={(e) => {
                                e.target.type = 'text'
                            }}
                            name='phaseOutSince'
                            value={projectPayload.phaseOutSince}
                            onChange={updateInputField}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
