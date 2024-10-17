// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ModerationRequestDetails } from '@/object-types'


export default function ModerationRequestInfo({ data }: { data: ModerationRequestDetails | undefined }) {
    const t = useTranslations('default')

    const formatDate = (timestamp: number | undefined): string | null => {
        if(!timestamp){
            return null
        }
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    return (
        <>
            <table className='table summary-table'>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('Moderation Request')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{t('Requesting User')}:</td>
                        <td>
                            {data?.requestingUser
                                ? <Link href={`mailto:${data?.requestingUser}`}>{data?.requestingUser}</Link>
                                : ''}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Submitted On')}:</td>
                        <td>{formatDate(data?.timestamp) ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Comment on Moderation Request')}:</td>
                        <td>
                            <textarea
                                className='form-control'
                                id='moderationRequest.commentRequestingUser'
                                aria-describedby={t('Comment on Moderation Request')}
                                style={{ height: '120px' }}
                                value={data?.commentRequestingUser ?? ''}
                                readOnly
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}
