// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ClearingRequestDetails } from '@/object-types'
import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { SelectUsersDialog } from 'next-sw360'
import { ClearingRequestPayload } from '@/object-types'

interface DataProp {
    [key: string]: string;
}

export default function ClearingRequestInfo({ data }: { data: ClearingRequestDetails }) {
    const t = useTranslations('default')
    const { status } = useSession()
    const [dialogOpenRequestingUser, setDialogOpenRequestingUser] = useState(false)
    const [requestingUserData, setRequestingUserData] = useState<{ [k: string]: string }>({})
    const [clearingRequestPayload, setClearingRequestPayload] = useState<ClearingRequestPayload>({
        requestingUser: '',
        requestingUserName: '',
        clearingTeam: '',
        clearingTeamName: '',
        priority: '',
        clearingType: '',
        clearingState: '',
        agreedClearingDate: '',
    })

    useEffect(() => {
        const updatedClearingRequestData : ClearingRequestPayload = {
            requestingUser: data.requestingUser ?? '',
            requestingUserName: data.requestingUserName ?? '',
            clearingTeam: data.clearingTeam ?? '',
            clearingTeamName: data.clearingTeamName ?? '',
            priority: data.priority ?? '',
            clearingType: data.clearingType ?? '',
            clearingState: data.clearingState ?? '',
            agreedClearingDate: data.agreedClearingDate ?? '',
        }
        setClearingRequestPayload(updatedClearingRequestData)
    },[data, setClearingRequestPayload])
    
    const setRequestingUserEmail = (user: DataProp) => {
        const userEmails = Object.keys(user)
        setRequestingUserData(user)
        setClearingRequestPayload({
            ...clearingRequestPayload,
            requestingUser: userEmails[0],
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
                                value={ clearingRequestPayload.requestingUser}

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
                        <td>{data.createdOn ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Preferred Clearing Date')}:</td>
                        <td>{data.requestedClearingDate ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Business Area Line')}:</td>
                        <td>{data.projectBU ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Clearing Type')}:</td>
                        <td>{data.clearingType ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Requester Comment')}:</td>
                        <td>{data.requestingUserComment ?? ''}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )}
}
