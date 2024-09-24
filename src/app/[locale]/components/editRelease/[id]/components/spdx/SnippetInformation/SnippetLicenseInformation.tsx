// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'

interface Props {
    licenseInfoInSnippets: string[]
    setAllLicensesInformationToSnippet: React.Dispatch<React.SetStateAction<string | string[]>>
    licenseInfoInSnippetsExist: boolean
    setLicenseInfoInSnippetsExist: React.Dispatch<React.SetStateAction<boolean>>
    licenseInfoInSnippetsNone: boolean
    setLicenseInfoInSnippetsNone: React.Dispatch<React.SetStateAction<boolean>>
    licenseInfoInSnippetsNoasserttion: boolean
    setLicenseInfoInSnippetsNoasserttion: React.Dispatch<React.SetStateAction<boolean>>
}

function SnippetLicenseInformation({
    licenseInfoInSnippets,
    setAllLicensesInformationToSnippet,
    licenseInfoInSnippetsExist,
    setLicenseInfoInSnippetsExist,
    licenseInfoInSnippetsNone,
    setLicenseInfoInSnippetsNone,
    licenseInfoInSnippetsNoasserttion,
    setLicenseInfoInSnippetsNoasserttion,
}: Props) : ReactNode {
    const selectLicenseInfoSnippetExist = () => {
        setLicenseInfoInSnippetsExist(true)
        setLicenseInfoInSnippetsNone(false)
        setLicenseInfoInSnippetsNoasserttion(false)
        setAllLicensesInformationToSnippet(licenseInfoInSnippets)
    }
    const selectLicenseInfoSnippetNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLicenseInfoInSnippetsExist(false)
        setLicenseInfoInSnippetsNone(true)
        setLicenseInfoInSnippetsNoasserttion(false)
        setAllLicensesInformationToSnippet(e.target.value)
    }
    const selectLicenseInfoSnippetNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLicenseInfoInSnippetsExist(false)
        setLicenseInfoInSnippetsNone(false)
        setLicenseInfoInSnippetsNoasserttion(true)
        setAllLicensesInformationToSnippet(e.target.value)
    }

    const updateField = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAllLicensesInformationToSnippet(e.target.value)
    }

    return (
        <td colSpan={3}>
            <div className='form-group'>
                <label className='lableSPDX'>9.6 License information in snippet</label>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                        <input
                            className='spdx-radio'
                            id='licenseInfoInFile'
                            type='radio'
                            name='licenseInfoInSnippets'
                            value='EXIST'
                            onClick={selectLicenseInfoSnippetExist}
                            checked={licenseInfoInSnippetsExist}
                        />
                        <textarea
                            style={{ flex: 6, marginRight: '1rem' }}
                            id='licenseInfoInFileValue'
                            rows={5}
                            className='form-control'
                            name='licenseInfoInSnippets'
                            placeholder='Enter license information in snippet'
                            onChange={updateField}
                            value={licenseInfoInSnippets.toString().replaceAll(',', '\n')}
                            disabled={licenseInfoInSnippetsNone || licenseInfoInSnippetsNoasserttion}
                        ></textarea>
                    </div>
                    <div style={{ flex: 2 }}>
                        <input
                            className='spdx-radio'
                            id='licenseInfoInFileNone'
                            type='radio'
                            name='licenseInfoInSnippets'
                            value='NONE'
                            onChange={selectLicenseInfoSnippetNone}
                            checked={licenseInfoInSnippetsNone}
                        />
                        <label
                            style={{ marginRight: '2rem' }}
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='licenseInfoInFileNone'
                        >
                            NONE
                        </label>
                        <input
                            className='spdx-radio'
                            id='licenseInfoInFileNoAssertion'
                            type='radio'
                            name='licenseInfoInSnippets'
                            value='NOASSERTION'
                            onChange={selectLicenseInfoSnippetNoasserttion}
                            checked={licenseInfoInSnippetsNoasserttion}
                        />
                        <label
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='licenseInfoInFileNoAssertion'
                        >
                            NOASSERTION
                        </label>
                    </div>
                </div>
            </div>
        </td>
    )
}

export default SnippetLicenseInformation
