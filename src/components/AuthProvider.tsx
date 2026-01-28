// Copyright (c) Anushree Bondia, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { usePathname } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { Spinner } from 'react-bootstrap'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { status } = useSession()
    const pathname = usePathname()

    useEffect(() => {
        if (status === 'unauthenticated') {
            // Redirect to sign-in page, preserve intended path
            signIn(undefined, {
                callbackUrl: pathname,
            })
        }
    }, [
        status,
        pathname,
    ])

    if (status === 'loading') {
        return (
            <div
                className='col-12 d-flex justify-content-center align-items-center'
                style={{
                    minHeight: 200,
                }}
            >
                <Spinner className='spinner' />
            </div>
        )
    }

    // Only render children if authenticated
    if (status === 'authenticated') {
        return <>{children}</>
    }
    // Otherwise, nothing (redirect in progress)
    return null
}
