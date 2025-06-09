// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

interface AttachmentRowData {
    attachmentContentId?: string
    filename: string
    attachmentType: string
    createdBy?: string
    createdTeam?: string
    createdComment?: string
    createdOn?: string
    checkedTeam?: string
    checkedComment?: string
    checkedOn?: string
    checkStatus?: string
    checkedBy?: string
    isAddedNew?: boolean
}

export default AttachmentRowData
