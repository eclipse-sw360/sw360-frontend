// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'
import { BsArrowRepeat } from 'react-icons/bs'

interface HomeTableHeaderProps {
    title: string
    setReload: React.Dispatch<React.SetStateAction<boolean>>
}

function HomeTableHeader({ title = '', setReload }: HomeTableHeaderProps): ReactNode {
    return (
        <>
            <div className='tableHeader'>
                <h1 className='tableHeaderTitle'>{title}</h1>
                <a
                    className='tableReloadButton'
                    onClick={() => {
                        setReload((prevState) => !prevState)
                    }}
                >
                    <BsArrowRepeat />
                </a>
            </div>
            <hr></hr>
        </>
    )
}

export default HomeTableHeader
