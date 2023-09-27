// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import AttachmentDetail from './AttachmentDetail'
import COTSDetails from './COTSDetails'
import ClearingInformation from './ClearingInformation'
import ECCInformation from './ECCInformation'
import ReleaseLink from './ReleaseLink'
import Repository from './Repository'
import Vendor from './Vendor'
import EmbeddedUser from './EmbeddedUser'

export default interface ReleaseDetail {
    name?: string
    version?: string
    releaseDate?: string
    componentType?: string
    externalIds?: string
    additionalData?: string
    createdOn?: string
    repository?: Repository
    mainlineState?: string
    clearingState?: string
    createdBy?: string
    roles?: string
    mainLicenseIds?: string[]
    otherLicenseIds?: string[]
    clearingInformation?: ClearingInformation
    languages?: string[]
    operatingSystems?: string[]
    softwarePlatforms?: string[]
    sourceCodeDownloadurl?: string
    binaryDownloadurl?: string
    releaseIdToRelationship?: Map<string, string>
    modifiedOn?: string
    cpeId?: string
    eccInformation?: ECCInformation
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
        'sw360:modifiedBy'?: EmbeddedUser
        'sw360:createdBy'?: EmbeddedUser
        'sw360:moderators'?: EmbeddedUser[]
        'sw360:vendors'?: Vendor[]
        'sw360:contributors'?: EmbeddedUser[]
        'sw360:cotsDetail'?: COTSDetails
        'sw360:releaseLinks'?: ReleaseLink[]
        'sw360:attachments'?: AttachmentDetail[]
    }
}
