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
import { Table, _ } from '@/components/sw360'
import Vendor from '@/object-types/Vendor'
import { VendorType } from '@/object-types/VendorType'

interface Props {
    vendors: any[]
    setVendor: VendorType
}

const SelectTableVendor = ({ vendors, setVendor }: Props) => {
    // item._links.self.href
    const handlerRadioButton = (item: any) => {
        const vendorId: string = handleId(item._links.self.href)
        const vendorResponse: Vendor = {
            id: vendorId,
            fullName: item.fullName,
        }
        setVendor(vendorResponse)
    }

    const handleId = (id: string): string => {
        return id.split('/').at(-1)
    }

    const columns = [
        {
            name: '',
            formatter: (item: any) =>
                _(<Form.Check type='radio' name='VendorId' onChange={() => handlerRadioButton(item)}></Form.Check>),
        },
        {
            name: 'FullName',
            sort: true,
        },
        {
            name: 'ShortName',
            sort: true,
        },
        {
            name: 'URL',
            sort: true,
        },
    ]

    return (
        <>
            <div className='row'>
                <Table data={vendors} columns={columns} />
            </div>
        </>
    )
}

export default React.memo(SelectTableVendor)
