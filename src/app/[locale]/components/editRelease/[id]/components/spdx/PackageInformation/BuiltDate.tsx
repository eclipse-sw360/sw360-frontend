// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { InputKeyValue } from '@/object-types'
import React from 'react'

interface Props {
    setBuiltDate?: (inputs: InputKeyValue) => void
    dataBuiltDate?: InputKeyValue
    setDataBuiltDate?: React.Dispatch<React.SetStateAction<InputKeyValue>>
}

function BuiltDate({ dataBuiltDate, setDataBuiltDate, setBuiltDate }: Props) {
    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target
        const list: InputKeyValue = dataBuiltDate
        list[name as keyof InputKeyValue] = value
        setDataBuiltDate(list)
        setBuiltDate(list)
    }

    return (
        <td colSpan={3}>
            <div className='form-group'>
                <label className='lableSPDX' htmlFor='createdDate'>
                    7.26 Built Date
                </label>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        marginBottom: '0.75rem',
                    }}
                >
                    <div>
                        <input
                            id='createdReleaseDate'
                            type='date'
                            className='form-control spdx-date needs-validation'
                            placeholder='created.date.yyyy.mm.dd'
                            onChange={handleInputChange}
                            name='key'
                            value={dataBuiltDate?.key ?? ''}
                        />
                    </div>
                    <div>
                        <input
                            id='createdReleaseTime'
                            type='time'
                            step='1'
                            name='value'
                            className='form-control spdx-time needs-validation'
                            placeholder='created.time.hh.mm.ss'
                            onChange={handleInputChange}
                            value={dataBuiltDate?.value ?? ''}
                        />
                    </div>
                </div>
            </div>
        </td>
    )
}

export default React.memo(BuiltDate)
