// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Vendor } from '@/object-types'

interface User {
    email: string
    fullName: string
}

interface SummaryDataType {
    description: string
    id: string
    name: string
    version: string
    visibility: string
    createdOn: string
    modifiedOn: string
    projectType: string
    domain: string
    tag: string
    externalIds: object
    additionalData: object
    externalUrls: object
    businessUnit: string
    ownerAccountingUnit: string
    ownerGroup: string
    ownerCountry: string
    enableVulnerabilitiesDisplay: boolean
    enableSvm: boolean
    roles: object
    _embedded: {
        leadArchitect: User
        createdBy: User
        modifiedBy: User
        projectResponsible: User
        projectOwner: User
        securityResponsibles: User[]
        'sw360:moderators': User[]
        'sw360:contributors': User[]
        'sw360:vendors': Vendor[]
    }
}

export default SummaryDataType
