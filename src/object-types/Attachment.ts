// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

interface Attachment {
    attachmentContentId: string | undefined
    filename: string | undefined
    sha1: string | undefined
    attachmentType: string | undefined
    createdBy: string | undefined
    createdTeam: string | undefined
    createdComment: string | undefined
    createdOn: string | undefined
    checkedTeam: string | undefined
    checkedComment: string | undefined
    checkedOn: string | undefined
    checkStatus: string | undefined
    checkedBy: string | undefined
    usageAttachment:
        | {
              visible: number
              restricted: number
          }
        | undefined
}

export default Attachment
