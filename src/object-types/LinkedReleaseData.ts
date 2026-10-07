// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { MainlineState, ReleaseRelationship } from '@/object-types'

interface LinkedReleaseData {
    comment?: string
    mainlineState?: MainlineState
    name: string
    releaseRelation?: ReleaseRelationship
    version: string
}

export default LinkedReleaseData
