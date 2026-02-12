// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SelectUsersDialog, ShowInfoOnHover } from 'next-sw360'
import { ReactNode, useEffect, useState } from 'react'
import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { ClearingRequestDetails, UpdateClearingRequestPayload, UserGroupType } from '@/object-types'
import { CommonUtils } from '@/utils'

interface Props {
    clearingRequestData: ClearingRequestDetails | undefined
    updateClearingRequestPayload: UpdateClearingRequestPayload
    setUpdateClearingRequestPayload: React.Dispatch<React.SetStateAction<UpdateClearingRequestPayload>>
}

interface DataTypeProp {
    [key: string]: string
}

export default function EditClearingRequestInfo({
    clearingRequestData,
    updateClearingRequestPayload,
    setUpdateClearingRequestPayload,
}: Props): ReactNode {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [, setMinDate] = useState('')
    const [dialogOpenRequestingUser, setDialogOpenRequestingUser] = useState(false)
    const [requestingUserData, setRequestingUserData] = useState<{
        [k: string]: string
    }>({})

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        const currentDate = new Date()
        setMinDate(currentDate.toISOString().split('T')[0])
    }, [])

    const setRequestingUserEmail = (user: DataTypeProp) => {
        const userEmails = Object.keys(user)
        setRequestingUserData(user)
        setUpdateClearingRequestPayload({
            ...updateClearingRequestPayload,
            requestingUser: userEmails[0],
        })
    }

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setUpdateClearingRequestPayload({
            ...updateClearingRequestPayload,
            [event.target.name]: event.target.value,
        })
    }

    return (
        <>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('Clearing Request')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{t('Requesting User')}:</td>
                        <td>
                            <input
                                type='text'
                                className='form-control'
                                id='editClearingRequest.requestingUser'
                                readOnly={true}
                                name='requestingUser'
                                onClick={() => setDialogOpenRequestingUser(true)}
                                value={updateClearingRequestPayload.requestingUser}
                                disabled={
                                    CommonUtils.isNullOrUndefined(session) ||
                                    session.user.userGroup === UserGroupType.USER
                                }
                            />
                            <SelectUsersDialog
                                show={dialogOpenRequestingUser}
                                setShow={setDialogOpenRequestingUser}
                                setSelectedUsers={setRequestingUserEmail}
                                selectedUsers={requestingUserData}
                                multiple={false}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Created On')}:</td>
                        <td>{clearingRequestData?._embedded?.createdOn ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Preferred Clearing Date')}:</td>
                        <td>{clearingRequestData?.requestedClearingDate ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Business Area Line')}:</td>
                        <td>{clearingRequestData?.projectBU ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Clearing Type')}:</td>
                        <td>
                            <select
                                className='form-select'
                                id='editClearingRequest.clearingType'
                                name='clearingType'
                                value={updateClearingRequestPayload.clearingType}
                                onChange={updateInputField}
                                disabled={
                                    CommonUtils.isNullOrUndefined(session) ||
                                    session.user.userGroup === UserGroupType.USER
                                }
                                required
                            >
                                <option value='DEEP'>{t('Deep Level CLX')}</option>
                                <option value='HIGH'>{t('High Level ISR')}</option>
                            </select>
                            <div
                                className='form-text'
                                id='editClearingRequest.clearingType.HelpBlock'
                            >
                                <ShowInfoOnHover text={t('Clearing request type info')} />{' '}
                                {t('Learn more about clearing request type')}.
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Requester Comment')}:</td>
                        <td>{clearingRequestData?.requestingUserComment ?? ''}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}
