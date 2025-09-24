// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ClearingRequestDetails } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ReactNode } from 'react'

export default function ClearingRequestInfo({
    data,
}: Readonly<{ data: ClearingRequestDetails | undefined }>): ReactNode | undefined {
    const t = useTranslations('default')
    const { status } = useSession()

    if (status === 'unauthenticated') {
        signOut()
    } else {
        return (
            <table className='table summary-table'>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('Clearing Request')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{t('Requesting User')}:</td>
                        <td>
                            {data?.requestingUser !== undefined &&
                            data?._embedded?.requestingUser?.fullName !== undefined ? (
                                <Link href={`mailto:${data._embedded.requestingUser.email}`}>
                                    {data._embedded.requestingUser.fullName}
                                </Link>
                            ) : (
                                ''
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Created On')}:</td>
                        <td>{data?._embedded?.createdOn ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Preferred Clearing Date')}:</td>
                        <td>{data?.requestedClearingDate ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Business Area Line')}:</td>
                        <td>{data?.projectBU ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Clearing Type')}:</td>
                        <td>{data?.clearingType ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Requester Comment')}:</td>
                        <td>{data?.requestingUserComment ?? ''}</td>
                    </tr>
                </tbody>
            </table>
        )
    }
}
