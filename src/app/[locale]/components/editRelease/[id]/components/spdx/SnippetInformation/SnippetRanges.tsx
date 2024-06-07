// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { SnippetRange } from '@/object-types'
import { FaTrashAlt } from 'react-icons/fa'

interface Props {
    setDataSnippetRanges?: (inputs: SnippetRange[]) => void
    setInputList?: React.Dispatch<React.SetStateAction<SnippetRange[]>>
    inputList?: SnippetRange[]
}

interface SnippetRangeInput {
    rangeType: string
    startPointer: string
    endPointer: string
    reference: string
}

function SnippetRanges({ inputList, setInputList, setDataSnippetRanges }: Props) {
    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>, index: number) => {
        const { name, value } = e.target
        const list: SnippetRange[] = [...inputList]
        console.log(inputList)
        console.log(list)
        list[index][name as keyof SnippetRangeInput] = value
        setInputList(list)
        setDataSnippetRanges(list)
    }

    const handleRemoveClick = (index: number) => {
        const list = [...inputList]
        list.splice(index, 1)
        setInputList(list)
        setDataSnippetRanges(list)
    }

    const handleAddClick = () => {
        let index: number = 0
        if (inputList.length !== 0) {
            index = inputList.length
        }
        setInputList([
            ...inputList,
            { rangeType: 'BYTE', startPointer: '', endPointer: '', reference: '', index: index },
        ])
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '1rem' }}>
            {inputList.map((elem, j) => {
                return (
                    <div key={j} style={{ display: 'flex', marginBottom: '0.75rem' }}>
                        <select
                            style={{ flex: 1, marginRight: '1rem' }}
                            className='form-control range-type form-select'
                            name='rangeType'
                            value={elem.rangeType}
                            onChange={(e) => handleInputChange(e, j)}
                        >
                            <option value='BYTE'>BYTE</option>
                            <option value='LINE'>LINE</option>
                        </select>
                        <input
                            style={{ flex: 2, marginRight: '1rem' }}
                            type='text'
                            className='form-control start-pointer'
                            placeholder='Enter start pointer'
                            name='startPointer'
                            value={elem.startPointer}
                            onChange={(e) => handleInputChange(e, j)}
                        />
                        <input
                            style={{ flex: 2, marginRight: '1rem' }}
                            type='text'
                            className='form-control end-pointer'
                            placeholder='Enter end pointer'
                            name='endPointer'
                            value={elem.endPointer}
                            onChange={(e) => handleInputChange(e, j)}
                        />
                        <input
                            style={{ flex: 4, marginRight: '2rem' }}
                            type='text'
                            className='form-control reference'
                            placeholder='Enter reference'
                            name='reference'
                            value={elem.reference}
                            onChange={(e) => handleInputChange(e, j)}
                        />
                        <FaTrashAlt className='spdx-delete-icon-main' onClick={() => handleRemoveClick(j)} />
                    </div>
                )
            })}
            <button id='addNewRange' className='spdx-add-button-sub' onClick={() => handleAddClick()}>
                Add new Range
            </button>
        </div>
    )
}

export default SnippetRanges
