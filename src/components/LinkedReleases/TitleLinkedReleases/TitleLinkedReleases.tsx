// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { type JSX } from 'react'

export default function TitleLinkedReleases(): JSX.Element {
    const t = useTranslations('default')
    return (
        <>
            <div className='row linked-releases-title-second'>
                <div className='linked-releases-filename'>
                    <p className='fw-bold mt-2'>{t('Vendor Name')}</p>
                </div>
                <div className='linked-releases-filename'>
                    <p className='fw-bold mt-2'>{t('Release name')}</p>
                </div>
                <div className='linked-releases-filename'>
                    <p className='fw-bold mt-2'>{t('Release version')}</p>
                </div>
                <div className='linked-releases-filename'>
                    <p className='fw-bold mt-2'>{t('Release Relation')}</p>
                </div>
            </div>
        </>
    )
}
