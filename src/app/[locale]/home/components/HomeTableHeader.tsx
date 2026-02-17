// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ReactNode, useState } from 'react'
import { Button, Dropdown, Form } from 'react-bootstrap'
import { BsArrowRepeat } from 'react-icons/bs'

interface HomeTableHeaderProps {
    title: string
    setReload: React.Dispatch<React.SetStateAction<boolean>>
    roles?: string[]
    setRoles?: React.Dispatch<React.SetStateAction<string[]>>
    clearingStates?: string[]
    setClearingStates?: React.Dispatch<React.SetStateAction<string[]>>
    onSearch?: () => void
}

const ROLE_OPTIONS = [
    {
        key: 'createdBy',
        labelKey: 'Creator',
    },
    {
        key: 'moderator',
        labelKey: 'Moderator',
    },
    {
        key: 'contributor',
        labelKey: 'Contributor',
    },
    {
        key: 'projectOwner',
        labelKey: 'Project Owner',
    },
    {
        key: 'leadArchitect',
        labelKey: 'Lead Architect',
    },
    {
        key: 'projectResponsible',
        labelKey: 'Project Responsible',
    },
    {
        key: 'securityResponsible',
        labelKey: 'Security Responsible',
    },
]

const CLEARING_STATE_OPTIONS = [
    {
        key: 'stateOpen',
        labelKey: 'Open',
    },
    {
        key: 'stateClosed',
        labelKey: 'Closed',
    },
    {
        key: 'stateInProgress',
        labelKey: 'In Progress',
    },
]

function HomeTableHeader({
    title = '',
    setReload,
    roles,
    setRoles,
    clearingStates,
    setClearingStates,
    onSearch,
}: HomeTableHeaderProps): ReactNode {
    const t = useTranslations('default')
    const [showDropdown, setShowDropdown] = useState(false)
    const hasFilters = roles !== undefined && setRoles !== undefined

    const handleRoleChange = (key: string, checked: boolean) => {
        if (!setRoles || !roles) return
        if (checked) {
            setRoles([
                ...roles,
                key,
            ])
        } else {
            setRoles(roles.filter((r) => r !== key))
        }
    }

    const handleClearingStateChange = (key: string, checked: boolean) => {
        if (!setClearingStates || !clearingStates) return
        if (checked) {
            setClearingStates([
                ...clearingStates,
                key,
            ])
        } else {
            setClearingStates(clearingStates.filter((s) => s !== key))
        }
    }

    const handleSearch = () => {
        setShowDropdown(false)
        onSearch?.()
    }

    return (
        <>
            <div className='tableHeader'>
                <h1 className='tableHeaderTitle'>
                    {title}
                    {hasFilters && (
                        <Dropdown
                            show={showDropdown}
                            onToggle={(isOpen) => setShowDropdown(isOpen)}
                            autoClose={false}
                            className='d-inline-block ms-2'
                        >
                            <Dropdown.Toggle
                                variant='link'
                                className='tableHeaderFilterToggle'
                            />
                            <Dropdown.Menu className='tableHeaderFilterMenu'>
                                <div className='fw-bold mb-2'>{t('Role In Project')}</div>
                                {ROLE_OPTIONS.map((option) => (
                                    <Form.Check
                                        key={option.key}
                                        type='checkbox'
                                        id={`role-${option.key}`}
                                        label={t(option.labelKey)}
                                        checked={roles?.includes(option.key) ?? false}
                                        onChange={(e) => handleRoleChange(option.key, e.target.checked)}
                                        className='mb-1'
                                    />
                                ))}
                                <hr className='my-2' />
                                <div className='fw-bold mb-2'>{t('Clearing State')}</div>
                                {CLEARING_STATE_OPTIONS.map((option) => (
                                    <Form.Check
                                        key={option.key}
                                        type='checkbox'
                                        id={`clearing-${option.key}`}
                                        label={t(option.labelKey)}
                                        checked={clearingStates?.includes(option.key) ?? false}
                                        onChange={(e) => handleClearingStateChange(option.key, e.target.checked)}
                                        className='mb-1'
                                    />
                                ))}
                                <hr className='my-2' />
                                <div className='text-center'>
                                    <Button
                                        variant='warning'
                                        size='sm'
                                        onClick={handleSearch}
                                    >
                                        {t('Search')}
                                    </Button>
                                </div>
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                </h1>
                <a
                    className='tableReloadButton'
                    onClick={() => {
                        setReload((prevState) => !prevState)
                    }}
                >
                    <BsArrowRepeat size={20} />
                </a>
            </div>
            <hr></hr>
        </>
    )
}

export default HomeTableHeader
