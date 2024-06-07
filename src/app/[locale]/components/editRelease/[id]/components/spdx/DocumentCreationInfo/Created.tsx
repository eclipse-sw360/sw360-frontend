// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { InputKeyValue } from '@/object-types'

interface Props {
    setCreated?: (input: InputKeyValue) => void
    dataCreated?: InputKeyValue
    setDataCreated?: React.Dispatch<React.SetStateAction<InputKeyValue>>
}

function Created({ dataCreated, setDataCreated, setCreated }: Props) {
    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target
        const list: InputKeyValue = dataCreated
        list[name as keyof InputKeyValue] = value
        setDataCreated(list)
        setCreated(list)
    }

    return (
        dataCreated && (
            <td style={{ flexDirection: 'column' }} colSpan={3}>
                <div className='form-group'>
                    <label className='lableSPDX' htmlFor='createdDate'>
                        6.9 Created
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0.75rem' }}>
                        <div>
                            <input
                                id='createdDate'
                                type='date'
                                name='key'
                                className='form-control spdx-date needs-validation'
                                placeholder='created.date.yyyy.mm.dd'
                                onChange={handleInputChange}
                                value={dataCreated.key}
                            />
                        </div>
                        <div>
                            <input
                                name='value'
                                id='createdTime'
                                type='time'
                                step='1'
                                className='form-control spdx-time needs-validation'
                                placeholder='created.time.hh.mm.ss'
                                onChange={handleInputChange}
                                value={dataCreated.value}
                            />
                        </div>
                    </div>
                </div>
            </td>
        )
    )
}

export default Created
