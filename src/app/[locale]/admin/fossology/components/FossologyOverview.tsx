// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'

export default function FossologyOverview() : ReactNode {
    const t = useTranslations('default')


    return (
        <>
            <div className='mt-4 mx-5'>
                <div className='row'>
                    <div className='col-lg-8'>
                        <button
                            type='button'
                            className='btn btn-primary col-auto me-2'
                        >
                            {t('Re-Check connection')}
                        </button>
                        <button type='button' className='btn btn-primary col-auto me-2'>
                            {t('Save configuration')}
                        </button>
                        <button type='button' className='btn btn-secondary col-auto me-2'>
                            {t('Cancel')}
                        </button>
                    </div>
                    <div className='col-lg-4 d-flex justify-content-end buttonheader-title'>
                        {t('Fossology Connection Administration')}
                    </div>
                </div>
            </div>
        </>
    )
}
