// components/CheckboxFilterDropdown.tsx

'use client'

import React, { useState } from 'react'
import { Dropdown, Form } from 'react-bootstrap'
import { BsFilter } from 'react-icons/bs'

interface CheckboxFilterDropdownProps {
    options: string[]
    onChange: (selectedOptions: string[]) => void
    title: string
    isOpen: boolean
    onToggle: () => void
}

const CheckboxFilterDropdown: React.FC<CheckboxFilterDropdownProps> = ({
    options,
    onChange,
    title,
    isOpen,
    onToggle,
}) => {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    const handleCheckboxChange = (option: string, event: React.ChangeEvent<HTMLInputElement>) => {
        // Prevent dropdown from closing when clicking checkboxes
        event.stopPropagation()

        const newSelectedOptions = selectedOptions.includes(option)
            ? selectedOptions.filter((item) => item !== option)
            : [...selectedOptions, option]

        setSelectedOptions(newSelectedOptions)
        onChange(newSelectedOptions)
    }

    return (
        <Dropdown show={isOpen}>
            <Dropdown.Toggle
                variant='light'
                id='dropdown-basic'
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onToggle()
                }}
            >
                <BsFilter />
            </Dropdown.Toggle>

            <Dropdown.Menu onClick={(e) => e.stopPropagation()}>
                <Dropdown.Header>{title}</Dropdown.Header>
                {options.map((option) => (
                    <Dropdown.Item
                        key={option}
                        as='div'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Form.Check
                            type='checkbox'
                            label={option}
                            checked={selectedOptions.includes(option)}
                            onChange={(e) => handleCheckboxChange(option, e)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default CheckboxFilterDropdown
