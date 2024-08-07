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


export default function ClearingComments({ data }: { data: ClearingRequestDetails }) {
    const t = useTranslations('default')
    const { status } = useSession()

    const handleAddComment = () => {
        console.log('Test')
    }

    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('Comments')}</th>
                    </tr>
                </thead>
                <tbody>
                    <th>
                        <input className='form-control'
                               type="text"
                               placeholder={t('Enter Comment')}
                               style={{height: '50px'}}/>
                    </th>
                    <tr>
                        <button type='button'
                                className='btn btn-accept mb-2 mx-3'
                                onClick={handleAddComment}
                                >
                            {t('Add Comment')}
                        </button>
                    </tr>
                    {data.comments.map((item) => (
                        <tr key={item.text}>
                            <td>{item.text}</td>
                            <td>{item.commentedBy}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )}
}
