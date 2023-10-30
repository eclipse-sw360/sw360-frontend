// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Attachment, Links, Release, User, Vendor } from '@/object-types'

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
    _links?: Links
    _embedded?: {
        createdBy?: User
        'sw360:moderators'?: Array<User>
        'sw360:vendors'?: Array<Vendor>
        'sw360:releases'?: Array<Release>
        defaultVendor?: Vendor
        modifiedBy?: User
        componentOwner?: User
        'sw360:attachments'?: Array<Attachment>
    }
}

export default Component
