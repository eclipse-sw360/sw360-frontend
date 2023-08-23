// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import styles from './LinkedReases.module.css'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { Session } from '@/object-types/Session'
import TitleLinkedReleases from './TitleLinkedReleases/TitleLinkedReleases'


interface Props {
    session?: Session
}

const LinkedReleases = ({ session}: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)

    return (
        <>
            <div className='col' style={{ fontSize: '0.875rem' }}>
                <div className={`row ${styles['attachment-table']}`} style={{ padding: '25px',fontSize: '0.875rem', paddingTop: '1px' }}>
                    <TitleLinkedReleases />
                </div>
                <div>
                    <button
                        type='button'
                        className={`fw-bold btn btn-secondary`}
                    >
                        {t('Click to add Releases')}
                    </button>
                </div>
            </div>
        </>
    )
}

export default LinkedReleases