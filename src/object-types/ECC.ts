// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Links } from '@/object-types'

interface ECC {
    name: string
    version: string
    eccInformation: {
        eccn: string
        eccStatus: string
        assessorContactPerson: string
        assessorDepartment: string
        assessmentDate: string
        creatorGroup: string
    }
    _links?: Links
}

export default ECC
