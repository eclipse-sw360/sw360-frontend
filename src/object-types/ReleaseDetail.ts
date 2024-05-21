// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import {
    Attachment,
    COTSDetails,
    ClearingInformation,
    ECCInformation,
    LicenseDetail,
    ReleaseLink,
    Repository,
    User,
    Vendor,
} from '@/object-types'
import DocumentCreationInformation from './spdx/DocumentCreationInformation'
import PackageInformation from './spdx/PackageInformation'
import SPDXDocument from './spdx/SPDXDocument'

export default interface ReleaseDetail {
    id?: string
    name?: string
    version?: string
    releaseDate?: string
    description?: string
    componentType?: string
    externalIds?: { [k: string]: string }
    additionalData?: { [k: string]: string }
    createdOn?: string
    repository?: Repository
    mainlineState?: string
    clearingState?: string
    createdBy?: string
    roles?: { [k: string]: Array<string> }
    mainLicenseIds?: string[]
    otherLicenseIds?: string[]
    clearingInformation?: ClearingInformation
    languages?: string[]
    operatingSystems?: string[]
    softwarePlatforms?: string[]
    sourceCodeDownloadurl?: string
    binaryDownloadurl?: string
    releaseIdToRelationship?: { [k: string]: string }
    modifiedOn?: string
    cpeId?: string
    eccInformation?: ECCInformation
    spdxId?: string
    _links?: {
        'sw360:component': {
            href: string
        }
        self: {
            href: string
        }
        curies: [
            {
                href: string
                name: string
                templated: boolean
            }
        ]
    }
    _embedded?: {
        'sw360:modifiedBy'?: User
        'sw360:createdBy'?: User
        'sw360:moderators'?: User[]
        'sw360:vendors'?: Vendor[]
        'sw360:contributors'?: User[]
        'sw360:cotsDetail'?: COTSDetails
        'sw360:releaseLinks'?: ReleaseLink[]
        'sw360:attachments'?: Array<Attachment>
        'sw360:licenses'?: Array<LicenseDetail>
        'sw360:otherLicenses'?: Array<LicenseDetail>
        'sw360:subscribers'?: User[]
        'sw360:documentCreationInformation'?: DocumentCreationInformation
        'sw360:packageInformation'?: PackageInformation
        'sw360:spdxDocument'?: SPDXDocument
    }
}
