// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import React, { JSX, useEffect, useRef, useState } from 'react'

type SuggestionBoxProps = {
    id: string
    name: string
    required?: boolean
    placeHolder?: string
    aria_describedby?: string
}

function SuggestionBox({
    initialValue,
    possibleValues,
    inputProps: customInputProps = {},
    onValueChange,
    isMultiValue = false,
}: {
    initialValue?: string | null
    possibleValues: string[]
    inputProps: Partial<SuggestionBoxProps>
    onValueChange: (value: string) => void
    isMultiValue?: boolean
}): JSX.Element {
    const [inputValue, setInputValue] = useState<string>(initialValue ?? '')
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [focusedIndex, setFocusedIndex] = useState<number>(-1)
    const suggestionItemRefs = useRef<Array<HTMLLIElement | null>>([])
    const inputElementId = customInputProps.id ?? 'suggestion-box'
    const suggestionListId = inputElementId + '-autocomplete-list'
    const focusedOptionId = focusedIndex >= 0 ? `${suggestionListId}-option-${focusedIndex}` : undefined

    // Sometimes initialValues are loaded with an API call, thus async
    useEffect(() => {
        setInputValue(initialValue ?? '')
    }, [
        initialValue,
    ])

    // Whenever input changes, call the user provided value change function
    useEffect(() => {
        onValueChange(inputValue)
    }, [
        inputValue,
    ])

    useEffect(() => {
        if (focusedIndex < 0) {
            return
        }

        const focusedSuggestionItem = suggestionItemRefs.current[focusedIndex]
        if (focusedSuggestionItem) {
            focusedSuggestionItem.scrollIntoView({
                block: 'nearest',
            })
        }
    }, [
        focusedIndex,
    ])

    // When user types an input. If multi value supported, split everything via `,` else take as is.
    // Use only the last input to update the suggestions.
    const handleInputChange = (event: React.FocusEvent<HTMLInputElement>) => {
        const value: string = event.target.value
        let values: string[]
        if (isMultiValue) {
            values = value && value.length > 0 ? value.split(',').map((v) => v.trimStart()) : []
        } else {
            values =
                value.length > 0
                    ? [
                          value,
                      ]
                    : []
        }
        setInputValue(value)
        setFocusedIndex(-1)
        if (values.length > 0) {
            const lastInput = values.at(-1) ?? ''
            const filteredSuggestions = possibleValues.filter((suggestion) =>
                suggestion.toLowerCase().includes(lastInput.toLowerCase()),
            )
            setSuggestions(filteredSuggestions)
        } else {
            setSuggestions([])
        }
    }

    /**
     * Treat input as a CSV and add the new value by replacing the last element which can be:
     * -# an empty string (user typed nothing)
     * -# partially typed search string (user clicked on suggestion while searching)
     * -# complete string (user typed the entire string in search and clicked on suggestion, effectively no change)
     */
    const addToCsvEnd = (originalValue: string, newValue: string): string => {
        const originalArray: string[] = originalValue.split(',').map((v) => v.trim())
        if (originalArray.length < 1) {
            return newValue
        }
        const shortArray = originalArray.slice(0, -1)
        shortArray.push(newValue)
        return shortArray.join(', ')
    }

    // User clicked on a suggestion, add it to the inputValue at the end and clear suggestions
    const handleSuggestionClick = (value: string) => {
        setInputValue(addToCsvEnd(inputValue, value))
        setSuggestions([])
        setFocusedIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const key = e.key
        const isArrowUp = key === 'ArrowUp'
        const isArrowDown = key === 'ArrowDown'
        const isEnter = key === 'Enter'
        const isTab = key === 'Tab'
        const isEscape = key === 'Escape'

        if (isEscape) {
            setSuggestions([])
            setFocusedIndex(-1)
            return
        }

        // Only handle arrow, enter, and tab if suggestions are visible
        if (suggestions.length === 0) {
            return
        }

        if (isArrowDown) {
            e.preventDefault()
            setFocusedIndex((prev) => {
                const nextIndex = prev < suggestions.length - 1 ? prev + 1 : 0
                return nextIndex
            })
        } else if (isArrowUp) {
            e.preventDefault()
            setFocusedIndex((prev) => {
                const nextIndex = prev > 0 ? prev - 1 : suggestions.length - 1
                return nextIndex
            })
        } else if (isEnter && focusedIndex >= 0) {
            e.preventDefault()
            handleSuggestionClick(suggestions[focusedIndex])
        } else if (isTab && focusedIndex >= 0) {
            e.preventDefault()
            handleSuggestionClick(suggestions[focusedIndex])
        } else if (isTab && focusedIndex < 0 && suggestions.length > 0) {
            e.preventDefault()
            handleSuggestionClick(suggestions[0])
        }
    }

    return (
        <div className='autocomplete-wrapper'>
            <input
                id={inputElementId}
                name={customInputProps.name}
                className='form-control'
                type='text'
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={customInputProps.placeHolder ?? 'Start typing...'}
                required={customInputProps.required ?? false}
                aria-autocomplete='list'
                aria-controls={suggestionListId}
                aria-haspopup='listbox'
                aria-expanded={suggestions.length > 0}
                aria-activedescendant={focusedOptionId}
                aria-describedby={customInputProps.aria_describedby}
                data-toggle={'dropdown'}
            />
            {suggestions.length > 0 && (
                <ul
                    id={suggestionListId}
                    className='suggestions-list shadow bg-body rounded'
                    role='listbox'
                >
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            ref={(element) => {
                                suggestionItemRefs.current[index] = element
                            }}
                            id={`${suggestionListId}-option-${index}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            onMouseEnter={() => setFocusedIndex(index)}
                            onMouseLeave={() => setFocusedIndex(-1)}
                            className={focusedIndex === index ? 'suggestion-focused' : ''}
                            role='option'
                            aria-selected={focusedIndex === index}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default SuggestionBox
