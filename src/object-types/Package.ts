// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

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
    createdBy?: string
    packageManager?: string
}

export default Package
