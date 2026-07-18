// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { type ComponentType, type FC, useEffect, useState } from 'react'
import { UserGroupType } from '@/object-types'
import { getAuthenticatedUserIdentity } from '@/utils/api/authenticatedUser.util'

export function AccessControl<P extends object>(
    WrappedComponent: ComponentType<P>,
    notAllowedGroups: UserGroupType[] = [],
): FC<P> {
    const ProtectedComponent: FC<P> = (props) => {
        const t = useTranslations('default')
        const [userIdentity, setUserIdentity] = useState<Awaited<
            ReturnType<typeof getAuthenticatedUserIdentity>
        > | null>(null)

        useEffect(() => {
            void (async () => {
                try {
                    setUserIdentity(await getAuthenticatedUserIdentity())
                } catch {
                    setUserIdentity(null)
                }
            })()
        }, [])

        const userGroup = userIdentity?.userGroup
        if (userGroup !== undefined && notAllowedGroups.includes(userGroup)) {
            return (
                <div className='container page-content'>
                    <div
                        className='alert alert-warning mt-5'
                        role='alert'
                    >
                        {t('User does not have required permission to view this page')}
                    </div>
                </div>
            )
        }
        return <WrappedComponent {...props} />
    }
    return ProtectedComponent
}
