// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Links from './Links'

interface Package {
    id?: string
    rev?: string
    type?: string
    name: string
    version?: string
    purl?: string
    packageType?: string
    releaseId?: string
    licenseIds?: Array<string>
    description?: string
    homepageUrl?: string
    vcs?: string
    createdOn?: string
    modifiedOn?: string
    createdBy?: string
    packageManager?: string
    clearingState?: string
    _links?: Links
    _embedded?: {
        createdBy?: {
            email: string
            wantsMailNotification: boolean
            deactivated: boolean
            fullName: string
            _links?: Links
        }
        modifiedBy?: {
            email: string
            wantsMailNotification: boolean
            deactivated: boolean
            fullName: string
            _links?: Links
        }
        "sw360:release"?: {
            id: string
            name: string
            version: string
            _links: Links
        }
    }
}

export default Package
