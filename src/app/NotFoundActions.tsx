// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useRouter } from 'next/navigation'
import { type JSX } from 'react'

function NotFoundActions(): JSX.Element {
    const router = useRouter()

    return (
        <div className='d-flex justify-content-center gap-3'>
            <button
                className='btn btn-secondary px-4 py-2'
                onClick={() => router.back()}
            >
                Go Back
            </button>
            <button
                className='btn btn-secondary px-4 py-2'
                onClick={() => router.push('/')}
            >
                Return Home
            </button>
        </div>
    )
}

export default NotFoundActions
