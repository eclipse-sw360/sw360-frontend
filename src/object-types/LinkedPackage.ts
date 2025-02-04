// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Release } from '@/object-types'

interface LinkedPackage {
    id: string
    name: string
    packageVersion: string
    vendorId?: string
    vendorName?: string
    releaseId?: string
    version?: string
    licenseIds?: Array<string>
    packageManager?: string
    _embedded?: {
        'sw360:release'?: Array<Release>
    }
}

export default LinkedPackage