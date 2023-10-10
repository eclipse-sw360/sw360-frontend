// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'

import { ArrowRepeat } from 'react-bootstrap-icons'

interface HomeTableHeaderProps {
    title: string
}

function HomeTableHeader({ title = '' }: HomeTableHeaderProps) {
    return (
        <>
            <div className='tableHeader'>
                <h1 className='tableHeaderTitle'>{title}</h1>
                <ArrowRepeat />
            </div>
            <hr></hr>
        </>
    )
}

export default HomeTableHeader
