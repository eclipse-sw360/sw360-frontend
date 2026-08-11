// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { JSX } from 'react'
import { Form } from 'react-bootstrap'
import { RequestType } from '@/object-types'

interface FilterOption {
    key: string
    label: string
}

const DATE_FIELD_OPTIONS: FilterOption[] = [
    {
        key: 'createdOn',
        label: 'Created on',
    },
    {
        key: 'requestedClearingDate',
        label: 'Preferred Clearing Date',
    },
    {
        key: 'agreedClearingDate',
        label: 'Agreed Clearing Date',
    },
    {
        key: 'modifiedOn',
        label: 'Last Updated on',
    },
]

// Only closed clearing requests carry a closing date.
const CLOSED_ON_DATE_FIELD_OPTION: FilterOption = {
    key: 'closedOn',
    label: 'Request Closed on',
}

const PAST_RANGE_OPTIONS: FilterOption[] = [
    {
        key: '0',
        label: 'Today',
    },
    {
        key: '-30',
        label: 'Last 30 days',
    },
    {
        key: '-7',
        label: 'Last 7 days',
    },
    {
        key: '-15',
        label: 'Last 15 days',
    },
]

const FUTURE_RANGE_OPTIONS: FilterOption[] = [
    {
        key: '15',
        label: 'Next 15 days',
    },
    {
        key: '7',
        label: 'Next 7 days',
    },
    {
        key: '30',
        label: 'Next 30 days',
    },
]

// Backend only accepts a positive `days` range for these two date fields.
const DATE_FIELDS_SUPPORTING_FUTURE_RANGE = [
    'requestedClearingDate',
    'agreedClearingDate',
]

const PRIORITY_OPTIONS = [
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL',
]

const CLEARING_TYPE_OPTIONS = [
    'DEEP',
    'HIGH',
]

export const CLEARING_REQUEST_STATUSES: Record<RequestType, string[]> = {
    [RequestType.OPEN]: [
        'NEW',
        'ACCEPTED',
        'IN_PROGRESS',
        'PENDING_INPUT',
        'SANITY_CHECK',
        'IN_QUEUE',
        'AWAITING_RESPONSE',
        'ON_HOLD',
    ],
    [RequestType.CLOSED]: [
        'CLOSED',
        'REJECTED',
    ],
}

function ClearingRequestAdvancedFilter({ requestType }: { requestType: RequestType }): JSX.Element {
    const t = useTranslations('default')
    const router = useRouter()
    const pathname = usePathname()
    const params = useSearchParams()

    const dateField = params.get('dateField') ?? ''
    const days = params.get('days') ?? ''
    const priority = params.get('priority') ?? ''
    const status = params.get('status') ?? ''
    const clearingType = params.get('clearingType') ?? ''

    const rangeOptions = DATE_FIELDS_SUPPORTING_FUTURE_RANGE.includes(dateField)
        ? [
              ...PAST_RANGE_OPTIONS,
              ...FUTURE_RANGE_OPTIONS,
          ]
        : PAST_RANGE_OPTIONS

    const dateFieldOptions =
        requestType === RequestType.CLOSED
            ? [
                  ...DATE_FIELD_OPTIONS,
                  CLOSED_ON_DATE_FIELD_OPTION,
              ]
            : DATE_FIELD_OPTIONS

    const applyFilters = (updates: Record<string, string>) => {
        const nextParams = new URLSearchParams(params.toString())
        for (const [key, value] of Object.entries(updates)) {
            if (value === '') {
                nextParams.delete(key)
            } else {
                nextParams.set(key, value)
            }
        }
        const queryString = nextParams.toString()
        router.replace(queryString === '' ? pathname : `${pathname}?${queryString}`, {
            scroll: false,
        })
    }

    const renderSelectOptions = (options: FilterOption[]) =>
        options.map((option) => (
            <option
                key={option.key}
                value={option.key}
            >
                {t(option.label)}
            </option>
        ))

    return (
        <div className='card-deck'>
            <div
                id='advanced-search'
                className='card'
            >
                <div className='card-header'>{t('Advanced Filter')}</div>
                <div className='card-body'>
                    <Form.Group
                        className='mb-3'
                        controlId='dateField'
                    >
                        <Form.Label className='label'>{`${t('Select date type and range')}:`}</Form.Label>
                        <Form.Select
                            className='form-control'
                            size='sm'
                            name='dateField'
                            value={dateField}
                            onChange={(e) =>
                                applyFilters({
                                    dateField: e.target.value,
                                    days: '',
                                })
                            }
                        >
                            <option value='' />
                            {renderSelectOptions(dateFieldOptions)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group
                        className='mb-3'
                        controlId='days'
                    >
                        <Form.Select
                            className='form-control'
                            size='sm'
                            name='days'
                            aria-label={t('Select date type and range')}
                            disabled={dateField === ''}
                            value={days}
                            onChange={(e) =>
                                applyFilters({
                                    days: e.target.value,
                                })
                            }
                        >
                            <option value='' />
                            {renderSelectOptions(rangeOptions)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group
                        className='mb-3'
                        controlId='priority'
                    >
                        <Form.Label className='label'>{`${t('Priority')}:`}</Form.Label>
                        <Form.Select
                            className='form-control'
                            size='sm'
                            name='priority'
                            value={priority}
                            onChange={(e) =>
                                applyFilters({
                                    priority: e.target.value,
                                })
                            }
                        >
                            <option value='' />
                            {PRIORITY_OPTIONS.map((option) => (
                                <option
                                    key={option}
                                    value={option}
                                >
                                    {t(option)}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group
                        className='mb-3'
                        controlId='status'
                    >
                        <Form.Label className='label'>{`${t('Status')}:`}</Form.Label>
                        <Form.Select
                            className='form-control'
                            size='sm'
                            name='status'
                            value={status}
                            onChange={(e) =>
                                applyFilters({
                                    status: e.target.value,
                                })
                            }
                        >
                            <option value='' />
                            {CLEARING_REQUEST_STATUSES[requestType].map((option) => (
                                <option
                                    key={option}
                                    value={option}
                                >
                                    {t(option)}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group
                        className='mb-3'
                        controlId='clearingType'
                    >
                        <Form.Label className='label'>{`${t('Clearing Type')}:`}</Form.Label>
                        <Form.Select
                            className='form-control'
                            size='sm'
                            name='clearingType'
                            value={clearingType}
                            onChange={(e) =>
                                applyFilters({
                                    clearingType: e.target.value,
                                })
                            }
                        >
                            <option value='' />
                            {CLEARING_TYPE_OPTIONS.map((option) => (
                                <option
                                    key={option}
                                    value={option}
                                >
                                    {t(option)}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>
        </div>
    )
}

export default ClearingRequestAdvancedFilter
