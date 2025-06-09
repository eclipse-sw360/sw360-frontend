// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Release from './Release'

export interface AttachmentUsages {
    _embedded: {
        'sw360:release': Release[]
        'sw360:attachmentUsages': AttachmentUsage[][]
    }
    linkedProjects?: {
        [key: string]: {
            projectRelationship?: string
            enableSvm?: boolean
            setEnableSvm?: boolean
            setProjectRelationship?: boolean
        }
    }
    linkedReleases?: {
        [key: string]: {
            releaseRelation?: string
            mainlineState?: string
            comment?: string
            createdOn?: string
            createdBy?: string
        }
    }
    releaseIdToUsage?: {
        [key: string]: {
            releaseRelation: string
            mainlineState: string
            comment: string
            createdOn: string
            createdBy: string
        }
    }
}

export interface AttachmentUsage {
    id?: string
    owner?: {
        releaseId: string
    }
    attachmentContentId: string
    usedBy?: {
        projectId: string
    }
    usageData?: {
        sourcePackage?: object
        manuallySet?: object
        licenseInfo?: {
            excludedLicenseIds: string[]
            projectPath: string
            includeConcludedLicense: boolean
        }
    }
}

export interface SaveUsagesPayload {
    selected: string[]
    deselected: string[]
    selectedConcludedUsages: string[]
    deselectedConcludedUsages: string[]
}
