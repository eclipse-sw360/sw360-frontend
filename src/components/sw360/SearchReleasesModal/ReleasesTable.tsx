// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { useEffect, useRef, type JSX } from 'react';
import { Form } from 'react-bootstrap'
import { _ } from 'next-sw360'
import Table from '../Table/Table'
import { ReleaseDetail } from '@/object-types'
import { TableProps } from '../Table/Table'

interface Props {
    tableData: (string | ReleaseDetail)[][],
    selectingReleaseOnTable: Array<ReleaseDetail>
    setSelectingReleaseOnTable: React.Dispatch<React.SetStateAction<Array<ReleaseDetail>>>
}

const compare = (preState: TableProps, nextState: TableProps) => {
    return Object.entries(preState.data ?? {}).sort().toString() === Object.entries(nextState.data ?? {}).sort().toString()
}

const MemoTable = React.memo(Table, compare)

const ReleasesTable = ({ tableData, selectingReleaseOnTable, setSelectingReleaseOnTable }: Props) : JSX.Element => {
    const releases = useRef<Array<ReleaseDetail>>([])
    const noRecordsFoundString = { noRecordsFound: 'No releases found.' }
    const handleSelectRelease = (relDetail: ReleaseDetail) => {
        const selectingReleaseIds = releases.current.map(rel => rel.id)
        if (selectingReleaseIds.includes(relDetail.id)) {
            setSelectingReleaseOnTable(releases.current.filter(release => release.id !== relDetail.id))
            return
        }

        setSelectingReleaseOnTable([...releases.current, relDetail])
        return
    }

    const columns = [
        {
            id: 'release-selection',
            name: '',
            formatter: (release: ReleaseDetail) =>
                _(
                    <Form.Check
                        name='release-selection'
                        className='release-selection'
                        type= 'checkbox'
                        onClick={() => {
                            handleSelectRelease(release)
                        }}
                    ></Form.Check>
                ),
            width: '6%',
            sort: false,
        },
        {
            id: 'vendorName',
            name: 'Vendor',
            sort: true,
        },
        {
            id: 'componentName',
            name: 'Component Name',
            formatter: (release: ReleaseDetail) =>
                _(<a href={`/components/detail/${release._links['sw360:component'].href.split('/').at(-1)}`}>{release.name}</a>),
            sort: {
                compare: (release1: ReleaseDetail, release2: ReleaseDetail) => release1.name.localeCompare(release2.name)
            },
        },
        {
            id: 'releaseVersion',
            name: 'Release Version',
            formatter: (release: ReleaseDetail) =>
                _(<a href={`/components/releases/detail/${release.id}`}>{release.version}</a>),
            sort: {
                compare: (release1: ReleaseDetail, release2: ReleaseDetail) => release1.version.localeCompare(release2.version)
            },
        },
        {
            id: 'clearingState',
            name: 'Clearing State',
            sort: true,
        },
        {
            id: 'mainlineState',
            name: 'Mainline State',
            sort: true,
        },
    ]

    useEffect(() => {
        releases.current = selectingReleaseOnTable
    }, [selectingReleaseOnTable])

    return (
        <div className='row'>
            <MemoTable data={tableData} columns={columns} sort={false} pagination={false} language={noRecordsFoundString} />
        </div>
    )
}

export default ReleasesTable
