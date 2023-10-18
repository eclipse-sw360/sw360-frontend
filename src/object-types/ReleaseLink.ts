// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

interface ReleaseLink {
    id: string
    name: string
    version: string
    mainlineState?: string | undefined
    clearingReport?:
        | {
              clearingReportStatus: string
          }
        | undefined
    clearingState?: string
    vendor?: string
    longName?: string
    releaseRelationship: string
    hasSubreleases?: boolean
    licenseIds?: Array<string>
    accessible?: boolean
    _embedded?: {
        'sw360:releaseLinks': Array<ReleaseLink>
    }
}

export default ReleaseLink
