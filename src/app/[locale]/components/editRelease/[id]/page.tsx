// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { type ReactNode, use } from 'react'
import { useConfigKeyValue } from '@/contexts'
import { ConfigKeys } from '@/object-types'
import EditRelease from './components/EditRelease'

interface Context {
    params: Promise<{
        id: string
    }>
}

const ReleaseEditPage = ({ params }: Context): ReactNode => {
    const resolvedParams = use(params)
    const isSPDXFeatureEnabled = useConfigKeyValue(ConfigKeys.SPDX_DOCUMENT_ENABLED) === 'true'

    return (
        <EditRelease
            releaseId={resolvedParams.id}
            isSPDXFeatureEnabled={isSPDXFeatureEnabled}
        />
    )
}

export default ReleaseEditPage
