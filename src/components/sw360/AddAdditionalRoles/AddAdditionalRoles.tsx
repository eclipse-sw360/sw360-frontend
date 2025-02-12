// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { DocumentTypes, InputKeyValue, RolesType } from '@/object-types'
import { CommonUtils } from '@/utils'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { MdDeleteOutline } from 'react-icons/md'

interface Props {
    documentType?: string
    setDataInputList?: RolesType
    setInputList?: React.Dispatch<React.SetStateAction<InputKeyValue[]>>
    inputList?: InputKeyValue[]
}

function AddAdditionalRoles({
    documentType,
    setDataInputList,
    inputList: propInputList,
    setInputList: propSetInputList,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const [inputListData, setInputListData] = useState<InputKeyValue[]>([])
    useEffect(()=>{
        setInputListData(!CommonUtils.isNullOrUndefined(propInputList) ? propInputList : [
            {
                key: documentType === DocumentTypes.COMPONENT ? 'Committer' : 'Stakeholder',
                value: '',
            },
        ]);
    },[propInputList])
    const setInputData = propSetInputList || setInputListData


    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>, index: number) => {
        const { name, value } = e.target
        const list: InputKeyValue[] = [...inputListData]
        list[index][name as keyof InputKeyValue] = value
        setInputData(list)
        if (setDataInputList) {
            setDataInputList(list)
        }
    }

    const handleRemoveClick = (index: number) => {
        const list = [...inputListData]
        list.splice(index, 1)
        setInputData(list)
        if (setDataInputList) {
            setDataInputList(list)
        }
    }

    const handleAddClick = () => {
        documentType === DocumentTypes.COMPONENT
            ? setInputData([...inputListData, { key: 'Committer', value: '' }])
            : setInputData([...inputListData, { key: 'Stakeholder', value: '' }])
    }

    const defaultValue = () => {
        return documentType === DocumentTypes.COMPONENT ? 'Committer' : 'Stakeholder'
    }

    return (
        <>
            <div className='section-header mb-2'>
                <span className='fw-bold'>{t('Additional Roles')}</span>
            </div>
            <div className='row'>
                {inputListData.map((elem, j) => {
                        return (
                            <div className='row mb-2' key={j}>
                                <div className='col-lg-5'>
                                    <select
                                        className='form-select'
                                        key=''
                                        name='key'
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
                                                <option value='EndUser'>{t('End User')}</option>
                                                <option value='QualityManager'>{t('Quality Manager')}</option>
                                                <option value='TestManager'>{t('Test Manager')}</option>
                                                <option value='TechnicalWriter'>{t('Technical Writer')}</option>
                                                <option value='KeyUser'>{t('Key User')}</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className='col-lg-5'>
                                    <input
                                        name='value'
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

export default AddAdditionalRoles
