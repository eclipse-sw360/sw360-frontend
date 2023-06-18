// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import { Form, Button } from 'react-bootstrap'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { useTranslations } from 'next-intl'

import styles from './advancedsearch.module.css'

interface Props {
    title: string
    fields?: { [key: string]: string | string[] }
}

function AdvancedSearch({ title = 'Advanced Search', fields }: Props) {
    const t = useTranslations(COMMON_NAMESPACE)
    let fieldList: JSX.Element[] = []
    if (fields) {
        fieldList = Object.entries(fields).map(([key, value]) => {
            if (typeof value === 'string') {
                return (
                    <Form.Group key={key} className='mb-3' controlId={key}>
                        <Form.Label className={styles['label']}>{t(key)}</Form.Label>
                        <Form.Control
                            className={`form-control ${styles['form-control']}`}
                            type='text'
                            size='sm'
                            name={key}
                            // value={searchParams.name}
                            // onChange={handleSearchParam}
                        />
                    </Form.Group>
                )
            } else if (Array.isArray(value)) {
                return (
                    <Form.Group key={key} className='mb-3' controlId='type'>
                        <Form.Label className={styles['label']}>{t(key)}</Form.Label>
                        <Form.Select
                            className={`form-control ${styles['form-control']}`}
                            size='sm'
                            name={key}
                            // onChange={handleSearchParam} value={searchParams.type}
                        >
                            <option defaultValue='' />
                            {value.map((option) => (
                                <option key={option} value={option}>
                                    {t(option)}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                )
            }
        })
    }

    return (
        <div className='card-deck'>
            <div id='advanced-search' className='card'>
                <div className='card-header'>{t(title)}</div>

                <div className='card-body'>
                    <Form>{fieldList}</Form>
                    <Form.Group>
                        <Button size='sm' className='sw360-button'>
                            {t('Search')}
                        </Button>
                    </Form.Group>
                </div>
            </div>
        </div>
    )
}

export default AdvancedSearch
