// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ReactNode } from 'react'
import { LicensePayload } from '@/object-types'
import EditLicenseDetail from './EditLicenseDetail'
import EditLicenseText from './EditLicenseText'

interface Props {
    errorFullName: boolean
    setErrorFullName: React.Dispatch<React.SetStateAction<boolean>>
    licensePayload: LicensePayload
    inputValid: boolean
    setLicensePayload: React.Dispatch<React.SetStateAction<LicensePayload>>
}

export default function EditLicenseSummary({
    licensePayload,
    setLicensePayload,
    errorFullName,
    setErrorFullName,
    inputValid,
}: Props): ReactNode {
    return (
        <div className='col'>
            <EditLicenseDetail
                licensePayload={licensePayload}
                setLicensePayload={setLicensePayload}
                inputValid={inputValid}
                errorFullName={errorFullName}
                setErrorFullName={setErrorFullName}
            />
            <EditLicenseText
                licensePayload={licensePayload}
                setLicensePayload={setLicensePayload}
                inputValid={inputValid}
            />
        </div>
    )
}
