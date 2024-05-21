// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Creator from './Creator'
import DocumentState from './DocumentState'
import ExternalDocumentReferences from './ExternalDocumentReferences'
import RequestedAction from './RequestedAction'

interface DocumentCreationInformation {
    id: string
    spdxDocumentId: string // Id of the parent SPDX Document
    spdxVersion: string // 6.1
    dataLicense: string // 6.2
    SPDXID: string // 6.3
    name: string // 6.4
    documentNamespace: string // 6.5
    externalDocumentRefs: Array<ExternalDocumentReferences> // 6.6
    licenseListVersion: string // 6.7
    creator: Array<Creator> // 6.8
    created: string // 6.9
    creatorComment: string // 6.10
    documentComment: string // 6.11
    // Information for ModerationRequests
    documentState: DocumentState
    permissions: Map<RequestedAction, boolean>
    createdBy: string
    moderators: Array<string> // people who can modify the data
}

export default DocumentCreationInformation
