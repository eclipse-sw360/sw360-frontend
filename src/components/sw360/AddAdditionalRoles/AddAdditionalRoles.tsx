// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useState } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BsFillTrashFill } from 'react-icons/bs'
import { useConfigValue } from '@/contexts'
import { DocumentTypes, InputKeyValue, RolesType, UIConfigKeys } from '@/object-types'
import { CommonUtils } from '@/utils'
import DeleteItemWarning from '../DeleteItemWarning/DeleteItemWarning'

interface Props {
    documentType?: string
    setDataInputList?: RolesType
    setInputList?: (list: InputKeyValue[]) => void
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
    const [isDeleteItem, setIsDeleteItem] = useState<boolean>(false)
    const [currentIndex, setCurrentIndex] = useState<number>(-1)
    const { status } = useSession()

    // Configs from backend
    const projectAdditionalRoles =
        useConfigValue(UIConfigKeys.UI_CUSTOMMAP_PROJECT_ROLES) !== null
            ? (useConfigValue(UIConfigKeys.UI_CUSTOMMAP_PROJECT_ROLES) as string[])
            : [
                  'Stakeholder',
                  'Analyst',
                  'Contributor',
                  'Accountant',
                  'End User',
                  'Quality Manager',
                  'Test Manager',
                  'Technical Writer',
                  'Key User',
              ]
    const componentAdditionalRoles =
        useConfigValue(UIConfigKeys.UI_CUSTOMMAP_COMPONENT_ROLES) !== null
            ? (useConfigValue(UIConfigKeys.UI_CUSTOMMAP_COMPONENT_ROLES) as string[])
            : [
                  'Committer',
                  'Contributor',
                  'Expert',
              ]
    const releaseAdditionalRoles =
        useConfigValue(UIConfigKeys.UI_CUSTOMMAP_RELEASE_ROLES) !== null
            ? (useConfigValue(UIConfigKeys.UI_CUSTOMMAP_RELEASE_ROLES) as string[])
            : [
                  'Committer',
                  'Contributor',
                  'Expert',
              ]

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        setInputListData(
            !CommonUtils.isNullOrUndefined(propInputList)
                ? propInputList
                : [
                      {
                          key:
                              documentType === DocumentTypes.COMPONENT || documentType === DocumentTypes.RELEASE
                                  ? 'Committer'
                                  : 'Stakeholder',
                          value: '',
                      },
                  ],
        )
    }, [
        propInputList,
    ])
    const setInputData = propSetInputList || setInputListData

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>, index: number) => {
        const { name, value } = e.target
        const list: InputKeyValue[] = [
            ...inputListData,
        ]
        list[index][name as keyof InputKeyValue] = value
        setInputData(list)
        if (setDataInputList) {
            setDataInputList(list)
        }
    }

    const handleRemoveClick = (index: number) => {
        setCurrentIndex(index)
        setIsDeleteItem(true)
    }

    const handleAddClick = () => {
        if (documentType === DocumentTypes.COMPONENT || documentType === DocumentTypes.RELEASE) {
            setInputData([
                ...inputListData,
                {
                    key: 'Committer',
                    value: '',
                },
            ])
        } else {
            setInputData([
                ...inputListData,
                {
                    key: 'Stakeholder',
                    value: '',
                },
            ])
        }
    }

    const defaultValue = () => {
        return documentType === DocumentTypes.COMPONENT || documentType === DocumentTypes.RELEASE
            ? 'Committer'
            : 'Stakeholder'
    }

    return (
        <>
            <DeleteItemWarning
                isDeleteItem={isDeleteItem}
                setIsDeleteItem={setIsDeleteItem}
                inputList={inputListData}
                setInputList={setInputListData}
                index={currentIndex}
                setDataInputList={setDataInputList}
            />
            <div className='section-header mb-2'>
                <span className='fw-bold'>{t('Additional Roles')}</span>
            </div>
            <div className='row'>
                {inputListData.map((elem, j) => {
                    return (
                        <div
                            className='row mb-2'
                            key={j}
                        >
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
                                    {documentType === DocumentTypes.COMPONENT
                                        ? componentAdditionalRoles.map((value, key) => (
                                              <option
                                                  value={value}
                                                  selected={elem.key === value}
                                                  key={key}
                                              >
                                                  {value}
                                              </option>
                                          ))
                                        : documentType === DocumentTypes.RELEASE
                                          ? releaseAdditionalRoles.map((value, key) => (
                                                <option
                                                    value={value}
                                                    key={key}
                                                    selected={elem.key === value}
                                                >
                                                    {value}
                                                </option>
                                            ))
                                          : projectAdditionalRoles.map((value, key) => (
                                                <option
                                                    value={value}
                                                    selected={elem.key === value}
                                                    key={key}
                                                >
                                                    {value}
                                                </option>
                                            ))}
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
                                        <BsFillTrashFill
                                            size={20}
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
                    <button
                        type='button'
                        onClick={() => handleAddClick()}
                        className='btn btn-secondary'
                    >
                        {t('Click to add row to Additional Roles')}
                    </button>
                </div>
            </div>
        </>
    )
}

export default AddAdditionalRoles
