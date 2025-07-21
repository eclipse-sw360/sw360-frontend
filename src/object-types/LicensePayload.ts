// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Obligation } from './Obligation'

export default interface LicensePayload {
    shortName?: string
    fullName?: string
    externalLicenseLink?: string
    note?: string
    OSIApproved?: string
    FSFLibre?: string
    obligations?: Array<Obligation>
    obligationDatabaseIds?: Array<string>
    text?: string
    checked?: boolean
    licenseType?: {
        id?: string
        licenseType?: string
    }
    licenseTypeDatabaseId?: string
    _links?: {
        self: {
            href: string
        }
    }
}
