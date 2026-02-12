// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { format, isValid, parseISO } from 'date-fns'
import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface DateFieldProps {
    /** current value in YYYY-MM-DD format or empty string */
    value: string
    /** called with normalized value (YYYY-MM-DD) or empty string when input is blurred */
    onChange: (normalized: string) => void
    /** optional HTML id attribute */
    id?: string
    /** optional HTML name attribute */
    name?: string
    /** placeholder text; default is `YYYY-MM-DD` */
    placeholder?: string
    /** additional classes applied to the `<input>` element */
    className?: string
    /** aria-label for the input if label is not provided */
    ariaLabel?: string
    /** optional label displayed above the input */
    label?: string
    /** minimum allowed date (inclusive); default is today. Pass null to allow any past date */
    minDate?: Date | null
    /** maximum allowed date (inclusive); default is unlimited. Pass a Date to restrict future dates */
    maxDate?: Date | null
}

/**
 * Controlled date input with built-in validation and normalization.
 * Accepts a loose text entry (slashed or dashed) and converts it to
 * an ISO-like `YYYY-MM-DD` string when the field loses focus.  If the
 * user types an invalid date, the value reverts to the previous valid
 * value and an error message is shown.
 *
 * Uses a plain text input with a calendar popup via react-datepicker.
 */
export default function DateField({
    value,
    onChange,
    id,
    name,
    placeholder = 'YYYY-MM-DD',
    className = '',
    ariaLabel,
    label,
    minDate = new Date(),
    maxDate = null,
}: DateFieldProps): JSX.Element {
    const t = useTranslations('default')

    const [date, setDate] = useState<string>(value ?? '')
    const [error, setError] = useState<string>('')
    const [calendarOpen, setCalendarOpen] = useState<boolean>(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setDate(value ?? '')
        setError('')
    }, [
        value,
    ])

    // Close calendar on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setCalendarOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Normalize date to YYYY-MM-DD
    const normalize = useCallback((raw: string): string => {
        if (!raw) return ''
        const cleaned = raw.replace(/\//g, '-')
        const m = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
        if (!m) return ''
        const y = Number(m[1])
        const mo = Number(m[2])
        const d = Number(m[3])
        const dt = new Date(y, mo - 1, d)
        if (Number.isNaN(dt.getTime()) || dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
            return ''
        }
        return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setDate(e.target.value)
        setError('')
    }

    const validateDateRange = (selectedDate: Date): string => {
        const normalizedMin = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null
        const normalizedMax = maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) : null
        const normalizedSelected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())

        if (normalizedMin && normalizedSelected < normalizedMin) {
            const formattedMin = format(normalizedMin, 'yyyy-MM-dd')
            return t('Date must be on or after dateValue', {
                dateValue: formattedMin,
            })
        }

        if (normalizedMax && normalizedSelected > normalizedMax) {
            const formattedMax = format(normalizedMax, 'yyyy-MM-dd')
            return t('Date must be on or before dateValue', {
                dateValue: formattedMax,
            })
        }

        return ''
    }

    const handleInputBlur = (): void => {
        if (calendarOpen) return

        const raw = (date ?? '').trim()
        const normalized = normalize(raw)
        if (normalized) {
            const selectedDate = parseISO(normalized)
            const validationError = validateDateRange(selectedDate)

            if (validationError) {
                setError(validationError)
                return
            }

            if (normalized !== value) {
                onChange(normalized)
            }
            setError('')
        } else if (raw) {
            setError(t('Invalid date format, use YYYY-MM-DD'))
        } else {
            if (value !== '') {
                onChange('')
            }
            setError('')
        }
    }

    const handleCalendarSelect = (selected: Date | null): void => {
        if (selected) {
            const formatted = format(selected, 'yyyy-MM-dd')
            setDate(formatted)

            const validationError = validateDateRange(selected)
            if (validationError) {
                setError(validationError)
            } else {
                setError('')
                if (formatted !== value) {
                    onChange(formatted)
                }
            }
        }
        setCalendarOpen(false)
    }

    const parseDate = (str: string): Date | null => {
        if (!str) return null
        const parsed = parseISO(str)
        return isValid(parsed) ? parsed : null
    }

    return (
        <>
            {label && (
                <label
                    htmlFor={id}
                    className='form-label fw-bold'
                >
                    {label}
                </label>
            )}
            <div
                ref={wrapperRef}
                className='position-relative'
            >
                <input
                    type='text'
                    id={id}
                    name={name}
                    className={`form-control ${error ? 'is-invalid' : ''} ${className}`.trim()}
                    aria-label={ariaLabel}
                    placeholder={placeholder}
                    value={date}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onClick={() => setCalendarOpen(true)}
                    autoComplete='off'
                />
                {date && !error && (
                    <button
                        type='button'
                        className='datefield-clear-btn'
                        onClick={() => {
                            setDate('')
                            setError('')
                            if (value !== '') {
                                onChange('')
                            }
                        }}
                        aria-label='Clear date'
                        tabIndex={-1}
                    >
                        &times;
                    </button>
                )}
                {calendarOpen && (
                    <div className='position-absolute mt-1 datefield-calendar-popover'>
                        <DatePicker
                            selected={parseDate(date)}
                            onChange={handleCalendarSelect}
                            inline
                            filterDate={(d: Date) => {
                                const normalizedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
                                const normalizedMin = minDate
                                    ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
                                    : null
                                const normalizedMax = maxDate
                                    ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
                                    : null

                                if (normalizedMin && normalizedDate < normalizedMin) return false
                                if (normalizedMax && normalizedDate > normalizedMax) return false
                                return true
                            }}
                        />
                    </div>
                )}
            </div>
            {error && <div className='form-text text-danger'>{error}</div>}
        </>
    )
}
