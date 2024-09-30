// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'

interface Props {
    licenseName: string
    setLicenseNameToOtherLicense: (data: string) => void
    isLicenseName: boolean
    setIsLicenseName: React.Dispatch<React.SetStateAction<boolean>>
    updateField?: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => void
}

function OtherLicenseName({
    licenseName,
    setLicenseNameToOtherLicense,
    isLicenseName,
    setIsLicenseName,
    updateField,
}: Props) : ReactNode {
    const selectLicenseNameNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLicenseName(false)
        setLicenseNameToOtherLicense(e.target.value)
    }

    const selectLicenseNameNoasserttionExsit = () => {
        setIsLicenseName(true)
        setLicenseNameToOtherLicense(licenseName)
    }

    return (
        <td colSpan={3}>
            <div className='form-group'>
                <label className='lableSPDX'>10.3 License name</label>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                        <input
                            className='spdx-radio'
                            id='licenseNameExist'
                            type='radio'
                            name='licenseName'
                            value='EXIST'
                            onChange={selectLicenseNameNoasserttionExsit}
                            checked={isLicenseName}
                        />
                        <input
                            style={{ flex: 6, marginRight: '1rem' }}
                            id='licenseName'
                            className='form-control needs-validation'
                            type='text'
                            placeholder='Enter license name'
                            name='licenseName'
                            onChange={updateField}
                            value={licenseName}
                            disabled={!isLicenseName}
                        />
                    </div>
                    <div style={{ flex: 2 }}>
                        <input
                            className='spdx-radio'
                            id='licenseNameNoAssertion'
                            type='radio'
                            name='licenseName'
                            value='NOASSERTION'
                            onChange={selectLicenseNameNoasserttion}
                            checked={!isLicenseName}
                        />
                        <label className='form-check-label radio-label lableSPDX' htmlFor='licenseNameNoAssertion'>
                            NOASSERTION
                        </label>
                    </div>
                </div>
            </div>
        </td>
    )
}

export default OtherLicenseName
