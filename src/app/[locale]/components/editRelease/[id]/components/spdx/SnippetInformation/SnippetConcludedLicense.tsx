// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'

interface Props {
    snippetConcludedLicense: string
    setSnippetConcludedLicenseToSnippet: (data: string) => void
    snippetConcludedLicenseExist: boolean
    setSnippetConcludedLicenseExist: React.Dispatch<React.SetStateAction<boolean>>
    snippetConcludedLicenseNone: boolean
    setSnippetConcludedLicenseNone: React.Dispatch<React.SetStateAction<boolean>>
    snippetConcludedLicenseNoasserttion: boolean
    setSnippetConcludedLicenseNoasserttion: React.Dispatch<React.SetStateAction<boolean>>
    updateField?: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => void
}

function SnippetConcludedLicense({
    snippetConcludedLicense,
    setSnippetConcludedLicenseToSnippet,
    snippetConcludedLicenseExist,
    setSnippetConcludedLicenseExist,
    snippetConcludedLicenseNone,
    setSnippetConcludedLicenseNone,
    snippetConcludedLicenseNoasserttion,
    setSnippetConcludedLicenseNoasserttion,
    updateField,
}: Props): ReactNode {
    const selectSnippetConcludedLicenseExist = () => {
        setSnippetConcludedLicenseExist(true)
        setSnippetConcludedLicenseNone(false)
        setSnippetConcludedLicenseNoasserttion(false)
        setSnippetConcludedLicenseToSnippet(snippetConcludedLicense)
    }
    const selectSnippetConcludedLicenseNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSnippetConcludedLicenseExist(false)
        setSnippetConcludedLicenseNone(true)
        setSnippetConcludedLicenseNoasserttion(false)
        setSnippetConcludedLicenseToSnippet(e.target.value)
    }
    const selectSnippetConcludedLicenseNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSnippetConcludedLicenseExist(false)
        setSnippetConcludedLicenseNone(false)
        setSnippetConcludedLicenseNoasserttion(true)
        setSnippetConcludedLicenseToSnippet(e.target.value)
    }

    return (
        <td colSpan={3}>
            <div className='form-group'>
                <label className='lableSPDX'>9.5 Snippet concluded license</label>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            flex: 3,
                            marginRight: '1rem',
                        }}
                    >
                        <input
                            className='spdx-radio'
                            id='spdxConcludedLicenseExist'
                            type='radio'
                            name='licenseConcluded'
                            value='EXIST'
                            onClick={selectSnippetConcludedLicenseExist}
                            checked={snippetConcludedLicenseExist}
                        />
                        <input
                            style={{
                                flex: 6,
                                marginRight: '1rem',
                            }}
                            id='spdxConcludedLicenseValue'
                            className='form-control'
                            type='text'
                            name='licenseConcluded'
                            placeholder='Enter snippet concluded license'
                            onChange={updateField}
                            value={snippetConcludedLicense}
                            disabled={snippetConcludedLicenseNone || snippetConcludedLicenseNoasserttion}
                        />
                    </div>
                    <div
                        style={{
                            flex: 2,
                        }}
                    >
                        <input
                            className='spdx-radio'
                            id='spdxConcludedLicenseNone'
                            type='radio'
                            name='licenseConcluded'
                            value='NONE'
                            onChange={selectSnippetConcludedLicenseNone}
                            checked={snippetConcludedLicenseNone}
                        />
                        <label
                            style={{
                                marginRight: '2rem',
                            }}
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='spdxConcludedLicenseNone'
                        >
                            NONE
                        </label>
                        <input
                            className='spdx-radio'
                            id='spdxConcludedLicenseNoAssertion'
                            type='radio'
                            name='licenseConcluded'
                            value='NOASSERTION'
                            onChange={selectSnippetConcludedLicenseNoasserttion}
                            checked={snippetConcludedLicenseNoasserttion}
                        />
                        <label
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='spdxConcludedLicenseNoAssertion'
                        >
                            NOASSERTION
                        </label>
                    </div>
                </div>
            </div>
        </td>
    )
}

export default SnippetConcludedLicense
