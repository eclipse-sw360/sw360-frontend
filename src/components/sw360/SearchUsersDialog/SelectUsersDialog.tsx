// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useState, useRef } from 'react'
import { Button, Modal } from 'react-bootstrap'

import { HttpStatus, User, Embedded } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import UsersTable from './UsersTable'
import MessageService from '@/services/message.service'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedUsers: (users: { [k: string]: string }) => void
    selectedUsers: { [k: string]: string }
    multiple: boolean
}

type EmbeddedUsers = Embedded<User, 'sw360:users'>

type RowData = (string | User)[]

const SelectUsersDialog = ({ show, setShow, setSelectedUsers, selectedUsers, multiple = false}: Props) : JSX.Element => {
    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<RowData>>([])
    const [selectingUsers, setSelectingUsers] = useState({})
    const searchText = useRef<string>('')

    const handleCloseDialog = () => {
        setShow(!show)
        setSelectingUsers(selectedUsers)
    }

    const searchUsers= async () => {
        const session = await getSession()
        const queryUrl = CommonUtils.createUrlWithParams(`users`, { email: searchText.current })
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }
        const response = await ApiUtils.GET(queryUrl, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return
        }

        const users = await response.json() as EmbeddedUsers
        if (
            !CommonUtils.isNullOrUndefined(users['_embedded']) &&
            !CommonUtils.isNullOrUndefined(users['_embedded']['sw360:users'])
        ) {
            const data = users['_embedded']['sw360:users'].map((user: User) => [
                user,
                user.givenName ?? '',
                user.lastName ?? '',
                user.email,
                user.department ?? '',
            ])
            setTableData(data)
        }
        setSelectingUsers(selectedUsers)
    }

    const handleClickSelectUsers = () => {
        setShow(!show)
        setSelectedUsers(selectingUsers)
    }

    const resetSelection = () => {
        // TODO: specifications are unclear
    }

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>{t('Search Users')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='row'>
                    <div className='col-lg-8'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={t('Enter search text')}
                            aria-describedby='Search Users'
                            onChange={(event) => {searchText.current = event.target.value }}
                        />
                    </div>
                    <div className='col-lg-4'>
                        <button type='button' className='btn btn-secondary me-2' onClick={() => void searchUsers()}>
                            {t('Search')}
                        </button>
                        <button type='button' className='btn btn-secondary me-2' onClick={resetSelection}>
                            {t('Reset')}
                        </button>
                    </div>
                </div>
                <div className='mt-3'>
                    <UsersTable tableData={tableData} setSelectingUsers={setSelectingUsers} selectingUsers={selectingUsers} multiple={multiple}/>
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    data-bs-dismiss='modal'
                    variant='secondary'
                    className='me-2'
                    onClick={handleCloseDialog}
                >
                    {t('Close')}
                </Button>
                <Button type='button' className='btn btn-primary' onClick={handleClickSelectUsers}>
                    {t('Select User')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default SelectUsersDialog
