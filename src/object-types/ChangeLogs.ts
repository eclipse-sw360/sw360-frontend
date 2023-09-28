// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export interface Changes {
    fieldName: string
    fieldValueOld: string
    fieldValueNew: string
}

export interface ReferenceDoc {
    refDocId: string
    refDocType: string
    refDocOperation: string
}

export interface ChangeLog {
    id: string
    type: string
    documentId: string
    documentType: string
    changes?: Array<Changes>
    operation: string
    userEdited: string
    changeTimestamp: string
    referenceDoc?: Array<ReferenceDoc>
    info?: { [k: string]: string }
}

export interface EmbeddedChangeLogs {
    _embedded: {
        'sw360:changeLogs': Array<ChangeLog>
    }
    _links: {
        first?: {
            href: string
        }
        last?: {
            href: string
        }
        curies?: [
            {
                href: string
                name: string
                templated: boolean
            }
        ]
    }
    page?: {
        size: number
        totalElements: number
        totalPages: number
        number: number
    }
}
