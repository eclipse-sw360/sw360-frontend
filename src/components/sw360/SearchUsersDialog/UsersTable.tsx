// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { useEffect, useRef } from 'react'
import { Form } from 'react-bootstrap'
import { _, Table } from 'next-sw360'
import { User } from '@/object-types'

interface Props {
    tableData: any[]
    setSelectingUsers: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    selectingUsers: { [k: string]: string }
    multiple: boolean
}

const compare = (preState: any, nextState: any) => {
    return Object.entries(preState.data).sort().toString() === Object.entries(nextState.data).sort().toString()
}

const MemoTable = React.memo(Table, compare) 

const UsersTable = ({ tableData, selectingUsers, setSelectingUsers, multiple }: Props) => {
    const selectedUsersInTable = useRef<{ [k: string]: string }>({})

    const handleSelectUser = (user: User) => {
        const userEmail = user.email 
        if (multiple === true) {
            const copiedSelectingUsers = { ...selectedUsersInTable.current }
            if (Object.keys(copiedSelectingUsers).includes(userEmail)) {
                delete copiedSelectingUsers[userEmail]
            } else {
                copiedSelectingUsers[userEmail] = user.fullName
            }
            selectedUsersInTable.current = copiedSelectingUsers
            setSelectingUsers(selectedUsersInTable.current)
        } else {
            selectedUsersInTable.current = { [userEmail]: user.fullName }
            setSelectingUsers(selectedUsersInTable.current)
        }
    }

    const columns = [
        {
            id: 'user-selection',
            name: '',
            formatter: (user: User) =>
                _(
                    <Form.Check
                        name='user-selection'
                        type= { multiple ? 'checkbox' : 'radio' }
                        defaultChecked={Object.keys(selectedUsersInTable.current).includes(user.email)}
                        onClick={() => {
                            handleSelectUser(user)
                        }}
                    ></Form.Check>
                ),
            width: '7%',
            sort: false,
        },
        {
            id: 'givenName',
            name: 'Given Name',
            width: '15%',
            sort: true,
        },
        {
            id: 'lastName',
            name: 'Last Name',
            sort: true,
            width: '15%',
        },
        {
            id: 'email',
            name: 'Email',
            formatter: (email: string) =>
                _(<a href={`mailto:${email}`}>{email}</a>),
            sort: true,
            width: '30%'
        },
        {
            id: 'department',
            name: 'Department',
            sort: true,
            width: '15%',
        },
    ]

    useEffect(() => {
        selectedUsersInTable.current = selectingUsers
    }, [selectingUsers])

    return (
        <div className='row'>
            <MemoTable data={tableData} columns={columns} sort={false}/>
        </div>
    )
}

export default UsersTable
