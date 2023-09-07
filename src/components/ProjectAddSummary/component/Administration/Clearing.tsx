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
import ProjectPayload from '@/object-types/CreateProjectPayload'


interface Props{
    token: string
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}


export default function Clearing({token, projectPayload, setProjectPayload}: Props) {

    const t = useTranslations(COMMON_NAMESPACE)
    const CLEARING_STATE_INFO = `Open: \n In Progress: \n Closed:`

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setProjectPayload({
            ...projectPayload,
            [event.target.name]: event.target.value,
        })
    }

    return (
        <>
            <div className='row mb-4'>
                <h6 className='header pb-2 px-2'>{t('Clearing')}</h6>
                <div className='row mb-2'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.clearingState' className='form-label fw-bold'>
                        {t('Clearing State')}
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.clearingState'
                            defaultValue='OPEN'
                            aria-describedby='addProjects.clearingState.HelpBlock'
                            name='clearingState'
                            value={projectPayload.clearingState}
                            onChange={updateInputField}
                        >
                            <option value='OPEN'>{t('Open')}</option>
                            <option value='IN_PROGRESS'>{t('In Progress')}</option>
                            <option value='CLOSED'>{t('Closed')}</option>
                        </select>
                        <div className='form-text' id='addProjects.clearingState.HelpBlock'>
                            <ShowInfoOnHover text={CLEARING_STATE_INFO} /> {t('Learn more about project clearing state')}
                        </div>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.clearingTeam' className='form-label fw-bold'>
                        {t('Clearing Team')}
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.clearingTeam'
                            defaultValue='CT'
                            aria-label='Clearing Team'
                            name='businessUnit'
                            value={projectPayload.businessUnit}
                            onChange={updateInputField}
                        >
                            <option value='CT'>CT</option>
                            <option value='GP'>GP</option>
                            <option value='IOT'>IOT</option>
                            <option value='MO'>MO</option>
                            <option value='MO ITS'>MO ITS</option>
                            <option value='SGRE'>SGRE</option>
                            <option value='SHS'>SHS</option>
                            <option value='SI'>SI</option>
                            <option value='SOP'>SOP</option>
                        </select>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.deadlinePreEvaluation' className='form-label fw-bold'>
                        {t('Deadline for pre-evaluation')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            aria-label='Deadline for pre-evaluation'
                            id='addProjects.deadlinePreEvaluation'
                            placeholder='Pre-evaluation date YYYY-MM-DD'
                            onFocus={(e) => {
                                ;(e.target.type as any) = 'date'
                            }}
                            onBlur={(e) => {
                                ;(e.target.type as any) = 'text'
                            }}
                            name='preevaluationDeadline'
                            value={projectPayload.preevaluationDeadline}
                            onChange={updateInputField}
                        />
                    </div>
                </div>
                <hr />
                <div className='mb-2 row'>
                    <label htmlFor='addProjects.clearingSummary' className='form-label fw-bold'>
                    {t('Clearing summary')}
                    </label>
                    <textarea
                        className='form-control'
                        aria-label='Clearing Summary'
                        id='addProjects.clearingSummary'
                        style={{ height: '120px' }}
                        name='clearingSummary'
                        value={projectPayload.clearingSummary}
                        onChange={updateInputField}
                    ></textarea>
                </div>
                <hr />
                <div className='mb-2 row'>
                    <label htmlFor='addProjects.specialRiskOpenSourceSoftware' className='form-label fw-bold'>
                    {t('Special risk Open Source Software')}
                    </label>
                    <textarea
                        className='form-control'
                        id='addProjects.specialRiskOpenSourceSoftware'
                        aria-label='Special Risk Open Source Software'
                        style={{ height: '120px' }}
                        name='specialRisksOSS'
                        value={projectPayload.specialRisksOSS}
                        onChange={updateInputField}
                    ></textarea>
                </div>
                <hr />
                <div className='mb-2 row'>
                    <label htmlFor='addProjects.generalRiskThirdPartySoftware' className='form-label fw-bold'>
                    {t('General risk 3rd party software')}
                    </label>
                    <textarea
                        className='form-control'
                        id='addProjects.generalRiskThirdPartySoftware'
                        aria-label='General risk 3rd party software'
                        style={{ height: '120px' }}
                        name='generalRisks3rdParty'
                        value={projectPayload.generalRisks3rdParty}
                        onChange={updateInputField}
                    ></textarea>
                </div>
                <hr />
                <div className='mb-2 row'>
                    <label htmlFor='addProjects.specialRiskThirdPartySoftware' className='form-label fw-bold'>
                    {t('Special risks 3rd party software')}
                    </label>
                    <textarea
                        className='form-control'
                        id='addProjects.specialRiskThirdPartySoftware'
                        aria-label='Special risk 3rd party software'
                        style={{ height: '120px' }}
                        name='specialRisks3rdParty'
                        value={projectPayload.specialRisks3rdParty}
                        onChange={updateInputField}
                    ></textarea>
                </div>
                <hr />
                <div className='mb-2 row'>
                    <label htmlFor='addProjects.salesAndDeliveryChannels' className='form-label fw-bold'>
                    {t('Sales and delivery channels')}
                    </label>
                    <textarea
                        className='form-control'
                        id='addProjects.salesAndDeliveryChannels'
                        aria-label='Sales and delivery channels'
                        style={{ height: '120px' }}
                        name='deliveryChannels'
                        value={projectPayload.deliveryChannels}
                        onChange={updateInputField}
                    ></textarea>
                </div>
                <hr />
                <div className='mb-2 row'>
                    <label htmlFor='addProjects.remarksAdditionalRequirements' className='form-label fw-bold'>
                    {t('Remarks additional requirements')}
                    </label>
                    <textarea
                        className='form-control'
                        id='addProjects.remarksAdditionalRequirements'
                        aria-label='Remarks additional requirements'
                        style={{ height: '120px' }}
                        name='remarksAdditionalRequirements'
                        value={projectPayload.remarksAdditionalRequirements}
                        onChange={updateInputField}
                    ></textarea>
                </div>
            </div>
        </>
    )
}
