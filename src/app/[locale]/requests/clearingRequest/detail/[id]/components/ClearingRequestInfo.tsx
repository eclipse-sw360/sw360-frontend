// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ClearingRequestDetails } from '@/object-types'

export default function ClearingRequestInfo({ data }: { data: ClearingRequestDetails | undefined}): JSX.Element {
    const t = useTranslations('default')

    return (
        <>
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
                            {data?.requestingUser !== undefined && data.requestingUserName !== undefined
                                ? <Link href={`mailto:${data.requestingUser}`}>{data.requestingUserName}</Link>
                                : ''}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Created On')}:</td>
                        <td>{data?.createdOn ?? ''}</td>
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
        </>
    )
}
