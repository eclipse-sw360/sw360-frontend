// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Component from './Component'
import Project from './Project'
import Release from './Release'

export default interface ModerationRequestDetails {
    id: string
    revision?: string
    timestamp?: number
    timestampOfDecision?: number
    documentId: string
    documentType?: string
    requestingUser?: string
    moderators?: string[]
    documentName?: string
    moderationState?: string
    reviewer?: string
    requestDocumentDelete?: boolean
    requestingUserDepartment?: string
    componentType?: string
    commentRequestingUser?: string
    commentDecisionModerator?: null
    componentAdditions?: { [k: string]: string }
    releaseAdditions?: { [k: string]: string }
    projectAdditions?: { [k: string]: string }
    licenseAdditions?: { [k: string]: string }
    user?: { [k: string]: string }
    componentDeletions?: { [k: string]: string }
    releaseDeletions?: { [k: string]: string }
    projectDeletions?: { [k: string]: string }
    licenseDeletions?: { [k: string]: string }
    moderatorsSize?: number
    links?: {
        self: {
            href: string
        }
    }
    _embedded?: {
        'sw360:components'?: Component[]
        'sw360:projects'?: Project[]
        'sw360:releases'?: Release[]
    }
}
