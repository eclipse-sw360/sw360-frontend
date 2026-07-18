// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { SessionProvider } from 'next-auth/react'

import type { JSX } from 'react'
import SessionStatusHandler from './SessionStatusHandler'

type Props = {
    children?: React.ReactNode
    refetchIntervalSeconds?: number
}

const DEFAULT_SESSION_REFETCH_INTERVAL_SECONDS = 5 * 60
export const Providers = ({ children, refetchIntervalSeconds }: Props): JSX.Element => {
    const resolvedRefetchIntervalSeconds =
        refetchIntervalSeconds && refetchIntervalSeconds > 0
            ? refetchIntervalSeconds
            : DEFAULT_SESSION_REFETCH_INTERVAL_SECONDS

    return (
        <SessionProvider
            refetchOnWindowFocus={false}
            refetchInterval={resolvedRefetchIntervalSeconds}
        >
            <SessionStatusHandler />
            {children}
        </SessionProvider>
    )
}
