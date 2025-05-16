// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { InputKeyValue } from '@/object-types'
import { FaTrashAlt } from 'react-icons/fa'
import { ReactNode } from 'react'

interface Props {
    setInputList: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    inputList: InputKeyValue[]
    isAnonymous: boolean
    setDataCreators: (inputs: InputKeyValue[]) => void
}

function Creators({ inputList, setInputList, isAnonymous, setDataCreators }: Props) : ReactNode {
    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>, index: number) => {
        const { name, value } = e.target
        const list: InputKeyValue[] = [...inputList]
        list[index][name as keyof InputKeyValue] = value
        setInputList(list)
        setDataCreators(list)
    }

    const handleRemoveClick = (index: number) => {
        const list = [...inputList]
        list.splice(index, 1)
        setInputList(list)
        setDataCreators(list)
    }

    const handleAddClick = () => {
        setInputList([...inputList, { key: 'Organization', value: '' }])
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 7 }}>
            {inputList.map((elem, j) => {
                return (
                    <div key={j} style={{ display: 'flex', marginBottom: '0.75rem' }} className='creatorRow'>
                        <select
                            style={{ flex: 2, marginRight: '1rem' }}
                            value={elem.key}
                            className='form-control creator-type form-select'
                            disabled={isAnonymous && (elem.key === 'Organization' || elem.key === 'Person')}
                            name='key'
                            onChange={(e) => handleInputChange(e, j)}
                        >
                            <option value='Organization'>Organization</option>
                            <option value='Person'>Person</option>
                            <option value='Tool'>Tool</option>
                        </select>
                        <input
                            style={{ flex: 6, marginRight: '2rem' }}
                            type='text'
                            value={elem.value}
                            name='value'
                            className='form-control creator-value'
                            placeholder='Enter creator'
                            onChange={(e) => handleInputChange(e, j)}
                            disabled={isAnonymous && (elem.key === 'Organization' || elem.key === 'Person')}
                        />
                        <FaTrashAlt className='spdx-delete-icon-main' onClick={() => handleRemoveClick(j)} />
                    </div>
                )
            })}

            <button
                className='spdx-add-button-sub spdx-add-button-sub-creator'
                name='add-spdx-creator'
                onClick={() => handleAddClick()}
            >
                Add new creator
            </button>
        </div>
    )
}

export default Creators
