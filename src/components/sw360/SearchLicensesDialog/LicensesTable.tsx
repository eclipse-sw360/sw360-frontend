// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React from 'react'
import { Table } from 'next-sw360'
import { Form } from 'react-bootstrap'

import { LicenseDetail } from '@/object-types'
import { _ } from 'next-sw360'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
    licenseDatas?: any[]
    setLicenses?: (licenses: { [k: string]: string }) => void
    selectedLicenses?: { [k: string]: string }
}

const LicensesTable = ({ licenseDatas, setLicenses, selectedLicenses }: Props) => {

    const handleCheckbox = (item: LicenseDetail) => {
        const copiedLicenses = { ...selectedLicenses }
        const licenseId = item._links.self.href.split('/').at(-1) 
        if (Object.keys(copiedLicenses).includes(licenseId)) {
            delete copiedLicenses[licenseId]
        } else {
            copiedLicenses[licenseId] = item.fullName
        }
        setLicenses(copiedLicenses)
    }

    const columns = [
        {
            id: 'licenseId',
            name: '',
            formatter: (item: LicenseDetail) =>
                _(
                    <Form.Check
                        name='licenseId'
                        type='checkbox'
                        defaultChecked={Object.keys(selectedLicenses).includes(item._links.self.href.split('/').at(-1))}
                        onClick={() => {
                            handleCheckbox(item)
                        }}
                    ></Form.Check>
                ),
            width: '8%',
            sort: false,
        },
        {
            id: 'license',
            name: 'License',
            sort: true,
        },
    ]

    return (
        <div className='row'>
            <Table data={licenseDatas} columns={columns} sort={false}/>
        </div>
    )
}

export default LicensesTable
