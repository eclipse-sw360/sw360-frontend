// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

interface EmbeddedComponent {
    id: string
    name: string
    description: string
    componentType: string
    visbility: string
    mainLicenseIds: Array<string>
    defaultVendor: {
        type: string
        url: string
        shortName: string
        fullName: string
    }
    setBusinessUnit: boolean
    setVisbility: boolean
    _links: {
        self: {
            href: string
        }
    }
}

export default EmbeddedComponent
