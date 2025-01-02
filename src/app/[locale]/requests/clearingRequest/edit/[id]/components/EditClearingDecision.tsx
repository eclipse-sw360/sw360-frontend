// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ClearingRequestDetails,
         UpdateClearingRequestPayload, UserGroupType } from '@/object-types'
import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, ReactNode } from 'react'
import { SelectUsersDialog, ShowInfoOnHover } from 'next-sw360'
import { CommonUtils } from '@/utils'

interface Props {
    clearingRequestData: ClearingRequestDetails | undefined
    updateClearingRequestPayload: UpdateClearingRequestPayload
    setUpdateClearingRequestPayload: React.Dispatch<React.SetStateAction<UpdateClearingRequestPayload>>
}

interface ClearingRequestDataMap {
    [key: string]: string
}

export default function EditClearingDecision({ clearingRequestData,
                                               updateClearingRequestPayload,
                                               setUpdateClearingRequestPayload }: Props): ReactNode {

    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [minDate, setMinDate] = useState('')
    const [clearingTeamData, setClearingTeamData] = useState<ClearingRequestDataMap>({})
    const [dialogOpenClearingTeam, setDialogOpenClearingTeam] = useState(false)

    useEffect(() => {
        const currentDate = new Date()
        setMinDate(currentDate.toISOString().split('T')[0])
    }, [])

    const updateClearingTeamData = (user: ClearingRequestDataMap) => {
        const userEmails = Object.keys(user)
        setClearingTeamData(user)
        setUpdateClearingRequestPayload({
            ...updateClearingRequestPayload,
            clearingTeam: userEmails[0],
        })
    }

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setUpdateClearingRequestPayload({
            ...updateClearingRequestPayload,
            [event.target.name]: event.target.value,
        })
    }

    if (status === 'unauthenticated') {
        void signOut()
    } else {
    return (
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
                            value={updateClearingRequestPayload.clearingState}
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
                        <div className='form-text'
                            id='editClearingDecision.requestStatus.HelpBlock'>
                            <ShowInfoOnHover text={t('Clearing request status info')}/>
                                            {' '}{t('Learn more about clearing request status')}.
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>{t('Priority')}:</td>
                    <td>
                        <select
                            className='form-select'
                            id='editClearingDecision.priority'
                            name='priority'
                            value={updateClearingRequestPayload.priority}
                            onChange={updateInputField}
                            disabled={CommonUtils.isNullOrUndefined(session) || session.user.userGroup === UserGroupType.USER}
                            required
                        >
                            <option value='LOW'>{t('Low')}</option>
                            <option value='MEDIUM'>{t('Medium')}</option>
                            <option value='HIGH'>{t('High')}</option>
                            <option value='CRITICAL'>{t('Critical')}</option>
                        </select>
                        <div className='form-text'
                            id='editClearingDecision.priority.HelpBlock'>
                            <ShowInfoOnHover text={t('Clearing request priority info')}/>
                                            {' '}{t('Learn more about clearing request priority')}.
                        </div>
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
                            value={updateClearingRequestPayload.clearingTeam}

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
                            value={updateClearingRequestPayload.agreedClearingDate}
                            disabled={CommonUtils.isNullOrUndefined(session) || session.user.userGroup === UserGroupType.USER}
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
                <tr>
                    <td>{t('Reopened on')}:</td>
                    <td>
                        {clearingRequestData?.reOpenedOn ?? ''}
                    </td>
                </tr>
            </tbody>
        </table>
    )}
}
