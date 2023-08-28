// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Form } from 'react-bootstrap'
import React from 'react'
import { _ } from '@/components/sw360'
import ModeratorsTable from './ContributorsTable'
import Moderators from '@/object-types/Moderators'
import { ModeratorsType } from '@/object-types/ModeratorsType'

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
            name: 'GivenName',
            width: '14%',
            sort: true,
        },
        {
            name: 'LastName',
            sort: true,
            width: '14%',
        },
        {
            name: 'Email',
            sort: true,
            width: '40%',
        },
        {
            name: 'Department',
            sort: true,
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
