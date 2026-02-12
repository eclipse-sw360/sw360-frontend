// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useTranslations } from 'next-intl'
import { ShowInfoOnHover } from 'next-sw360'
import { type JSX, useEffect, useState } from 'react'

import { useConfigValue } from '@/contexts'
import { ProjectPayload, UIConfigKeys } from '@/object-types'

interface Props {
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function Clearing({ projectPayload, setProjectPayload }: Props): JSX.Element {
    const t = useTranslations('default')
    const CLEARING_STATE_INFO = `Open: \n In Progress: \n Closed:`

    // Configs from backend
    const projectClearingTeams = useConfigValue(UIConfigKeys.UI_CLEARING_TEAMS) as string[] | null
    const unknownClearingTeamEnabled = useConfigValue(UIConfigKeys.UI_CLEARING_TEAM_UNKNOWN_ENABLED) as boolean | null

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setProjectPayload({
            ...projectPayload,
            [event.target.name]: event.target.value,
        })
    }

    const [localDeadline, setLocalDeadline] = useState<string>(projectPayload.preevaluationDeadline ?? '')
    const [deadlineError, setDeadlineError] = useState<string>('')

    useEffect(() => {
        setLocalDeadline(projectPayload.preevaluationDeadline ?? '')
    }, [
        projectPayload.preevaluationDeadline,
    ])

