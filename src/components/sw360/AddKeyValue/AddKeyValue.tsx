// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import React from 'react'
import { useState } from 'react'
import { AddtionalDataType } from '@/object-types/AddtionalDataType'
import { MdDeleteOutline } from 'react-icons/md'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'


interface Props {
    header: string
    keyName: string
    setData?: AddtionalDataType
}

interface Input {
    key: string
    value: string
}

export default function AddKeyValueComponent(props: Props) {
    const [inputList, setInputList] = useState<Input[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { name, value } = e.target
        const list: Input[] = [...inputList]
        list[index][name as keyof Input] = value
        const map = new Map<string, string>()
        list.forEach((item) => {
            map.set(item.key, item.value)
        })
        setInputList(list)
        props.setData(map)
    }

    const handleRemoveClick = (index: number) => {
        const list = [...inputList]
        list.splice(index, 1)
        setInputList(list)
    }

    const handleAddClick = () => {
        setInputList([...inputList, { key: '', value: '' }])
    }

    return (
        <>
            <div className={`row header mb-2`}>
                <h6>{props.header}</h6>
            </div>
            <div className='row'>
                {inputList.map((elem, j) => {
                    return (
                        <div className='row mb-2' key={j}>
                            <div className='col-lg-6'>
                                <input
                                    name='key'
                                    value={elem.key}
                                    type='text'
                                    onChange={(e) => handleInputChange(e, j)}
                                    className='form-control'
                                    placeholder={`Enter ${props.keyName.toLowerCase()} key`}
                                    required
                                    aria-describedby={`${props.keyName.toLowerCase()} key`}
                                />
                            </div>
                            <div className='col-lg-5'>
                                <input
                                    name='value'
                                    value={elem.value}
                                    type='text'
                                    onChange={(e) => handleInputChange(e, j)}
                                    className='form-control'
                                    placeholder={`Enter ${props.keyName.toLowerCase()} value`}
                                    required
                                    aria-describedby={`${props.keyName.toLowerCase()} value`}
                                />
                            </div>
                            <div className='col-lg-1'>
                                <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                                    <span className="d-inline-block">
                                        < MdDeleteOutline size={25} className="ms-2 btn-icon" onClick={() => handleRemoveClick(j)} />
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
                        className="btn btn-secondary"
                    >{`Click to add row to ${props.keyName
                        .split(' ')
                        .map((elem) => elem[0].toUpperCase() + elem.substring(1))
                        .join(' ')}`}</button>
                </div>
            </div>
        </>
    )
}
