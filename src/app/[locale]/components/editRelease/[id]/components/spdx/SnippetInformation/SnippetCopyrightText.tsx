// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'

interface Props {
    snippetCopyrightText: string
    setSnippetConcludedLicenseToSnippet: (data: string) => void
    snippetCopyrightTextExist: boolean
    setSnippetCopyrightTextExist: React.Dispatch<React.SetStateAction<boolean>>
    snippetCopyrightTextNone: boolean
    setSnippetCopyrightTextNone: React.Dispatch<React.SetStateAction<boolean>>
    snippetCopyrightTextNoasserttion: boolean
    setSnippetCopyrightTextNoasserttion: React.Dispatch<React.SetStateAction<boolean>>
    updateField: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => void
}

function SnippetCopyrightText({
    snippetCopyrightText,
    setSnippetConcludedLicenseToSnippet,
    snippetCopyrightTextExist,
    setSnippetCopyrightTextExist,
    snippetCopyrightTextNone,
    setSnippetCopyrightTextNone,
    snippetCopyrightTextNoasserttion,
    setSnippetCopyrightTextNoasserttion,
    updateField,
}: Props): ReactNode {
    const selectSnippetCopyrightTextExist = () => {
        setSnippetCopyrightTextExist(true)
        setSnippetCopyrightTextNone(false)
        setSnippetCopyrightTextNoasserttion(false)
        setSnippetConcludedLicenseToSnippet(snippetCopyrightText)
    }
    const selectSnippetCopyrightTextNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSnippetCopyrightTextExist(false)
        setSnippetCopyrightTextNone(true)
        setSnippetCopyrightTextNoasserttion(false)
        setSnippetConcludedLicenseToSnippet(e.target.value)
    }
    const selectSnippetCopyrightTextNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSnippetCopyrightTextExist(false)
        setSnippetCopyrightTextNone(false)
        setSnippetCopyrightTextNoasserttion(true)
        setSnippetConcludedLicenseToSnippet(e.target.value)
    }

    return (
        <td colSpan={3}>
            <div className='form-group'>
                <label className='lableSPDX'>9.8 Snippet copyright text</label>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                        <input
                            className='spdx-radio'
                            id='snippetCopyrightText'
                            type='radio'
                            name='_sw360_portlet_components_SNIPPET_COPYRIGHT_TEXT'
                            value='EXIST'
                            onClick={selectSnippetCopyrightTextExist}
                            checked={snippetCopyrightTextExist}
                        />
                        <textarea
                            style={{ flex: 6, marginRight: '1rem' }}
                            id='copyrightTextValueSnippet'
                            rows={5}
                            className='form-control'
                            name='copyrightText'
                            placeholder='Enter snippet copyright text'
                            onChange={updateField}
                            value={snippetCopyrightText}
                            disabled={snippetCopyrightTextNone || snippetCopyrightTextNoasserttion}
                        ></textarea>
                    </div>
                    <div style={{ flex: 2 }}>
                        <input
                            className='spdx-radio'
                            id='snippetCopyrightTextNone'
                            type='radio'
                            name='copyrightText'
                            value='NONE'
                            onChange={selectSnippetCopyrightTextNone}
                            checked={snippetCopyrightTextNone}
                        />
                        <label
                            style={{ marginRight: '2rem' }}
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='snippetCopyrightTextNone'
                        >
                            NONE
                        </label>
                        <input
                            className='spdx-radio'
                            id='snippetCopyrightTextNoAssertion'
                            type='radio'
                            name='copyrightText'
                            value='NOASSERTION'
                            onChange={selectSnippetCopyrightTextNoasserttion}
                            checked={snippetCopyrightTextNoasserttion}
                        />
                        <label
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='snippetCopyrightTextNoAssertion'
                        >
                            NOASSERTION
                        </label>
                    </div>
                </div>
            </div>
        </td>
    )
}

export default SnippetCopyrightText
