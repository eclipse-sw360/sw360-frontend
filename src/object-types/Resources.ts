// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { EmbeddedComponent, EmbeddedProject, RestrictedResource } from '@/object-types'

interface Resources {
    _embedded: {
        'sw360:projects': Array<EmbeddedProject>
        'sw360:components': Array<EmbeddedComponent>
        'sw360:restrictedResources': Array<RestrictedResource>
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

export default Resources
