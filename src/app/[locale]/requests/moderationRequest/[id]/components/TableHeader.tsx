// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { type JSX } from 'react'

interface TableHeaderProps {
    title: string
}

function TableHeader({ title = '' }: TableHeaderProps): JSX.Element {
    return (
        <>
            <div className='tableHeader'>
                <h1 className='tableHeaderTitle mb-0'>{title}</h1>
            </div>
            <hr></hr>
        </>
    )
}

export default TableHeader
