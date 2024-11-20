// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export interface Obligation {
    id?: string
    type?: string
    text?: string
    whitelist?: Array<string>
    development?: string
    distribution?: string
    title?: string
    obligationLevel?: string
    obligationType?: string
    node?: string
    issetBitfield?: number
    customPropertyToValue?: Map<string, string>
    _links?: {
        self: {
            href: string
        }
    }
}

export interface LicenseObligationRelease {
    name: string
    version: string
    type: string
    id: string
}

export interface ProjectObligation {
    [k: string]: {
        text?: string
        licenseIds?: string[]
        id?: string
        obligationLevel?: string
        status?: string
        comment?: string
        type?: string
        releases?: LicenseObligationRelease[]
    }
}

export interface ProjectObligationsList {
    obligations: ProjectObligation
    page?: {
        size?: number
        totalElements?: number
        totalPages?: number
        number?: number
    }
}