// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { UiConfigProvider } from '@/contexts'
import { useSession } from 'next-auth/react'
import type { JSX } from 'react'

type Props = {
    children?: React.ReactNode
}

export const UiConfigWrapper = ({ children }: Props): JSX.Element => {
    const { status } = useSession()

    // Only load config for authenticated users
    if (status === 'authenticated') {
        return <UiConfigProvider>{children}</UiConfigProvider>
    }

    return <>{children}</>
}
