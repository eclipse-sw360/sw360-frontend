// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { type JSX } from 'react'
import { Form } from 'react-bootstrap'

import { ReleaseDetail, ReleaseLink } from '@/object-types'
import { CommonUtils } from '@/utils'
import { _ } from 'next-sw360'
import LinkedReleasesTable from './LinkedReleasesTable'

interface Props {
    releases: (string | ReleaseDetail)[][]
    setLinkedReleases: (releaseLink: ReleaseLink[]) => void
    linkedReleases: ReleaseDetail[]
}

const SelectTableLinkedReleases = ({ releases, setLinkedReleases, linkedReleases }: Props) => {
    const handlerRadioButton = (item: ReleaseDetail) => {
        if (linkedReleases.map((rel) => rel.id).includes(item.id)) {
            const index = linkedReleases.map((rel) => rel.id).indexOf(item.id)
            linkedReleases.splice(index, 1)
        } else {
            linkedReleases.push(item)
        }
        const releaseLinks: ReleaseLink[] = []
        linkedReleases.forEach((item: ReleaseDetail) => {
            const releaseLink: ReleaseLink = {
                id: CommonUtils.getIdFromUrl(item._links.self.href),
                name: item.name,
                version: item.version,
                mainlineState: item.mainlineState,
                clearingState: item.clearingState,
                vendor: item.vendor ? item.vendor.fullName : '',
                releaseRelationship: 'CONTAINED',
            }
            releaseLinks.push(releaseLink)
        })
        setLinkedReleases(releaseLinks)
    }

    const columns = [
        {
            id: 'releaseId',
            name: '',
            formatter: (item: ReleaseDetail): JSX.Element =>
                _(
                    <Form.Check
                        name='moderatorId'
                        type='checkbox'
                        onClick={() => {
                            handlerRadioButton(item)
                        }}
                    ></Form.Check>,
                ) as JSX.Element,
            width: '7%',
        },
        {
            id: 'Vendor',
            name: 'Vendor',
            sort: true,
        },
        {
            id: 'Component Name',
            name: 'Component Name',
            sort: true,
        },
        {
            id: 'Release Version',
            name: 'Release Version',
            sort: true,
        },
        {
            id: 'Clearing State',
            name: 'Clearing State',
            sort: true,
        },
        {
            id: 'Mainline State',
            name: 'Mainline State',
            sort: true,
        },
    ]

    return (
        <>
            <div className='row'>
                <LinkedReleasesTable
                    data={releases}
                    columns={columns}
                />
            </div>
        </>
    )
}

export default React.memo(SelectTableLinkedReleases)
