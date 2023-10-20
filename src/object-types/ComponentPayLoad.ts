// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Attachment } from '@/object-types'
export default interface ComponentPayload {
    name?: string | undefined
    createBy?: string | undefined
    description?: string | undefined
    componentType?: string | undefined
    modifiedBy?: string | undefined
    modifiedOn?: string | undefined
    moderators?: string[] | undefined
    componentOwner?: string | undefined
    ownerAccountingUnit?: string | undefined
    ownerGroup?: string | undefined
    ownerCountry?: string | undefined
    roles?: any | undefined
    externalIds?: any | undefined
    additionalData?: any | undefined
    defaultVendorId?: string | undefined
    categories?: string[] | undefined
    homepage?: string | undefined
    mailinglist?: string | undefined
    wiki?: string | undefined
    blog?: string | undefined
    attachmentDTOs?: Array<Attachment> | undefined
}
