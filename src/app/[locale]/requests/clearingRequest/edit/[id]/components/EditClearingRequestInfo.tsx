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
import { useState } from 'react'
import { SelectUsersDialog } from 'next-sw360'

interface Props {
    clearingRequestData: ClearingRequestDetails,
    clearingRequestPayload: ClearingRequestPayload
    setClearingRequestPayload : React.Dispatch<React.SetStateAction<ClearingRequestPayload>>
}

interface DataTypeProp {
    [key: string]: string;
}

export default function ClearingRequestInfo({ clearingRequestData,
                                              clearingRequestPayload,
                                              setClearingRequestPayload }: Props) {
    const t = useTranslations('default')
    const { status } = useSession()
    const [dialogOpenRequestingUser, setDialogOpenRequestingUser] = useState(false)
    const [requestingUserData, setRequestingUserData] = useState<{ [k: string]: string }>({})
    
    const setRequestingUserEmail = (user: DataTypeProp) => {
        const userEmails = Object.keys(user)
        setRequestingUserData(user)
        setClearingRequestPayload({
            ...clearingRequestPayload,
            requestingUser: userEmails[0],
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
                        <td>{clearingRequestData.createdOn ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Preferred Clearing Date')}:</td>
                        <td>{clearingRequestData.requestedClearingDate ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Business Area Line')}:</td>
                        <td>{clearingRequestData.projectBU ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Clearing Type')}:</td>
                        <td>
                            <select
                                className='form-select'
                                id='editClearingRequest.clearingType'
                                name='clearingType'
                                value={clearingRequestPayload.clearingType}
                                onChange={updateInputField}
                                required
                            >
                                <option value='DEEP'>{t('Deep Level CLX')}</option>
                                <option value='HIGH'>{t('High Level ISR')}</option>
                            </select>
                        </td> 
                    </tr>
                    <tr>
                        <td>{t('Requester Comment')}:</td>
                        <td>{clearingRequestData.requestingUserComment ?? ''}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )}
}
