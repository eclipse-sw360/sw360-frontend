// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import EmbeddedAttachment from './EmbeddedAttachment'
import EmbeddedRelease from './EmbeddedRelease'
import EmbeddedUser from './EmbeddedUser'
import Vendor from './Vendor'

interface Component {
    id?: string
    name?: string
    description?: string
    createdOn?: string
    componentType?: string
    subscribers?: Array<string>
    moderators?: Array<string>
    componentOwner?: string
    ownerAccountingUnit?: string
    ownerGroup?: string
    ownerCountry?: string
    visbility?: string
    externalIds?: { [k: string]: string }
    additionalData?: { [k: string]: string }
    mainLicenseIds?: Array<string>
    defaultVendorId?: string
    categories?: Array<string>
    languages?: Array<string>
    softwarePlatforms?: Array<string>
    operatingSystems?: Array<string>
    homepage?: string
    mailinglist?: string
    wiki?: string
    blog?: string
    modifiedOn?: string
    modifiedBy?: string
    roles?: { [k: string]: Array<string> }
    setBusinessUnit?: boolean
    setVisbility?: boolean
    defaultVendor?: {
        type: string
        url: string
        shortName: string
        fullName: string
    }
    _links?: {
        self: {
            href: string
        }
    }
    _embedded?: {
        createdBy?: EmbeddedUser
        'sw360:moderators'?: Array<EmbeddedUser>
        'sw360:vendors'?: Array<Vendor>
        'sw360:releases'?: Array<EmbeddedRelease>
        defaultVendor?: Vendor
        modifiedBy?: EmbeddedUser
        componentOwner?: EmbeddedUser
        'sw360:attachments'?: Array<EmbeddedAttachment>
    }
}

export default Component
