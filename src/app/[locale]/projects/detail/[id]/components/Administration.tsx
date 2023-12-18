// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { AdministrationDataType } from '@/object-types'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from '../detail.module.css'

const Capitalize = (text: string) => {
    return text
        ? text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')
        : undefined
}

export default function Administration({ data }: { data: AdministrationDataType }) {
    const t = useTranslations('default')
    const [toggleClearing, setToggleClearing] = useState(false)
    const [toggleLifecycle, setToggleLifecycle] = useState(false)
    const [toggleLicenseInfoHeader, setToggleLicenseInfoHeader] = useState(false)

    return (
        <>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead
                    title='Click to expand or collapse'
                    onClick={() => {
                        setToggleClearing(!toggleClearing)
                    }}
                >
                    <tr>
                        <th colSpan={2}>{t('Clearing')}</th>
                    </tr>
                </thead>
                <tbody hidden={toggleClearing}>
                    <tr>
                        <td>{t('Project Clearing State')}:</td>
                        <td>{Capitalize(data.clearingState) ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Clearing Details')}:</td>
                        <td>{data.clearingDetails ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Clearing Team')}:</td>
                        <td>{data._embedded?.clearingTeam?.email ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Deadline for pre-evaluation')}:</td>
                        <td>{data.preevaluationDeadline ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Clearing summary')}:</td>
                        <td>
                            <textarea
                                className='form-control'
                                id='administration.clearingSummary'
                                aria-describedby={t('Clearing summary')}
                                style={{ height: '120px' }}
                                value={data.clearingSummary ?? ''}
                                readOnly
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Special risk Open Source Software')}:</td>
                        <td>
                            <textarea
                                className='form-control'
                                id='administration.specialRiskOSS'
                                aria-describedby={t('Special risk Open Source Software')}
                                style={{ height: '120px' }}
                                value={data.specialRisksOSS ?? ''}
                                readOnly
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('General risks 3rd party software')}:</td>
                        <td>
                            <textarea
                                className='form-control'
                                id='administration.generalRisks3rdPartySoftware'
                                aria-describedby={t('General risks 3rd party software')}
                                style={{ height: '120px' }}
                                value={data.generalRisks3rdParty ?? ''}
                                readOnly
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Special risks 3rd party software')}:</td>
                        <td>
                            <textarea
                                className='form-control'
                                id='administration.specialRisks3rdPartySoftware'
                                aria-describedby={t('Special risks 3rd party software')}
                                style={{ height: '120px' }}
                                value={data.specialRisks3rdParty ?? ''}
                                readOnly
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Sales and delivery channels')}:</td>
                        <td>
                            <textarea
                                className='form-control'
                                id='administration.salesAndDeliveryChannels'
                                aria-describedby={t('Sales and delivery channels')}
                                style={{ height: '120px' }}
                                value={data.deliveryChannels ?? ''}
                                readOnly
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Remarks additional requirements')}:</td>
                        <td>
                            <textarea
                                className='form-control'
                                id='administration.remarksAdditionalRequirements'
                                aria-describedby={t('Remarks additional requirements')}
                                style={{ height: '120px' }}
                                value={data.remarksAdditionalRequirements ?? ''}
                                readOnly
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead
                    title='Click to expand or collapse'
                    onClick={() => {
                        setToggleLifecycle(!toggleLifecycle)
                    }}
                >
                    <tr>
                        <th colSpan={2}>{t('Lifecycle')}</th>
                    </tr>
                </thead>
                <tbody hidden={toggleLifecycle}>
                    <tr>
                        <td>{t('Project state')}:</td>
                        <td>{Capitalize(data.state) ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('System State Begin')}:</td>
                        <td>{data.systemTestStart ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('System State End')}:</td>
                        <td>{data.systemTestEnd ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Delivery start')}:</td>
                        <td>{data.deliveryStart ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Phase-out since')}:</td>
                        <td>{data.phaseOutSince ?? ''}</td>
                    </tr>
                </tbody>
            </table>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead
                    title='Click to expand or collapse'
                    onClick={() => {
                        setToggleLicenseInfoHeader(!toggleLicenseInfoHeader)
                    }}
                >
                    <tr>
                        <th colSpan={2}>{t('License Info Header')}</th>
                    </tr>
                </thead>
                <tbody hidden={toggleLicenseInfoHeader}>
                    <tr>
                        <td>
                            <textarea
                                className='form-control'
                                id='administration.licenseInfoHeader'
                                aria-describedby={t('License Info Header')}
                                style={{ height: '600px' }}
                                value={data.licenseInfoHeader ?? ''}
                                readOnly
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}
