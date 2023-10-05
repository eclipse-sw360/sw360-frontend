// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { useState } from 'react'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import { RolesType } from '@/object-types/RolesType'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { MdDeleteOutline } from 'react-icons/md'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

interface Props {
    documentType?: string
    setRoles?: RolesType
}

interface Input {
    key: string
    value: string
}

export default function AddAdditionalRolesComponent({ documentType, setRoles }: Props) {
    const t = useTranslations(COMMON_NAMESPACE)
    const [inputList, setInputList] = useState<Input[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>, index: number) => {
        const { name, value } = e.target
        const list: Input[] = [...inputList]
        list[index][name as keyof Input] = value
        setInputList(list)
        if (setRoles) setRoles(list)
    }

    const handleRemoveClick = (index: number) => {
        const list = [...inputList]
        list.splice(index, 1)
        setInputList(list)
    }

    const handleAddClick = () => {
        documentType === DocumentTypes.COMPONENT
            ? setInputList([...inputList, { key: 'Committer', value: '' }])
            : setInputList([...inputList, { key: 'Stakeholder', value: '' }])
    }

    const defaultValue = () => {
        return documentType === DocumentTypes.COMPONENT ? 'Commiter' : 'Stakeholder'
    }

    return (
        <>
            <h6 className='header pb-2 px-2'>{t('Additional Roles')}</h6>
            <div className='row'>
                {inputList.map((elem, j) => {
                    return (
                        <div className='row mb-2' key=''>
                            <div className='col-lg-5'>
                                <select
                                    className='form-select'
                                    key=''
                                    name='role'
                                    value={elem.key}
                                    aria-label={t('Additional Role')}
                                    defaultValue={defaultValue()}
                                    onChange={(e) => handleInputChange(e, j)}
                                >
                                    {documentType === DocumentTypes.COMPONENT ? (
                                        <>
                                            <option value='Committer'>{t('Committer')}</option>
                                            <option value='Contributor'>{t('Contributor')}</option>
                                            <option value='Expert'>{t('Expert')}</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value='Stakeholder'>{t('Stakeholder')}</option>
                                            <option value='Analyst'>{t('Analyst')}</option>
                                            <option value='Contributor'>{t('Contributor')}</option>
                                            <option value='Accountant'>{t('Accountant')}</option>
                                            <option value='End User'>{t('End User')}</option>
                                            <option value='Quality Manager'>{t('Quality Manager')}</option>
                                            <option value='Test Manager'>{t('Test Manager')}</option>
                                            <option value='Technical writer'>{t('Technical writer')}</option>
                                            <option value='Key User'>{t('Key User')}</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className='col-lg-5'>
                                <input
                                    name='email'
                                    value={elem.value}
                                    type='email'
                                    onChange={(e) => handleInputChange(e, j)}
                                    className='form-control'
                                    placeholder={t('Enter email')}
                                    aria-describedby={t('Email')}
                                />
                            </div>
                            <div className='col-lg-2'>
                                <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                    <span className='d-inline-block'>
                                        <MdDeleteOutline
                                            size={25}
                                            className='ms-2 btn-icon'
                                            onClick={() => handleRemoveClick(j)}
                                        />
                                    </span>
                                </OverlayTrigger>
                            </div>
                        </div>
                    )
                })}
                <div className='col-lg-4'>
                    <button type='button' onClick={() => handleAddClick()} className='btn btn-secondary'>
                        {t('Click to add row to Additional Roles')}
                    </button>
                </div>
            </div>
        </>
    )
}
