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
import LicensesTable from './OtherLicensesTable'
import { LicensesType } from '@/object-types/LicensesType'
import Licenses from '@/object-types/Licenses'

interface Props {
    licenseDatas?: any[]
    setLicenses?: LicensesType
    fullnames?: any[]
}

const SelectTableOtherLicenses = ({ licenseDatas, setLicenses, fullnames }: Props) => {
    const handlerRadioButton = (item: any) => {
        if (fullnames.includes(item)) {
            const index = fullnames.indexOf(item)
            fullnames.splice(index, 1)
        } else {
            fullnames.push(item)
        }
        const fullNameLicenses: string[] = []
        const licensesId: string[] = []
        fullnames.forEach((item) => {
            fullNameLicenses.push(item.fullName)
            licensesId.push(handleId(item._links.self.href))
        })
        const licensesName: string = fullNameLicenses.join(' , ')
        const licensesResponse: Licenses = {
            fullName: licensesName,
            id: licensesId,
        }
        setLicenses(licensesResponse)
    }

    const handleId = (id: string): string => {
        return id.split('/').at(-1)
    }

    const columns = [
        {
            id: 'licenseId',
            name: '',
            formatter: (item: string) =>
                _(
                    <Form.Check
                        name='licenseId'
                        type='checkbox'
                        onClick={() => {
                            handlerRadioButton(item)
                        }}
                    ></Form.Check>
                ),
            width: '5%',
        },
        {
            id: 'fullName',
            name: 'FullName',
            sort: true,
            width: '95%',
        },
    ]

    return (
        <>
            <div className='row'>
                <LicensesTable data={licenseDatas} columns={columns} />
            </div>
        </>
    )
}

export default React.memo(SelectTableOtherLicenses)
