// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import TableLinkedObligations from './TableLinkedObligations/TableLinkedObligations'

interface Props {
    data?: Array<any>
}

const LinkedObligations = ({ data }: Props) => {

    return (
        <div className='col' style={{ fontSize: '0.875rem' }}>
            <div>
                <TableLinkedObligations
                    data={data}
                />
            </div>
        </div>
    )
}

export default LinkedObligations
