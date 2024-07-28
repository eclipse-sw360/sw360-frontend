// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Project from './Project'
import { User } from './User'

export default interface ClearingRequestDetails{
    id: string,
    requestedClearingDate?: string,
    projectId?: string,
    projectName?: string,
    requestingUser?: string,
    requestingUserName?: string,
    projectBU?: string,
    requestingUserComment?: string,
    clearingTeam?: string,
    clearingTeamName?: string,
    agreedClearingDate?: string,
    priority?: string,
    clearingType?: string,
    clearingState?: string,
    reOpenOn?: number,
    createdOn?: string,
    comments?: [{
        text?: string,
        commentedBy?: string
    }]
    links?: {
        self: {
            href: string
        }
    },
    _embedded?: {
        'clearingTeam'?: User
        'requestingUser'?: User
        'sw360:project'?: Project
    }
}
