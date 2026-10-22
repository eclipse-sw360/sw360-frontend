// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { type JSX, useRef } from 'react'
import { Form } from 'react-bootstrap'
import type { QuickFilterProps } from './QuickFilter.types'

function QuickFilter({ id, searchFunction, title = 'Quick Filter' }: QuickFilterProps): JSX.Element {
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(() => {
            searchFunction?.(value)
        }, 700)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return

        e.preventDefault()
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }
        searchFunction?.(e.currentTarget.value)
    }

    return (
        <div className='card-deck'>
            <div
                id='component-quickfilter'
                className='card'
            >
                <div className='card-header'>{title}</div>
                <div className='card-body'>
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <Form.Group
                            key={id}
                            className='mb-3'
                            controlId={id}
                        >
                            <Form.Control
                                className='form-control'
                                type='text'
                                size='sm'
                                name={title}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                            />
                        </Form.Group>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default QuickFilter
