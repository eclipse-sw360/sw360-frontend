// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import styles from './TableLinkedObligations.module.css'

import type { JSX } from 'react'

interface Props {
    title?: string
    searchFunction?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}
function FilterSearch({ title, searchFunction }: Props): JSX.Element {
    return (
        <div className={styles['div-filter']}>
            <label>Search: </label>
            &nbsp;&nbsp;
            <input
                type='text'
                name={title}
                onInput={searchFunction}
                className={`form-control ${styles['input-filter']}`}
            />
        </div>
    )
}

export default FilterSearch
