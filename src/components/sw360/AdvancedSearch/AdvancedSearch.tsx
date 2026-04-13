// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ShowInfoOnHover } from 'next-sw360'
import React, { type JSX, useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import SuggestionBox from '@/components/sw360/SuggestionBox/SuggestionBox'
import CommonUtils from '@/utils/common.utils'

interface Option {
    key: string
    text: string
}

interface Field {
    fieldName: string
    value: string | Array<Option>
    paramName: string
    enableAutocomplete?: boolean
    autocompleteSuggestions?: string[]
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
    const [searchParams, setSearchParam] = useState<SearchParams>({
        ...params,
        luceneSearch: params.luceneSearch || 'true',
    })
    const [createdOnSearchOption, setCreatedOnSearchOption] = useState('')
    const [isUsersPage, setIsUsersPage] = useState(false)
    const [isPackagesPage, setIsPackagesPage] = useState(false)

    const handleSearchParam = (event: React.ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
        setSearchParam((prev: SearchParams) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }))
    }

    const changeCreatedOnSearchOption = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCreatedOnSearchOption(event.target.value)
    }

    useEffect(() => {
        const currentUrl = new URL(window.location.href)
        setIsUsersPage(currentUrl.pathname.includes('users'))
    }, [])

    useEffect(() => {
        const currentUrl = new URL(window.location.href)
        setIsPackagesPage(currentUrl.pathname.includes('packages'))
    }, [])

    const submitSearch = () => {
        const currentUrl = new URL(window.location.href)
        const searchUrl = new URL(currentUrl.origin + currentUrl.pathname)
        Object.entries(searchParams).forEach(([key, value]: Array<string>) => {
            if (!CommonUtils.isNullEmptyOrUndefinedString(value)) {
                searchUrl.searchParams.append(key, value)
            }
        })
        router.push(searchUrl.toString())
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
                            <Form.Group
                                className='mb-3'
                                controlId={field.paramName}
                            >
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
                                        <option
                                            key={option.key}
                                            value={option.key}
                                        >
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
                                        max={new Date().toISOString().split('T')[0]}
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
                                            max={new Date().toISOString().split('T')[0]}
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
                                            max={new Date().toISOString().split('T')[0]}
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
                        <Form.Group
                            key={field.paramName}
                            className='mb-3'
                            controlId={field.paramName}
                        >
                            <Form.Label className='label'>{fieldLabel}</Form.Label>
                            {typeof field.enableAutocomplete !== 'undefined' &&
                            field.enableAutocomplete &&
                            field.autocompleteSuggestions ? (
                                <SuggestionBox
                                    initialValue={searchParams[field.paramName] || ''}
                                    possibleValues={field.autocompleteSuggestions}
                                    inputProps={{
                                        id: field.paramName,
                                        name: field.paramName,
                                        placeHolder: `${t('Enter')} ${fieldLabel}`,
                                    }}
                                    onValueChange={(value) => {
                                        setSearchParam((prev: SearchParams) => ({
                                            ...prev,
                                            [field.paramName]: value,
                                        }))
                                    }}
                                    isMultiValue={true}
                                />
                            ) : (
                                <Form.Control
                                    className='form-control'
                                    type='text'
                                    size='sm'
                                    name={field.paramName}
                                    value={searchParams[field.paramName] || ''}
                                    onChange={handleSearchParam}
                                />
                            )}
                        </Form.Group>
                    )
                }
                if (Array.isArray(field.value)) {
                    return (
                        <Form.Group
                            key={field.paramName}
                            className='mb-3'
                            controlId={field.paramName}
                        >
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
                                    <option
                                        key={option.key}
                                        value={option.key}
                                    >
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
            <div
                id='advanced-search'
                className='card'
            >
                <div className='card-header'>{title}</div>

                <div className='card-body'>
                    <Form onSubmit={handleSubmit}>
                        {fields?.map((field) => renderField(field))}
                        <Form.Group
                            className='mb-3'
                            hidden={isUsersPage}
                        >
                            <Form.Check
                                inline
                                type='checkbox'
                                label={t('Exact Match')}
                                id='exactMatch'
                                checked={searchParams.luceneSearch === 'false'}
                                onChange={(e) => {
                                    setSearchParam((prev) => ({
                                        ...prev,
                                        luceneSearch: e.target.checked ? 'false' : 'true',
                                    }))
                                }}
                            />
                            <ShowInfoOnHover text={t('Exact_Match_Info')} />
                        </Form.Group>
                        <Form.Group
                            className='mb-3'
                            hidden={!isPackagesPage}
                        >
                            <Form.Check
                                inline
                                type='checkbox'
                                label={t('Orphan Package')}
                                id='orphanPackage'
                                checked={searchParams.orphanPackage === 'true'}
                                onChange={(e) =>
                                    setSearchParam((prev) => ({
                                        ...prev,
                                        orphanPackage: e.target.checked ? 'true' : '',
                                    }))
                                }
                            />
                            <ShowInfoOnHover text={t('Orphan package info')} />
                        </Form.Group>

                        <Form.Group>
                            <Button
                                type='submit'
                                size='sm'
                                variant='primary'
                                className='w-100'
                            >
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
