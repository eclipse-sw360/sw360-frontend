// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Links, Release } from '@/object-types'

interface LinkedRelease {
    createdBy: string
    release: string
    mainlineState: string
    comment: string
    createdOn: string
    relation: string
}

interface LinkedProject {
    project: string
    enableSvm: string
    relation: string
}

export default interface LicenseClearing {
    enableSvm: boolean
    considerReleasesFromExternalList: boolean
    enableVulnerabilitiesDisplay: boolean
    linkedReleases: LinkedRelease[]
    linkedProjects?: LinkedProject[]
    _links: Links
    _embedded: {
        'sw360:release': Release[]
    }
}
