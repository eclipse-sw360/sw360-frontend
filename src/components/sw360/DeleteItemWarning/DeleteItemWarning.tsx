// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { AddtionalDataType, RolesType } from '@/object-types'
import MessageService from '@/services/message.service'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { useEffect, type JSX } from 'react'
import { Modal } from 'react-bootstrap'
import { FaRegQuestionCircle } from 'react-icons/fa'

interface Input {
    key: string
    value: string
}

interface Props {
    isDeleteItem: boolean
    setIsDeleteItem: React.Dispatch<React.SetStateAction<boolean>>
    inputList: Input[]
    setInputList: React.Dispatch<React.SetStateAction<Input[]>>
    index: number
    setData?: React.Dispatch<React.SetStateAction<Input[]>>
    setObject?: AddtionalDataType
    setDataInputList?: RolesType
}

const DeleteItemWarning = ({
    isDeleteItem,
    setIsDeleteItem,
    inputList,
    setInputList,
    index,
    setData,
    setObject,
    setDataInputList,
}: Props): JSX.Element => {
    const t = useTranslations('default')

    const deleteItem = () => {
        try {
            const list: Input[] = [...inputList]
            list.splice(index, 1)
            setInputList(list)
            if (setData) {
                setData(list)
            }
            if (setObject) {
                const map = new Map<string, string>()
                list.forEach((item) => {
                    map.set(item.key, item.value)
                })
                setObject(map)
            }
            if (setDataInputList) {
                setDataInputList(list)
            }
            setIsDeleteItem(false)
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    return (
        <Modal
            show={isDeleteItem}
            onHide={() => setIsDeleteItem(false)}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header
                closeButton
                style={{ color: 'red' }}
            >
                <Modal.Title>
                    <FaRegQuestionCircle /> {t('Delete Item')} ?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{t('Do you really want to delete this item')}</p>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <button
                    className='btn close-btn btn-light'
                    onClick={() => setIsDeleteItem(false)}
                >
                    {t('Close')}
                </button>
                <button
                    className='btn btn-danger'
                    id='submit'
                    onClick={() => deleteItem()}
                >
                    {t('Delete Item')}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteItemWarning
