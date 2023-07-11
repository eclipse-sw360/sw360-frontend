// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { memo } from 'react'
import Table from '../Table/Table'


interface Props {
    data: any
    columns: any
}

const compare = (preState: any, nextState: any) => {
    return Object.entries(preState.data).sort().toString() === Object.entries(nextState.data).sort().toString()
}

const ModeratorsTable = memo(function ModeratorsTable({ columns, data }: Props) {
    return <Table columns={columns} data={data} />
}, compare)

export default ModeratorsTable
