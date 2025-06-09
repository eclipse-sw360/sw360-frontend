// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'

interface Props {
    copyrightText: string
    setCopyrightTextToPackage: (data: string) => void
    copyrightTextExist: boolean
    setCopyrightTextExist: React.Dispatch<React.SetStateAction<boolean>>
    copyrightTextNone: boolean
    setCopyrightTextNone: React.Dispatch<React.SetStateAction<boolean>>
    copyrightTextNoasserttion: boolean
    setCopyrightTextNoasserttion: React.Dispatch<React.SetStateAction<boolean>>
}

function PackageCopyrightText({
    copyrightText,
    setCopyrightTextToPackage,
    copyrightTextExist,
    setCopyrightTextExist,
    copyrightTextNone,
    setCopyrightTextNone,
    copyrightTextNoasserttion,
    setCopyrightTextNoasserttion,
}: Props): ReactNode {
    const selectCopyrightTextExist = () => {
        setCopyrightTextExist(true)
        setCopyrightTextNone(false)
        setCopyrightTextNoasserttion(false)
        setCopyrightTextToPackage(copyrightText)
    }
    const selectCopyrightTextNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCopyrightTextExist(false)
        setCopyrightTextNone(true)
        setCopyrightTextNoasserttion(false)
        setCopyrightTextToPackage(e.target.value)
    }
    const selectCopyrightTextNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCopyrightTextExist(false)
        setCopyrightTextNone(false)
        setCopyrightTextNoasserttion(true)
        setCopyrightTextToPackage(e.target.value)
    }

    const updateField = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCopyrightTextToPackage(e.target.value)
    }

    return (
        <td colSpan={3}>
            <div className='form-group'>
                <label className='lableSPDX'>7.17 Copyright text</label>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                        <input
                            className='spdx-radio'
                            id='copyrightTextExist'
                            type='radio'
                            name='_sw360_portlet_components_COPYRIGHT_TEXT'
                            value='EXIST'
                            onClick={selectCopyrightTextExist}
                            checked={copyrightTextExist}
                        />
                        <textarea
                            style={{ flex: 6, marginRight: '1rem' }}
                            id='copyrightText'
                            rows={5}
                            className='form-control'
                            name='copyrightText'
                            placeholder='Enter copyright text'
                            onChange={updateField}
                            value={copyrightText}
                            disabled={copyrightTextNone || copyrightTextNoasserttion}
                        ></textarea>
                    </div>
                    <div style={{ flex: 2 }}>
                        <input
                            className='spdx-radio'
                            id='copyrightTextNone'
                            type='radio'
                            name='_sw360_portlet_components_COPYRIGHT_TEXT'
                            value='NONE'
                            onChange={selectCopyrightTextNone}
                            checked={copyrightTextNone}
                        />
                        <label
                            style={{ marginRight: '2rem' }}
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='copyrightTextNone'
                        >
                            NONE
                        </label>
                        <input
                            className='spdx-radio'
                            id='copyrightTextNoAssertion'
                            type='radio'
                            name='_sw360_portlet_components_COPYRIGHT_TEXT'
                            value='NOASSERTION'
                            onChange={selectCopyrightTextNoasserttion}
                            checked={copyrightTextNoasserttion}
                        />
                        <label
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='copyrightTextNoAssertion'
                        >
                            NOASSERTION
                        </label>
                    </div>
                </div>
            </div>
        </td>
    )
}

export default PackageCopyrightText
