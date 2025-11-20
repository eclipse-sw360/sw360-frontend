// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'
import { InputKeyValue } from '@/object-types'

interface Props {
    setAnnotationDate: (input: InputKeyValue) => void
    dataAnnotationDate?: InputKeyValue
    setDataAnnotationDate: React.Dispatch<React.SetStateAction<InputKeyValue | undefined>>
}

function AnnotationDate({ dataAnnotationDate, setDataAnnotationDate, setAnnotationDate }: Props): ReactNode {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        const list: InputKeyValue = dataAnnotationDate ? dataAnnotationDate : ({} as InputKeyValue)
        list[name as keyof InputKeyValue] = value
        setDataAnnotationDate(list)
        setAnnotationDate(list)
    }

    return (
        dataAnnotationDate && (
            <div
                className='form-group'
                style={{
                    flex: 1,
                    marginLeft: '1.5rem',
                }}
            >
                <label
                    className='lableSPDX'
                    htmlFor='annotationCreatedDate'
                >
                    12.2 Annotation date{' '}
                </label>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    <div>
                        <input
                            id='annotationCreatedDate'
                            style={{
                                width: '12rem',
                                textAlign: 'center',
                            }}
                            type='date'
                            name='key'
                            className='form-control needs-validation'
                            placeholder='creation.date.yyyy.mm.dd'
                            onChange={handleInputChange}
                            value={dataAnnotationDate.key}
                        />
                    </div>
                    <div>
                        <input
                            id='annotationCreatedTime'
                            style={{
                                width: '12rem',
                                textAlign: 'center',
                                marginLeft: '10px',
                            }}
                            type='time'
                            step='1'
                            name='value'
                            className='form-control needs-validation'
                            placeholder='creation.time.hh.mm.ss'
                            onChange={handleInputChange}
                            value={dataAnnotationDate.value}
                        />
                    </div>
                </div>
            </div>
        )
    )
}

export default AnnotationDate
