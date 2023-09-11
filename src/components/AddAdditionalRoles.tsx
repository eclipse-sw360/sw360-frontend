// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import styles from '@/css/AddKeyValue.module.css'
import { FaTrashAlt } from 'react-icons/fa'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import { RolesType } from '@/object-types/RolesType'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import InputKeyValue from '@/object-types/InputKeyValue'

interface Props {
    documentType?: string
    setDataRoles?: RolesType
    setRoles?: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    roles?: InputKeyValue[]
}

export default function AddAdditionalRolesComponent({ documentType, setDataRoles, roles, setRoles }: Props) {
    const t = useTranslations(COMMON_NAMESPACE)

    const handleInputKeyValueChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>, index: number) => {
        const { name, value } = e.target
        const list: InputKeyValue[] = [...roles]
        list[index][name as keyof InputKeyValue] = value
        setRoles(list)
        setDataRoles(list)
    }

    const handleRemoveClick = (index: number) => {
        const list = [...roles]
        list.splice(index, 1)
        setRoles(list)
        setDataRoles(list)
    }

    const handleAddClick = () => {
        documentType === DocumentTypes.COMPONENT
            ? setRoles([...roles, { key: 'Committer', value: '' }])
            : setRoles([...roles, { key: 'Stakeholder', value: '' }])
    }

    const defaultValue = () => {
        return documentType === DocumentTypes.COMPONENT ? 'Commiter' : 'Stakeholder'
    }

    return (
        <>
            <div className={`${styles['header']} mb-2`}>
                <p className='fw-bold mt-3'>{t('Additional Roles')}</p>
            </div>
            <div className='row'>
                {roles?.map((elem, index) => {
                    return (
                        <div className='row mb-2' key={index}>
                            <div className='col-lg-5'>
                                <select
                                    className='form-select'
                                    key=''
                                    name='key'
                                    value={elem.key}
                                    aria-label='additional role'
                                    defaultValue={defaultValue()}
                                    onChange={(e) => handleInputKeyValueChange(e, index)}
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
                                    name='value'
                                    value={elem.value}
                                    type='email'
                                    onChange={(e) => handleInputKeyValueChange(e, index)}
                                    className='form-control'
                                    placeholder={`Enter email`}
                                    aria-describedby={`Email`}
                                />
                            </div>
                            <div className='col-lg-2'>
                                <FaTrashAlt
                                    className='btn-icon bi bi-trash3-fill'
                                    onClick={() => handleRemoveClick(index)}
                                />
                            </div>
                        </div>
                    )
                })}
                <div className='col-lg-4'>
                    <button type='button' onClick={() => handleAddClick()} className={`fw-bold btn btn-secondary`}>
                        {t('Click to add row to Additional Roles')}
                    </button>
                </div>
            </div>
        </>
    )
}
