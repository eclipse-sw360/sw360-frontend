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

import { Vendor, VendorType } from '@/object-types'
import { CommonUtils } from '@/utils'
import { Table, _ } from 'next-sw360'

interface Props {
    vendors: any[]
    setVendor: VendorType
}

const SelectTableVendor = ({ vendors, setVendor }: Props) => {
    const handlerRadioButton = (item: Vendor) => {
        const vendorId: string = CommonUtils.getIdFromUrl(item._links.self.href)
        const vendorResponse: Vendor = {
            id: vendorId,
            fullName: item.fullName,
        }
        setVendor(vendorResponse)
    }

    const columns = [
        {
            id: 'vendorId',
            name: '',
            formatter: (item: any) =>
                _(<Form.Check type='radio' name='VendorId' onChange={() => handlerRadioButton(item)}></Form.Check>),
        },
        {
            id: 'fullName',
            name: 'FullName',
            sort: true,
        },
        {
            id: 'shortName',
            name: 'ShortName',
            sort: true,
        },
        {
            id: 'url',
            name: 'URL',
            sort: true,
        },
    ]

    return (
        <>
            <div className='row'>
                <Table data={vendors} columns={columns} sort={true} selector={true} />
            </div>
        </>
    )
}

export default React.memo(SelectTableVendor)
