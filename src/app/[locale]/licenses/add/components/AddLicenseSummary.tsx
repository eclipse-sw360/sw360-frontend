// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { LicensePayload } from '@/object-types'
import AddLicenseDetail from './AddLicenseDetail'
import AddLicenseText from './AddLicenseText'

interface Props {
    licensePayload?: LicensePayload
    setLicensePayload?: React.Dispatch<React.SetStateAction<LicensePayload>>
    errorShortName?: boolean
    errorFullName?: boolean
    inputValid?: boolean
    setErrorShortName?: React.Dispatch<React.SetStateAction<boolean>>
    setErrorFullName?: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddLicenseSummary({
    licensePayload,
    setLicensePayload,
    errorShortName,
    errorFullName,
    inputValid,
    setErrorShortName,
    setErrorFullName,
}: Props) {
    return (
        <div className='col'>
            <AddLicenseDetail
                licensePayload={licensePayload}
                setLicensePayload={setLicensePayload}
                errorShortName={errorShortName}
                errorFullName={errorFullName}
                setErrorShortName={setErrorShortName}
                setErrorFullName={setErrorFullName}
                inputValid={inputValid}
            />
            <AddLicenseText
                licensePayload={licensePayload}
                setLicensePayload={setLicensePayload}
                inputValid={inputValid}
            />
        </div>
    )
}
