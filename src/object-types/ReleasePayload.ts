// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import AttachmentDetail from "./AttachmentDetail"
import COTSDetails from "./COTSDetails"
import ECCInformation from "./ECCInformation"
import Repository from "./Repository"

export default interface ReleasePayload {
    name?: string
    cpeid?: string
    version?: string
    componentId?: string
    releaseDate?: string
    externalIds?: any
    additionalData?: any
    clearingState?:string
    createdOn?: string
    createBy?: string
    modifiedBy?: string 
    modifiedOn?: string
    mainlineState?: string
    contributors?: string[]
    moderators?: string[]
    roles?: any
    mainLicenseIds?: string[]
    otherLicenseIds?: string[]
    vendorId?: string
    languages?: string[]
    operatingSystems?: string[]
    softwarePlatforms?: string[]
    sourceCodeDownloadurl?: string
    binaryDownloadurl?: string
    repository?: Repository
    releaseIdToRelationship?: any
    cotsDetails?: COTSDetails
    attachmentDTOs?: AttachmentDetail[]
    eccInformation?: ECCInformation
}
