// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE


'use client'

import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, type JSX } from 'react'
import { Button, Form } from 'react-bootstrap'

import CommonUtils from '@/utils/common.utils'
import { ShowInfoOnHover } from 'next-sw360'

interface Option {
    key: string
    text: string
}

interface Field {
    fieldName: string
    value: string | Array<Option>
    paramName: string
}

interface Props {
    title: string
    fields?: Array<Field>
}

interface SearchParams {
    [k: string]: string
}

function AdvancedSearch({ title = 'Advanced Search', fields }: Props): JSX.Element {
    const router = useRouter()
    const t = useTranslations('default')
    const params = Object.fromEntries(useSearchParams())
    const [searchParams, setSearchParam] = useState<SearchParams>(params)
    const [createdOnSearchOption, setCreatedOnSearchOption] = useState('')

    const handleSearchParam = (event: React.ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
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
        searchUrl.searchParams.append('allDetails', 'true')
        searchUrl.searchParams.append('luceneSearch', 'true')
        Object.entries(searchParams).forEach(([key, value]: Array<string>) => {
            if (!CommonUtils.isNullEmptyOrUndefinedString(value)) {
                searchUrl.searchParams.append(key, value)
            }
        })
        const encodedUrl = encodeURI(searchUrl.toString().replace(/%40/g, '@'))
        router.push(encodedUrl)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        submitSearch()
    }

    const renderField = (field: Field) => {
        const fieldLabel = field.fieldName
        switch (field.paramName) {
            case 'createdOn':
                if (Array.isArray(field.value)) {
                    return (
                        <div key='createdOn'>
                            <Form.Group className='mb-3' controlId={field.paramName}>
                                <Form.Label className='label'>{fieldLabel}</Form.Label>
                                <Form.Select
                                    aria-label={field.fieldName}
                                    className='form-control'
                                    size='sm'
                                    name={field.paramName}
                                    onChange={changeCreatedOnSearchOption}
                                    value={searchParams.type}
                                >
                                    <option value='' />
                                    {field.value.map((option) => (
                                        <option key={option.key} value={option.key}>
                                            {option.text}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {createdOnSearchOption !== 'BETWEEN' && createdOnSearchOption !== '' && (
                                <Form.Group className='mb-3'>
                                    <Form.Control 
                                        type='date' 
                                        size='sm' 
                                        name='createdOnDate'
                                        value={searchParams.createdOnDate}
                                        onChange={handleSearchParam}
                                    />
                                </Form.Group>
                            )}

                            {createdOnSearchOption === 'BETWEEN' && (
                                <>
                                    <Form.Group className='mb-3'>
                                        <Form.Control 
                                            type='date' 
                                            size='sm' 
                                            name='createdOnStart'
                                            value={searchParams.createdOnStart}
                                            onChange={handleSearchParam}
                                        />
                                    </Form.Group>
                                    <Form.Group className='mb-3'>
                                        <Form.Label className='label'>{t('To')}</Form.Label>
                                        <Form.Control 
                                            type='date' 
                                            size='sm' 
                                            name='createdOnEnd'
                                            value={searchParams.createdOnEnd}
                                            onChange={handleSearchParam}
                                        />
                                    </Form.Group>
                                </>
                            )}
                        </div>
                    )
                }
                break

            default:
                if (typeof field.value === 'string') {
                    return (
                        <Form.Group key={field.paramName} className='mb-3' controlId={field.paramName}>
                            <Form.Label className='label'>{fieldLabel}</Form.Label>
                            <Form.Control
                                className='form-control'
                                type='text'
                                size='sm'
                                name={field.paramName}
                                value={searchParams[field.paramName] || ''}
                                onChange={handleSearchParam}
                            />
                        </Form.Group>
                    )
                }
                if (Array.isArray(field.value)) {
                    return (
                        <Form.Group key={field.paramName} className='mb-3' controlId={field.paramName}>
                            <Form.Label className='label'>{fieldLabel}</Form.Label>
                            <Form.Select
                                className='form-control'
                                size='sm'
                                name={field.paramName}
                                onChange={handleSearchParam}
                                value={searchParams[field.paramName] || ''}
                            >
                                <option value='' />
                                {field.value.map((option) => (
                                    <option key={option.key} value={option.key}>
                                        {option.text}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )
                }
                break
        }
        return null
    }

    return (
        <div className='card-deck'>
            <div id='advanced-search' className='card'>
                <div className='card-header'>{title}</div>

                <div className='card-body'>
                    <Form onSubmit={handleSubmit}>
                        {fields?.map((field) => renderField(field))}

                        <Form.Group className='mb-3'>
                            <Form.Check
                                type='checkbox'
                                label={t('Exact Match')}
                                id='exactMatch'
                                checked={searchParams.exactMatch === 'true'}
                                onChange={(e) => 
                                    setSearchParam(prev => ({
                                        ...prev,
                                        exactMatch: e.target.checked ? 'true' : ''
                                    }))
                                }
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    display: 'inline-block',
                                    marginRight: '5px',
                                }}
                            />
                            <ShowInfoOnHover text={t('Exact_Match_Info')} />
                        </Form.Group>

                        <Form.Group>
                            <Button type='submit' size='sm' variant='primary' className='w-100'>
                                {t('Search')}
                            </Button>
                        </Form.Group>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default AdvancedSearch