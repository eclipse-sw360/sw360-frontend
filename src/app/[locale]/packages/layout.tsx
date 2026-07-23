// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import { Spinner } from 'react-bootstrap'
import { useConfigKeyValue, useSW360BackendConfigContext } from '@/contexts'
import { ConfigKeys } from '@/object-types'

interface PackagesLayoutProps {
    children: ReactNode
}

function PackagesLayout({ children }: PackagesLayoutProps): ReactNode {
    const { isLoading } = useSW360BackendConfigContext()
    const isPackageFeatureEnabled = useConfigKeyValue(ConfigKeys.IS_PACKAGE_PORTLET_ENABLED)

    if (isLoading) {
        return (
            <div className='container page-content d-flex justify-content-center py-5'>
                <Spinner className='spinner' />
            </div>
        )
    }

    if (!isLoading && isPackageFeatureEnabled !== 'true') {
        notFound()
    }

    return children
}

export default PackagesLayout
