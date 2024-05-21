// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Annotations from './Annotations'
import DocumentState from './DocumentState'
import OtherLicensingInformationDetected from './OtherLicensingInformationDetected'
import RelationshipsBetweenSPDXElements from './RelationshipsBetweenSPDXElements'
import RequestedAction from './RequestedAction'
import SnippetInformation from './SnippetInformation'

interface SPDXDocument {
    id: string
    releaseId: string // Id of the parent release
    spdxDocumentCreationInfoId: string // Id of Document Creation Info
    spdxPackageInfoIds: Array<string> // Ids of Package Info
    spdxFileInfoIds: Array<string> // Ids of File Info
    snippets: Array<SnippetInformation> // 9. Snippet Information
    relationships: Array<RelationshipsBetweenSPDXElements> // 11. Relationships
    annotations: Array<Annotations> // 12. Annotations
    otherLicensingInformationDetecteds: Array<OtherLicensingInformationDetected> // 10. Other Licensing Information Detected
    // Information for ModerationRequests
    documentState: DocumentState
    permissions: Map<RequestedAction, boolean>
    createdBy: string
    moderators: Array<string> // people who can modify the data
}

export default SPDXDocument
