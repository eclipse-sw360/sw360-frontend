// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReleaseDetail } from '@/object-types'
import { Table } from 'next-sw360'
import { memo, type JSX } from 'react'

interface Props {
    data: (string | ReleaseDetail)[][]
    columns: {
        id: string
        name: string
        formatter?: (item: ReleaseDetail) => JSX.ElementAttributesProperty
        width?: string
        sort?: boolean
    }[]
}

const compare = (preState: Props, nextState: Props) => {
    return Object.entries(preState.data).sort().toString() === Object.entries(nextState.data).sort().toString()
}

const LinkedReleasesTable = memo(function ModeratorsTable({ columns, data }: Props) {
    return (
        <Table
            columns={columns}
            data={data}
        />
    )
}, compare)

export default LinkedReleasesTable
