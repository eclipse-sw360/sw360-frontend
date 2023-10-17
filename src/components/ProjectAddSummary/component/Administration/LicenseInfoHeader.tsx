// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'

import { ProjectPayload } from '@/object-types'

interface Props {
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function LicenseInfoHeader({ projectPayload, setProjectPayload }: Props) {
    const t = useTranslations('default')
    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setProjectPayload({
            ...projectPayload,
            [event.target.name]: event.target.value,
        })
    }

    return (
        <>
            <div className='row mb-4'>
                <h6 className='header pb-2 px-2'>{t('License Info Header')}</h6>
                <div className='row d-flex justify-content-end'>
                    <div className='col-lg-3'>
                        <button type='button' className='btn btn-light'>
                            {t('Set to default text')}
                        </button>
                    </div>
                </div>
                <div className='mb-2 row'>
                    <textarea
                        className='form-control'
                        id='addProjects.licenseInfoHeader'
                        aria-label='License Info Header'
                        style={{ height: '500px' }}
                        name='licenseInfoHeaderText'
                        value={projectPayload.licenseInfoHeaderText}
                        onChange={updateInputField}
                    ></textarea>
                </div>
            </div>
        </>
    )
}
