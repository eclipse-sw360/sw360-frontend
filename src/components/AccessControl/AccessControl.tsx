// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Spinner } from 'react-bootstrap'
import { UserGroupType } from '@/object-types'

export function AccessControl<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    notAllowedGroups: UserGroupType[] = [],
): React.FC<P> {
    const ProtectedComponent: React.FC<P> = (props) => {
        const { data: session, status } = useSession()
        const t = useTranslations('default')

        if (status === 'loading') {
            return (
                <div className='col-12 d-flex justify-content-center align-items-center'>
                    <Spinner className='spinner' />
                </div>
            )
        }
        if (status === 'authenticated' && notAllowedGroups.includes(session?.user?.userGroup)) {
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
