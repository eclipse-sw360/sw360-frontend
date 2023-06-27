// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, {useState} from 'react'
import { Form, Button } from 'react-bootstrap'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './advancedsearch.module.css'
import CommonUtils from '@/utils/common.utils'
import { FaInfoCircle } from 'react-icons/fa'

interface Option {
    key: string,
    text: string
}

interface Field {
    fieldName: string
    value:  string | Array<Option>
    paramName: string
}

interface Props {
    title: string
    fields?: Array<Field>
}

interface SearchParams {
    [k: string]: string
}

function AdvancedSearch({ title = 'Advanced Search', fields }: Props) {
    const router = useRouter()
    const t = useTranslations(COMMON_NAMESPACE)
    const params = Object.fromEntries(useSearchParams())
    const [searchParams, setSearchParam] = useState<SearchParams>(params)
    const [createdOnSearchOption, setCreatedOnSearchOption] = useState('')

    const handleSearchParam = (event: any) => {
        setSearchParam((prev: SearchParams) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }))
    }

    const changeCreatedOnSearchOption = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCreatedOnSearchOption(event.target.value)
    }

    const submitSearch = () => {
        const currentUrl = new URL(window.location.href)
        const searchUrl = new URL(currentUrl.origin + currentUrl.pathname)
        Object.entries(searchParams).forEach(([key, value]: any) => {
            if (!CommonUtils.isNullEmptyOrUndefinedString(value)) {
                searchUrl.searchParams.append(key, value)
            }
        })

        const encodedUrl = encodeURI(searchUrl.toString())
        router.push(encodedUrl)
    }

    let fieldList: JSX.Element[] = []
    if (fields) {
        fieldList = fields.map((field: Field) => {
            if (field.paramName === 'createdOn' && Array.isArray(field.value)) {
                return (
                    <>
                        <Form.Group key={field.paramName} className='mb-3' controlId={field.paramName}>
                            <Form.Label className={styles['label']}>{t(field.fieldName)}</Form.Label>
                            <Form.Select
                                className={`form-control ${styles['form-control']}`}
                                size='sm'
                                name={field.paramName}
                                onChange={changeCreatedOnSearchOption} value={searchParams.type}
                            >
                                <option defaultValue='' />
                                {field.value.map((option) => (
                                    <option key={option.key} value={option.key}>
                                        {t(option.text)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {createdOnSearchOption !== 'BETWEEN' && createdOnSearchOption !== '' && (
                            <Form.Group className='mb-3'>
                                <Form.Control type='date' size='sm' />
                            </Form.Group>
                        )}

                        {createdOnSearchOption === 'BETWEEN' && (
                            <>
                                <Form.Group className='mb-3'>
                                    <Form.Control type='date' size='sm' />
                                </Form.Group>
                                <Form.Group className='mb-3'>
                                    <Form.Label className={styles['label']}>{t('To')}</Form.Label>
                                    <Form.Control type='date' size='sm' />
                                </Form.Group>
                            </>
                        )}
                    </>
                )
            } else if (typeof field.value === 'string') {
                return (
                    <Form.Group key={field.paramName} className='mb-3' controlId={field.paramName}>
                        <Form.Label className={styles['label']}>{t(field.fieldName)}</Form.Label>
                        <Form.Control
                            className={`form-control ${styles['form-control']}`}
                            type='text'
                            size='sm'
                            name={field.paramName}
                            value={searchParams[field.paramName]}
                            onChange={handleSearchParam}
                        />
                    </Form.Group>
                )
            } else if (Array.isArray(field.value)) {
                return (
                    <Form.Group key={field.paramName} className='mb-3' controlId={field.paramName}>
                        <Form.Label className={styles['label']}>{t(field.fieldName)}</Form.Label>
                        <Form.Select
                            className={`form-control ${styles['form-control']}`}
                            size='sm'
                            name={field.paramName}
                            onChange={handleSearchParam} value={searchParams.type}
                        >
                            <option defaultValue='' />
                            {field.value.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {t(option.text)}
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
                    <Form.Group className='mb-3'>
                        <Form.Check
                            type='checkbox'
                            label='Exact Match'
                            style={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                display: 'inline-block',
                                marginRight: '5px',
                            }}
                        />
                        <FaInfoCircle className={styles['info-icon']} />
                        <div className={styles['popup']}>
                            The search result will display elements exactly matching the input. Equivalent to using
                            (&quot;) around the search keyword. Applied on Component Name.
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <Button size='sm' className='sw360-button' onClick={submitSearch}>
                            {t('Search')}
                        </Button>
                    </Form.Group>
                </div>
            </div>
        </div>
    )
}

export default AdvancedSearch