    return (
        <>
            <div className='row mb-4'>
                <h6 className='header pb-2 px-2'>{t('Clearing')}</h6>
                <div className='row with-divider py-3'>
                    <div className='col-lg-4'>
                        <label
                            htmlFor='addProjects.clearingState'
                            className='form-label fw-bold'
                        >
                            {t('Clearing State')}
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.clearingState'
                            aria-describedby='addProjects.clearingState.HelpBlock'
                            name='clearingState'
                            value={projectPayload.clearingState ?? 'OPEN'}
                            onChange={updateInputField}
                        >
                            <option value='OPEN'>{t('Open')}</option>
                            <option value='IN_PROGRESS'>{t('In Progress')}</option>
                            <option value='CLOSED'>{t('Closed')}</option>
                        </select>
                        <div
                            className='form-text'
                            id='addProjects.clearingState.HelpBlock'
                        >
                            <ShowInfoOnHover text={CLEARING_STATE_INFO} />{' '}
                            {t('Learn more about project clearing state')}
                        </div>
                    </div>
                    <div className='col-lg-4'>
                        <label
                            htmlFor='addProjects.clearingTeam'
                            className='form-label fw-bold'
                        >
                            {t('Clearing Team')}
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.clearingTeam'
                            aria-label='Clearing Team'
                            name='clearingTeam'
                            value={projectPayload.clearingTeam ?? 'UNKNOWN'}
                            onChange={updateInputField}
                        >
                            {unknownClearingTeamEnabled && <option value={'Unknown'}>{t('Unknown')}</option>}
                            {projectClearingTeams &&
                                projectClearingTeams.map((team) => (
                                    <option
                                        value={team}
                                        key={team}
                                    >
                                        {team}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className='col-lg-4'>
                        <label
                            htmlFor='addProjects.deadlinePreEvaluation'
                            className='form-label fw-bold'
                        >
                            {t('Deadline for pre-evaluation')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            aria-label='Deadline for pre-evaluation'
                            id='addProjects.deadlinePreEvaluation'
                            placeholder='Pre-evaluation date YYYY-MM-DD'
                            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                e.target.type = 'date'
                            }}
                            onBlur={() => {
                                const raw = (localDeadline ?? '').trim()
                                let normalized = ''

                                if (raw) {
                                    const cleaned = raw.replace(/\//g, '-')
                                    const m = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
                                    if (m) {
                                        const y = Number(m[1])
                                        const mo = Number(m[2])
                                        const d = Number(m[3])
                                        const dt = new Date(y, mo - 1, d)
                                        if (
                                            !Number.isNaN(dt.getTime()) &&
                                            dt.getFullYear() === y &&
                                            dt.getMonth() === mo - 1 &&
                                            dt.getDate() === d
                                        ) {
                                            const mm = String(mo).padStart(2, '0')
                                            const dd = String(d).padStart(2, '0')
                                            normalized = `${String(y).padStart(4, '0')}-${mm}-${dd}`
                                        }
                                    }
                                }

                                if (normalized) {
                                    setProjectPayload({
                                        ...projectPayload,
                                        preevaluationDeadline: normalized,
                                    })
                                    setDeadlineError('')
                                } else if (raw) {
                                    // Invalid input: revert to previous valid date and show error
                                    setLocalDeadline(projectPayload.preevaluationDeadline ?? '')
                                    setDeadlineError(t('Invalid date format, Use YYYY/MM/DD'))
                                } else {
                                    // empty input -> clear value
                                    setProjectPayload({
                                        ...projectPayload,
                                        preevaluationDeadline: '',
                                    })
                                    setDeadlineError('')
                                }
                            }}
                            name='preevaluationDeadline'
                            value={localDeadline}
                            onChange={(e) => {
                                setLocalDeadline(e.target.value)
                                setDeadlineError('')
                            }}
                        />
                        {deadlineError && (
                            <div
                                className='form-text text-danger'
                                id='addProjects.deadlinePreEvaluation.error'
                            >
                                {deadlineError}
                            </div>
                        )}
                    </div>
                </div>
                <div className='row with-divider py-3'>
                    <label
                        htmlFor='addProjects.clearingSummary'
                        className='form-label fw-bold'
                    >
                        {t('Clearing summary')}
                    </label>
                    <textarea
                        className='form-control textarea-summary'
                        aria-label='Clearing Summary'
                        id='addProjects.clearingSummary'
                        name='clearingSummary'
                        value={projectPayload.clearingSummary}
                        onChange={updateInputField}
                    ></textarea>
                </div>
                <div className='row with-divider py-3'>
                    <label
                        htmlFor='addProjects.specialRiskOpenSourceSoftware'
                        className='form-label fw-bold'
                    >
                        {t('Special risk Open Source Software')}
                    </label>
                    <textarea
                        className='form-control'
                        id='addProjects.specialRiskOpenSourceSoftware'
                        aria-label='Special Risk Open Source Software'
                        style={{
                            height: '120px',
                        }}
                        name='specialRisksOSS'
                        value={projectPayload.specialRisksOSS}
                        onChange={updateInputField}
                    ></textarea>
                </div>
                <div className='row with-divider py-3'>
                    <label
                        htmlFor='addProjects.generalRiskThirdPartySoftware'
                        className='form-label fw-bold'
                    >
                        {t('General risk 3rd party software')}
                    </label>
                    <textarea
                        className='form-control'
                        id='addProjects.generalRiskThirdPartySoftware'
                        aria-label='General risk 3rd party software'
                        style={{
                            height: '120px',
                        }}
                        name='generalRisks3rdParty'
                        value={projectPayload.generalRisks3rdParty}
                        onChange={updateInputField}
                    ></textarea>
                </div>
                <div className='row with-divider py-3'>
                    <label
                        htmlFor='addProjects.specialRiskThirdPartySoftware'
                        className='form-label fw-bold'
                    >
                        {t('Special risks 3rd party software')}
                    </label>
                    <textarea
                        className='form-control'
                        id='addProjects.specialRiskThirdPartySoftware'
                        aria-label='Special risk 3rd party software'
                        style={{
                            height: '120px',
                        }}
                        name='specialRisks3rdParty'
                        value={projectPayload.specialRisks3rdParty}
                        onChange={updateInputField}
                    ></textarea>
                </div>
                <div className='row with-divider py-3'>
                    <label
                        htmlFor='addProjects.salesAndDeliveryChannels'
                        className='form-label fw-bold'
                    >
                        {t('Sales and delivery channels')}
                    </label>
                    <textarea
                        className='form-control'
                        id='addProjects.salesAndDeliveryChannels'
                        aria-label='Sales and delivery channels'
                        style={{
                            height: '120px',
                        }}
                        name='deliveryChannels'
                        value={projectPayload.deliveryChannels}
                        onChange={updateInputField}
                    ></textarea>
                </div>
                <div className='row with-divider py-3'>
                    <label
                        htmlFor='addProjects.remarksAdditionalRequirements'
                        className='form-label fw-bold'
                    >
                        {t('Remarks additional requirements')}
                    </label>
                    <textarea
                        className='form-control'
                        id='addProjects.remarksAdditionalRequirements'
                        aria-label='Remarks additional requirements'
                        style={{
                            height: '120px',
                        }}
                        name='remarksAdditionalRequirements'
                        value={projectPayload.remarksAdditionalRequirements}
                        onChange={updateInputField}
                    ></textarea>
                </div>
            </div>
        </>
    )
}
