// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React from 'react'
import { Form } from 'react-bootstrap'

import { Moderators, ModeratorsType } from '@/object-types'
import { _ } from 'next-sw360'
import ModeratorsTable from './ContributorsTable'

interface Props {
    users?: any[]
    setModerator?: ModeratorsType
    emails?: any[]
}

const SelectTableContributors = ({ users, setModerator, emails }: Props) => {
    const handlerRadioButton = (item: any) => {
        if (emails.includes(item)) {
            const index = emails.indexOf(item)
            emails.splice(index, 1)
        } else {
            emails.push(item)
        }
        const fullNames: string[] = []
        const moderatorsEmail: string[] = []
        emails.forEach((item) => {
            fullNames.push(item.givenName.concat(' ').concat(item.lastName))
            moderatorsEmail.push(item.email)
        })
        const moderatorsName: string = fullNames.join(' , ')
        const moderatorsResponse: Moderators = {
            fullName: moderatorsName,
            emails: moderatorsEmail,
        }
        setModerator(moderatorsResponse)
    }

    const columns = [
        {
            id: 'moderatorId',
            name: '',
            formatter: (item: string) =>
                _(
                    <Form.Check
                        name='moderatorId'
                        type='checkbox'
                        onClick={() => {
                            handlerRadioButton(item)
                        }}
                    ></Form.Check>
                ),
            width: '7%',
        },
        {
            id: 'givenName',
            name: 'GivenName',
            width: '20%',
            sort: true,
        },
        {
            id: 'lastName',
            name: 'LastName',
            sort: true,
            width: '20%',
        },
        {
            id: 'email',
            name: 'Email',
            sort: true,
            width: '30%',
        },
        {
            id: 'department',
            name: 'Department',
            sort: true,
            width: '20%',
        },
    ]

    return (
        <>
            <div className='row'>
                <ModeratorsTable data={users} columns={columns} />
            </div>
        </>
    )
}

export default React.memo(SelectTableContributors)
