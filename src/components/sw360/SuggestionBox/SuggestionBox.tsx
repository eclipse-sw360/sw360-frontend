// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import React, { JSX, useEffect, useState } from 'react'

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
    const inputElementId = customInputProps.id ?? 'suggestion-box'
    const suggestionListId = inputElementId + '-autocomplete-list'

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
    }

    // Clear the suggestions when user inputs escape
    const closeSuggestionOnKey = (e: React.KeyboardEvent<HTMLInputElement> | undefined) => {
        if (e && (e.code.toLowerCase() === 'escape' || e.key.toLowerCase() === 'escape')) {
            setSuggestions([])
        }
    }

    // Renter the auto complete suggestion input box
    return (
        <div className='autocomplete-wrapper'>
            <input
                id={inputElementId}
                name={customInputProps.name}
                className='form-control'
                type='text'
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={closeSuggestionOnKey}
                placeholder={customInputProps.placeHolder ?? 'Start typing...'}
                required={customInputProps.required ?? false}
                aria-autocomplete='list'
                aria-controls='autocomplete-list'
                aria-haspopup={true}
                aria-expanded={true}
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
                            onClick={() => handleSuggestionClick(suggestion)}
                            role='option'
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
