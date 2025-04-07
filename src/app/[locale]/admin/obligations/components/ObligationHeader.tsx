// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { ObligationLevels, ObligationTypes, ObligationLevelInfo } from '../../../../../object-types/Obligation'

interface ObligationHeaderProps {
    title: string
    obligationType: string
    obligationLevel: string
    onTitleChange: (value: string) => void
    onTypeChange: (value: string) => void
    onLevelChange: (value: string) => void
}

export default function ObligationHeader({
    title,
    obligationType,
    obligationLevel,
    onTitleChange,
    onTypeChange,
    onLevelChange,
}: ObligationHeaderProps) : ReactNode {
    const t = useTranslations('default')
    return (
        <>
            <div className='row mb-2 align-items-center'>
                <div className='col-md-4'>
                    <label
                        htmlFor='title'
                        className='form-label'
                        style={{ fontWeight: 'bold' }}
                    >
                        {t('Title')}
                    </label>
                    <input
                        type='text'
                        className='form-control'
                        id='title'
                        placeholder={'Enter title...'}
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                    />
                </div>

                <div className='col-md-4'>
                    <label
                        htmlFor='obligationType'
                        className='form-label'
                        style={{ fontWeight: 'bold' }}
                    >
                        {t('Obligation Type')}
                    </label>
                    <select
                    className='form-select'
                    id='obligationType'
                    value={obligationType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    >
                    <option value='' disabled>
                        {t('Select an obligation type')}
                    </option>
                    {Object.values(ObligationTypes).map((option) => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
                    </select>
                </div>

                <div className='col-md-4'>
                    <label
                        htmlFor='obligationLevel'
                        className='form-label'
                        style={{ fontWeight: 'bold' }}
                    >
                        t{('Obligation Level')}
                    </label>
                    <select
                        className='form-select'
                        id='obligationLevel'
                        value={obligationLevel}
                        onChange={(e) => onLevelChange(e.target.value)}
                    >
                        <option value='' disabled>
                            {t('Select an obligation level')}
                        </option>
                        {Object.values(ObligationLevels).map((option) => (
                            <option
                                key={option}
                                value={option}
                            >
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className='row mb-2'>
                <div className='col-md-4 offset-md-8'>
                    <OverlayTrigger
                        overlay={
                            <Tooltip id='obligation-level-info'>
                                {Object.entries(ObligationLevelInfo).map(([key, value], index) => (
                                    <div key={index}>
                                        {key}: {value}
                                    </div>
                                ))}
                            </Tooltip>
                        }
                        placement='bottom'
                    >
                        <span className='d-inline-block btn-overlay cursor-pointer'>
                            <small>ⓘ Learn more about obligation level</small>
                        </span>
                    </OverlayTrigger>
                </div>
            </div>
        </>
    )
}
