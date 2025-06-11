// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export default interface CreateClearingRequestPayload {
    requestedClearingDate?: string
    clearingTeam?: string
    clearingType?: string
    priority?: string
    requestingUserComment?: string
}
