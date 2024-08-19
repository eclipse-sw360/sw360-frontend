// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ClearingRequestDetails, ClearingRequestPayload } from '@/object-types'
import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { SelectUsersDialog } from 'next-sw360'

interface Props {
    clearingRequestData: ClearingRequestDetails,
    clearingRequestPayload: ClearingRequestPayload
    setClearingRequestPayload: React.Dispatch<React.SetStateAction<ClearingRequestPayload>>
}

interface ClearingRequestDataMap {
    [key: string]: string;
}

export default function EditClearingDecision({ clearingRequestData,
                                               clearingRequestPayload,
                                               setClearingRequestPayload }: Props) {

    const t = useTranslations('default')
    const { status } = useSession()
    const [minDate, setMinDate] = useState('')
    const [clearingTeamData, setClearingTeamData] = useState<ClearingRequestDataMap>({})
    const [dialogOpenClearingTeam, setDialogOpenClearingTeam] = useState(false)


    useEffect(() => {
        const currentDate = new Date();
        setMinDate(currentDate.toISOString().split('T')[0]);
    }, [])

    const updateClearingTeamData = (user: ClearingRequestDataMap) => {
        const userEmails = Object.keys(user)
        setClearingTeamData(user)
        setClearingRequestPayload({
            ...clearingRequestPayload,
            clearingTeam: userEmails[0],
        })
    }

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement |
                                     HTMLInputElement |
                                     HTMLTextAreaElement>) => {
        setClearingRequestPayload({
            ...clearingRequestPayload,
            [event.target.name]: event.target.value,
        })
    }

    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('Clearing Decision')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{t('Request Status')}:</td>
                        <td>
                            <select
                                className='form-select'
                                id='editClearingDecision.clearingState'
                                name='clearingState'
                                value={clearingRequestPayload.clearingState}
                                onChange={updateInputField}
                                required
                            >
                                <option value='NEW'>{t('New')}</option>
                                <option value='ACCEPTED'>{t('ACCEPTED')}</option>
                                <option value='REJECTED'>{t('REJECTED')}</option>
                                <option value='IN_QUEUE'>{t('In Queue')}</option>
                                <option value='IN_PROGRESS'>{t('In Progress')}</option>
                                <option value='CLOSED'>{t('Closed')}</option>
                                <option value='AWAITING_RESPONSE'>{t('Awaiting Response')}</option>
                                <option value='ON_HOLD'>{t('On Hold')}</option>
                                <option value='SANITY_CHECK'>{t('Sanity Check')}</option>
                                <option value='PENDING_INPUT'>{t('Pending Input')}</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Priority')}:</td>
                        <td>
                            <select
                                className='form-select'
                                id='editClearingDecision.priority'
                                name='priority'
                                value={clearingRequestPayload.priority}
                                onChange={updateInputField}
                                required
                            >
                                <option value='LOW'>{t('Low')}</option>
                                <option value='MEDIUM'>{t('Medium')}</option>
                                <option value='HIGH'>{t('High')}</option>
                                <option value='CRITICAL'>{t('Critical')}</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Clearing Team')}:</td>
                        <td>
                            <input
                                type='text'
                                className='form-control'
                                id='editClearingRequest.clearingTeam'
                                readOnly={true}
                                name='clearingTeam'
                                onClick={() => setDialogOpenClearingTeam(true)}
                                value={ clearingRequestPayload.clearingTeam}

                            />
                            <SelectUsersDialog
                                show={dialogOpenClearingTeam}
                                setShow={setDialogOpenClearingTeam}
                                setSelectedUsers={updateClearingTeamData}
                                selectedUsers={clearingTeamData}
                                multiple={false}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Agreed Clearing Date')}:</td>
                        <td>
                            <input
                                type='date'
                                className='form-control'
                                aria-label='Agreed Clearing Date YYYY-MM-DD'
                                id='agreedClearingDate'
                                aria-describedby='agreedClearingDate'
                                name='agreedClearingDate'
                                value={clearingRequestPayload?.agreedClearingDate ?? ''}
                                onChange={updateInputField}
                                min={minDate}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Last Updated on')}:</td>
                        <td>
                            {clearingRequestData?.lastUpdatedOn ?? ''}
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )}
}
