// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useTranslations } from 'next-intl'
import { ShowInfoOnHover } from 'next-sw360'
import type { JSX } from 'react'
import DateField from '@/components/DateField'
import { ProjectPayload } from '@/object-types'

interface Props {
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function Lifecycle({ projectPayload, setProjectPayload }: Props): JSX.Element {
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
                <div className='row with-divider py-3'>
                    <div className='col-lg-4'>
                        <label
                            htmlFor='addProjects.projectState'
                            className='form-label fw-bold'
                        >
                            {t('Project State')}{' '}
                            <span
                                style={{
                                    color: 'red',
                                }}
                            >
                                *
                            </span>
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
                        <div
                            className='form-text'
                            id='addProjects.projectState.HelpBlock'
                        >
                            <ShowInfoOnHover text={PROJECT_STATE_INFO} /> {t('Learn more about project state')}
                        </div>
                    </div>
                    <div className='col-lg-4'>
                        <DateField
                            id='addProjects.systemTestBeginDate'
                            name='systemTestStart'
                            ariaLabel={t('System test begin date')}
                            label={t('System test begin date')}
                            placeholder='System test begin date YYYY-MM-DD'
                            value={projectPayload.systemTestStart ?? ''}
                            onChange={(val) =>
                                setProjectPayload({
                                    ...projectPayload,
                                    systemTestStart: val,
                                })
                            }
                        />
                    </div>
                    <div className='col-lg-4'>
                        <DateField
                            id='addProjects.systemTestEndDate'
                            name='systemTestEnd'
                            ariaLabel={t('System test end date')}
                            label={t('System test end date')}
                            placeholder='System test end date YYYY-MM-DD'
                            value={projectPayload.systemTestEnd ?? ''}
                            onChange={(val) =>
                                setProjectPayload({
                                    ...projectPayload,
                                    systemTestEnd: val,
                                })
                            }
                        />
                    </div>
                </div>
                <div className='row with-divider py-3'>
                    <div className='col-lg-4'>
                        <DateField
                            id='addProjects.systemTestBeginDate'
                            name='deliveryStart'
                            ariaLabel={t('Delivery start date')}
                            label={t('Delivery start date')}
                            placeholder='Delivery start date YYYY-MM-DD'
                            value={projectPayload.deliveryStart ?? ''}
                            onChange={(val) =>
                                setProjectPayload({
                                    ...projectPayload,
                                    deliveryStart: val,
                                })
                            }
                        />
                    </div>
                    <div className='col-lg-4'>
                        <DateField
                            id='addProjects.phaseOutDate'
                            name='phaseOutSince'
                            ariaLabel={t('Phase-out date')}
                            label={t('Phase-out date')}
                            placeholder='Phase-out since YYYY-MM-DD'
                            value={projectPayload.phaseOutSince ?? ''}
                            onChange={(val) =>
                                setProjectPayload({
                                    ...projectPayload,
                                    phaseOutSince: val,
                                })
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
