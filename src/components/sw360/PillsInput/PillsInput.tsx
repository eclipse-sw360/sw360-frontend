// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useState, type JSX } from 'react'
import { Badge, Stack } from 'react-bootstrap'
import CloseButton from 'react-bootstrap/CloseButton'

function PillsInput({ tags, onTagsChange }: { tags: string[]; onTagsChange: (a: string[]) => void }): JSX.Element {
    const [inputValue, setInputValue] = useState('')

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            const trimmedValue = inputValue.trim()
            if (trimmedValue && !tags.includes(trimmedValue)) {
                const newTags = new Set(tags)
                newTags.add(trimmedValue)
                onTagsChange(Array.from(newTags.values()))
                setInputValue('')
            }
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = new Set(tags)
        newTags.delete(tagToRemove)
        onTagsChange(Array.from(newTags.values()))
    }

    return (
        <Stack
            gap={2}
            className='mx-auto'
        >
            <div>
                {Array.from(tags).map((tag, index) => (
                    <Badge
                        pill={true}
                        key={index}
                        bg='primary'
                        className='mx-1 mb-1'
                    >
                        {tag}{' '}
                        <CloseButton
                            variant='white'
                            aria-label='Remove'
                            onClick={() => handleRemoveTag(tag)}
                        />
                    </Badge>
                ))}
            </div>
            <div>
                <input
                    type='text'
                    className='form-control'
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    placeholder='Enter values separated by comma'
                />
            </div>
        </Stack>
    )
}

export default PillsInput
