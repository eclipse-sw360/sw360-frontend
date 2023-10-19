// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { LinkedVulnerability } from '@/object-types'

interface EmbeddedVulnerabilites {
    _embedded: {
        'sw360:vulnerabilityDTOes': Array<LinkedVulnerability>
    }
    _links: {
        curies: [
            {
                href: string
                name: string
                templated: boolean
            }
        ]
    }
}

export default EmbeddedVulnerabilites
