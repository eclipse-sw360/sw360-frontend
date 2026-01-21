// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Helio Chissini de Castro. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { PaginationMeta } from '@/object-types'

interface Embedded<SW360Type, SW360Key extends string> {
    _embedded: {
        [key in SW360Key]: Array<SW360Type>
    }
    _links?: {
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
            },
        ]
    }
    page?: PaginationMeta
}

export default Embedded
