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

import { ComponentOwner, ComponentOwnerType } from '@/object-types'
import { Table, _ } from 'next-sw360'

interface Props {
    users: any[]
    setComponentOwner: ComponentOwnerType
}

const SelectTableComponentOwner = ({ users, setComponentOwner }: Props) => {
    const handlerRadioButton = (item: any) => {
        const fullName = item.givenName.concat(' ').concat(item.lastName)
        const componentOwnerResponse: ComponentOwner = {
            fullName: fullName,
            email: item.email,
        }
        setComponentOwner(componentOwnerResponse)
    }

    const columns = [
        {
            id: 'userId',
            name: '',
            formatter: (item: any) =>
                _(<Form.Check type='radio' name='VendorId' onChange={() => handlerRadioButton(item)}></Form.Check>),
        },
        {
            id: 'FullName',
            name: 'FullName',
            sort: true,
        },
        {
            id: 'ShortName',
            name: 'ShortName',
            sort: true,
        },
        {
            id: 'URL',
            name: 'URL',
            sort: true,
        },
    ]

    return (
        <>
            <div className='row'>
                <Table data={users} columns={columns} />
            </div>
        </>
    )
}

export default React.memo(SelectTableComponentOwner)
