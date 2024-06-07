// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { InputKeyValue } from '@/object-types'

interface Props {
    dataSnippetFromFile?: InputKeyValue
    setDataSnippetFromFile?: React.Dispatch<React.SetStateAction<InputKeyValue>>
    setSnippetFromFileToSnippet?: (input: InputKeyValue) => void
}

function SnippetFileSPDXIdentifier({
    dataSnippetFromFile,
    setDataSnippetFromFile,
    setSnippetFromFileToSnippet,
}: Props) {
    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target
        const list: InputKeyValue = dataSnippetFromFile
        list[name as keyof InputKeyValue] = value
        setDataSnippetFromFile(list)
        setSnippetFromFileToSnippet(list)
    }

    return (
        dataSnippetFromFile && (
            <td>
                <div className='form-group' style={{ flex: 1 }}>
                    <label className='lableSPDX' htmlFor='snippetFromFile'>
                        9.2 Snippet from file SPDX identifier
                    </label>
                    <div style={{ display: 'flex' }}>
                        <select
                            id='snippetFromFile'
                            className='form-control form-select'
                            style={{ flex: 1 }}
                            name='key'
                            onChange={handleInputChange}
                            value={dataSnippetFromFile.key}
                        >
                            <option value='SPDXRef'>SPDXRef</option>
                            <option value='DocumentRef'>DocumentRef</option>
                        </select>
                        <div style={{ margin: '0.5rem' }}>-</div>
                        <input
                            style={{ flex: 3 }}
                            id='snippetFromFileValue'
                            className='form-control'
                            name='value'
                            type='text'
                            placeholder='Enter snippet from file SPDX identifier'
                            onChange={handleInputChange}
                            value={dataSnippetFromFile.value}
                        />
                    </div>
                </div>
            </td>
        )
    )
}

export default SnippetFileSPDXIdentifier
