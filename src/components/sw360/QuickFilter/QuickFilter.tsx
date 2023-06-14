// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import { Form } from 'react-bootstrap'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { useTranslations } from 'next-intl'

import styles from '@/components/sw360/AdvancedSearch/advancedsearch.module.css'

interface Props {
    searchFunction?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

function QuickFilter({ searchFunction }: Props) {
    const t = useTranslations(COMMON_NAMESPACE)

    return (
        <div className='card-deck'>
            <div id='quick-filter' className='card'>
                <div className='card-header'>{t('Quick Filter')}</div>

                <div className='card-body'>
                    <Form>
                        <Form.Group key='Quick Filter' className='mb-3' controlId='Quick Filter'>
                            <Form.Control
                                className={`form-control ${styles['form-control']}`}
                                type='text'
                                size='sm'
                                name='Quick Filter'
                                // value={searchParams.name}
                                // onChange={handleSearchParam}
                                onKeyUp={searchFunction}
                            />
                        </Form.Group>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default QuickFilter
