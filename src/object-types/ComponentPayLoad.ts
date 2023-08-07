// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export default interface ComponentPayload {
    name: string
    createBy: string
    description: string
    componentType: string
    modifiedBy: string
    modifiedOn: string
    moderators: string[]
    componentOwner: string
    ownerAccountingUnit: string
    ownerGroup: string
    ownerCountry: string
    roles: any
    externalIds: any
    additionalData: any
    defaultVendorId: string
    categories: string[]
    homepage: string
    mailinglist: string
    wiki: string
    blog: string
}
