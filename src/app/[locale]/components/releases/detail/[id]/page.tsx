// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getServerSession } from 'next-auth'
import { signOut } from 'next-auth/react'
import { ReactNode } from 'react'
import authOptions from '@/app/api/auth/[...nextauth]/authOptions'
import { ConfigKeys, Configuration } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import DetailOverview from './components/DetailOverview'

interface Context {
    params: Promise<{
        id: string
    }>
}

const Detail = async (props: Context): Promise<ReactNode> => {
    const params = await props.params
    const releaseId = params.id
    const session = await getServerSession(authOptions)
    if (CommonUtils.isNullOrUndefined(session)) {
        return signOut()
    }
    const response = await ApiUtils.GET('configurations', session.user.access_token)
    const configs = (await response.json()) as Configuration
    const isSPDXFeatureEnabled = configs[ConfigKeys.SPDX_DOCUMENT_ENABLED] == 'true'

    return (
        <DetailOverview
            releaseId={releaseId}
            isSPDXFeatureEnabled={isSPDXFeatureEnabled}
        />
    )
}

export default Detail
