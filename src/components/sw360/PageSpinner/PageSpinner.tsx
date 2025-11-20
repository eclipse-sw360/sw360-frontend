// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import type { JSX } from 'react'
import { Spinner } from 'react-bootstrap'

function PageSpinner(): JSX.Element {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
            }}
        >
            <Spinner className='spinner'>
                <span className='visually-hidden'>Loading...</span>
            </Spinner>
        </div>
    )
}

export default PageSpinner
