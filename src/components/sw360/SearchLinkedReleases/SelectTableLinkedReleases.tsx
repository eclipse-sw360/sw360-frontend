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
import LinkedRelease from '@/object-types/LinkedRelease'
import LinkedReleasesTable from './LinkedReleasesTable'

interface Props {
    releases?: any[]
    setLinkedReleases?: any
    linkedReleases?: LinkedRelease[]
}

const SelectTableLinkedReleases = ({ releases, setLinkedReleases, linkedReleases }: Props) => {
    const handlerRadioButton = (item: any) => {
        if (linkedReleases.includes(item)) {
            const index = linkedReleases.indexOf(item)
            linkedReleases.splice(index, 1)
        } else {
            linkedReleases.push(item)
        }
        const releaseLinks: LinkedRelease[] = []
        linkedReleases.forEach((item: any) => {
            const releaseLink: LinkedRelease = {
                id: handleId(item._links.self.href),
                name: item.name,
                version: item.version,
                mainlineState: item.mainlineState,
                clearingState: item.clearingState,
                vendor: item.vendor ? item.vendor.fullName : "",
                releaseRelationship: "CONTAINED",
            }
            releaseLinks.push(releaseLink)
        })
        setLinkedReleases(releaseLinks)
    }

    const handleId = (id: string): string => {
        return id.split('/').at(-1)
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
            name: 'Vendor',
            sort: true,
        },
        {
            name: 'Component Name',
            sort: true,
        },
        {
            name: 'Release Version',
            sort: true,
        },
        {
            name: 'Clearing State',
            sort: true,
        },
        {
            name: 'Mainline State',
            sort: true,
        },
    ]

    return (
        <>
            <div className='row'>
                <LinkedReleasesTable data={releases} columns={columns} />
            </div>
        </>
    )
}

export default React.memo(SelectTableLinkedReleases)