// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'
import { DisplayMapOfMap } from '@/components/DisplayMap/DisplayMap'
import { Vulnerability } from '@/object-types'

export default function MetaData({ summaryData }: { summaryData: Vulnerability }): ReactNode {
    const t = useTranslations('default')

    return (
        <>
            <table className='table summary-table'>
                <thead>
                    <tr>
                        <th>{t('Vulnerability Metadata')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            {summaryData.cveFurtherMetaDataPerSource && (
                                <DisplayMapOfMap mapElement={summaryData.cveFurtherMetaDataPerSource} />
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}
