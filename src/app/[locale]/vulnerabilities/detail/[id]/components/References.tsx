// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Vulnerability } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect } from 'react'

export default function References({ summaryData }: { summaryData: Vulnerability }): ReactNode {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    return (
        <>
            <table className='table summary-table'>
                <thead>
                    <tr>
                        <th>{t('Vulnerability References')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <ul className='px-3'>
                                {summaryData.references?.map((elem, i) => {
                                    return (
                                        <li key={i}>
                                            <a href={elem}>{elem}</a>
                                        </li>
                                    )
                                })}
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}
