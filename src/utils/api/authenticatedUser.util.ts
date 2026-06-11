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
import { SW360User } from '../../../nextauth'

export const getAuthenticatedUserIdentity = async (): Promise<SW360User> => {
    const session = await getSession()

    if (CommonUtils.isNullOrUndefined(session) || !session.user) {
        dispatchSessionExpiredEvent()
        throw new ApiError('Session has expired', {
            code: 'UNAUTHORIZED',
        })
    }

    return session.user
}
