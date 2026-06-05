// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession } from 'next-auth/react'
import { ApiError } from '@/utils'
import CommonUtils from '@/utils/common.utils'
import { dispatchSessionExpiredEvent } from '@/utils/sessionExpiry.utils'

export interface AuthenticatedUserIdentity {
    email: string
    name: string
}

export const getAuthenticatedUserIdentity = async (): Promise<AuthenticatedUserIdentity> => {
    const session = await getSession()

    if (CommonUtils.isNullOrUndefined(session)) {
        dispatchSessionExpiredEvent()
        throw new ApiError('Session has expired', {
            code: 'UNAUTHORIZED',
        })
    }

    return {
        email: session.user?.email ?? '',
        name: session.user?.name ?? '',
    }
}
