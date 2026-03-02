// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import {
    Attachment,
    ClearingInformation,
    COTSDetails,
    ECCInformation,
    LinkedPackageData,
    Links,
    Repository,
    Vendor,
} from '@/object-types'

interface Release {
    id?: string
    name?: string
    cpeid?: string
    version?: string
    componentId?: string | null
    componentType?: string
    releaseDate?: string
    externalIds?: {
        [k: string]: string
    } | null
    additionalData?: {
        [k: string]: string
    } | null
    clearingState?: string
    createdOn?: string
    createBy?: string
    modifiedBy?: string
    modifiedOn?: string
    mainlineState?: string
    contributors?: Array<string> | null
    moderators?: Array<string> | null
    roles?: {
        [k: string]: Array<string>
    } | null
    mainLicenseIds?: Array<string> | null
    otherLicenseIds?: Array<string> | null
    vendorId?: string | null
    vendor?: Vendor
    languages?: Array<string> | null
    operatingSystems?: Array<string> | null
    softwarePlatforms?: Array<string> | null
    sourceCodeDownloadurl?: string
    binaryDownloadurl?: string
    repository?: Repository | null
    releaseIdToRelationship?: {
        [k: string]: string
    } | null
    clearingInformation?: ClearingInformation
    cotsDetails?: COTSDetails | null
    attachments?: Array<Attachment> | null
    eccInformation?: ECCInformation
    spdxId?: string
    _links?: Links
    comment?: string
    linkedPackages?: LinkedPackageData[]
    packageIds?: string[]
}

export default Release
