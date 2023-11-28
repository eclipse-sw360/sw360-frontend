// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { ComponentType } from 'react'
import { Spinner } from 'react-bootstrap'

const withAuth = <T extends { session: Session }>(WrappedComponent: ComponentType<T>) => {
    const WrappedComponentWithAuth = (props: any) => {
        const { data: session, status } = useSession()

        return status === 'authenticated' ? (
            <WrappedComponent {...props} session={session} />
        ) : (
            <div className='col-12 m-2' style={{ textAlign: 'center' }}>
                <Spinner className='spinner' />
            </div>
        )
    }

    return WrappedComponentWithAuth
}

export default withAuth
