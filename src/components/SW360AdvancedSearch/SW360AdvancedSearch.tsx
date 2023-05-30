// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'

import styles from './sw360advancedsearch.module.css'

interface SW360AdvancedSearchProps {
    title: string
    fields?: { [key: string]: string | string[] }
}

function SW360AdvancedSearch({ title = 'Advanced Search', fields }: SW360AdvancedSearchProps) {
    let fieldList: JSX.Element[] = []
    if (fields) {
        fieldList = Object.entries(fields).map(([key, value]) => {
            if (typeof value === 'string') {
                return (
                    <div key={key} className='mb-3'>
                        <label htmlFor={key} className='form-label fw-bold'>
                            {key}
                        </label>
                        <input type='text' id={key} name={key} className={`form-control ${styles['form-control']}`} />
                    </div>
                )
            } else if (Array.isArray(value)) {
                return (
                    <div key={key} className='mb-3'>
                        <label htmlFor={key} className='form-label fw-bold'>
                            {key}
                        </label>
                        <select
                            id={key}
                            name={key}
                            className={`form-select ${styles['form-control']}`}
                            aria-label='project type select'
                        >
                            <option selected></option>
                            {value.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                )
            }
        })
    }

    return (
        <div className='card mb-4'>
            <div className={styles['card-header']}>
                <p className='fw-bold m-3'>{title}</p>
            </div>
            <div className={styles.cardBody}>
                <div>
                    {fieldList}
                </div>
                <button type='button' className={`fw-bold btn ${styles['button-search']}`}>
                    Search
                </button>
            </div>
        </div>
    )
}

export default SW360AdvancedSearch
