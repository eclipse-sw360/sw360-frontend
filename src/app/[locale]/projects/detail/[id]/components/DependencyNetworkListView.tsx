// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import Link from 'next/link'
import React, { ChangeEvent, useEffect, useState, type JSX } from 'react'
import { ButtonGroup, Dropdown, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Form from 'react-bootstrap/Form'
import { FaPencilAlt } from 'react-icons/fa'
import { GoSingleSelect } from 'react-icons/go'
import styles from '../detail.module.css'
import ClearingStateBadge from './ClearingStateBadge'
import {
    projectClearingState,
    projectRelations,
    projectTypes,
    releaseClearingStates,
    releaseRelations,
    releaseTypes,
} from './LicenseClearingFilters'

interface ListViewData {
    isAccessible: boolean
    clearingState: string
    mainLicenses: string
    type: string
    projectMainlineState: string
    relation: string
    isRelease: boolean | string
    releaseMainlineState: string
    projectOrigin: string
    name: string
    releaseOrigin: string
    comment: string
    id: string
    projectState?: string
}

type RowData = (string | ListViewData | JSX.Element)[]

const upperCaseWithUnderscore = (text: string | undefined) => {
    return text !== undefined ? text.trim().toUpperCase().replace(/ /g, '_') : undefined
}

const nameFormatter = (name: string) => {
    if (name.length <= 40) return <>{name}</>

    return (
        <OverlayTrigger
            placement='bottom'
            overlay={<Tooltip>{name}</Tooltip>}
        >
            <span className='d-inline-block'>{name.slice(0, 40)}...</span>
        </OverlayTrigger>
    )
}

const includesIgnoreCase = (array: Array<string>, element: string) => {
    return array.some((item) => item.toLowerCase() === element.toLowerCase())
}

const filterOptions: { [k: string]: Array<string> } = {
    types: [...Object.values(releaseTypes), ...Object.values(projectTypes)],
    relations: [...Object.values(releaseRelations), ...Object.values(projectRelations)],
    states: [...Object.values(releaseClearingStates), ...Object.values(projectClearingState)],
}

const DependencyNetworkListView = ({ projectId }: { projectId: string }) => {
    const t = useTranslations('default')
    const [data, setData] = useState<Array<RowData> | undefined>(undefined)
    const [displayedData, setDisplayedData] = useState<Array<RowData> | undefined>(undefined)
    const [search, setSearch] = useState<{ keyword?: string | undefined } | undefined>({ keyword: '' })

    const [filters, setFilters] = useState<{ [k: string]: Array<string> }>(filterOptions)
    const language = { noRecordsFound: t('No linked releases or projects') }

    const updateFilters = (event: React.ChangeEvent<HTMLInputElement>) => {
        const filterName = event.target.name
        if (event.target.checked === true) {
            if (filters[filterName].length === filterOptions[filterName].length) {
                setFilters({
                    ...filters,
                    [filterName]: [event.target.value],
                })
            } else {
                setFilters({
                    ...filters,
                    [filterName]: [...filters[filterName], event.target.value],
                })
            }
        } else {
            if (filters[filterName].length === 1) {
                setFilters({
                    ...filters,
                    [filterName]: [...filterOptions[filterName]],
                })
            } else {
                setFilters({
                    ...filters,
                    [filterName]: [...filters[filterName].filter((el) => el != event.target.value)],
                })
            }
        }
    }

    const columns = [
        {
            id: 'licenseClearing.name',
            name: t('Name'),
            width: '12%',
            formatter: (data: ListViewData) =>
                _(
                    data.isRelease === 'true' ? (
                        <Link
                            key={data.id}
                            href={`/components/releases/detail/${data.id}`}
                            style={{ wordBreak: 'break-all' }}
                        >
                            {nameFormatter(data.name)}
                        </Link>
                    ) : (
                        <Link
                            key={data.id}
                            href={`/projects/detail/${data.id}`}
                            style={{ wordBreak: 'break-all' }}
                        >
                            {nameFormatter(data.name)}
                        </Link>
                    ),
                ),
            sort: {
                compare: (data1: ListViewData, data2: ListViewData) => data1.name.localeCompare(data2.name),
            },
        },
        {
            id: 'licenseClearing.type',
            name: _(
                <>
                    <OverlayTrigger overlay={<Tooltip>{t('Component Type Filter')}</Tooltip>}>
                        <span>{t('Type')} </span>
                    </OverlayTrigger>
                    <DropdownButton
                        as={ButtonGroup}
                        drop='down'
                        title={<GoSingleSelect />}
                        id='types-filter-dropdown-btn'
                        className={`${styles['dropdown-btn']}`}
                    >
                        <span className='px-3'>{t('Component Type')}</span>
                        <Dropdown.Divider />
                        {Object.values(releaseTypes).map((releaseType: string) => (
                            <span key={releaseType}>
                                <Form.Check
                                    className={`${styles.selection}`}
                                    type='checkbox'
                                    id={`type-${releaseType}`}
                                    value={releaseType}
                                    name='types'
                                    label={releaseType}
                                    defaultChecked={
                                        filters.types.length !== filterOptions.types.length &&
                                        filters.types.includes(releaseType)
                                    }
                                    onChange={updateFilters}
                                />
                            </span>
                        ))}
                    </DropdownButton>
                </>,
            ),
            width: '7%',
            sort: true,
        },
        {
            id: 'licenseClearing.projectPath',
            name: t('Project Path'),
            width: '11%',
            sort: true,
        },
        {
            id: 'licenseClearing.releasePath',
            name: t('Release Path'),
            width: '14%',
            sort: true,
        },
        {
            id: 'licenseClearing.relation',
            name: _(
                <>
                    <OverlayTrigger overlay={<Tooltip>{t('Release Relation Filter')}</Tooltip>}>
                        <span>{t('Relation')} </span>
                    </OverlayTrigger>
                    <DropdownButton
                        as={ButtonGroup}
                        drop='down'
                        title={<GoSingleSelect />}
                        id='relations-filter-dropdown-btn'
                        className={`${styles['dropdown-btn']}`}
                    >
                        <span className='px-3'>{t('Release Relation')}</span>
                        <Dropdown.Divider />
                        {Object.values(releaseRelations).map((relation: string) => (
                            <span key={relation}>
                                <Form.Check
                                    className={`${styles.selection}`}
                                    type='checkbox'
                                    id={`relation-${relation}`}
                                    value={relation}
                                    name='relations'
                                    label={relation}
                                    defaultChecked={
                                        filters.relations.length !== filterOptions.relations.length &&
                                        filters.relations.includes(relation)
                                    }
                                    onChange={updateFilters}
                                />
                            </span>
                        ))}
                    </DropdownButton>
                </>,
            ),
            width: '8%',
            sort: true,
        },
        {
            id: 'licenseClearing.mainLicenses',
            name: t('Main licenses'),
            width: '10%',
            formatter: (mainLicenses: string) =>
                _(
                    <>
                        {mainLicenses &&
                            mainLicenses
                                .split(',')
                                .map(
                                    (license): React.ReactNode => (
                                        <li
                                            key={license}
                                            style={{ display: 'inline' }}
                                        >
                                            <Link
                                                href={`/licenses/detail?id=${license}`}
                                                className='text-link'
                                            >
                                                {license}
                                            </Link>
                                        </li>
                                    ),
                                )
                                .reduce((prev, curr): React.ReactNode[] => [prev, ', ', curr])}
                    </>,
                ),
            sort: {
                compare: (mainLicenses1: string, mainLicenses2: string) => mainLicenses1.localeCompare(mainLicenses2),
            },
        },
        {
            id: 'licenseClearing.state',
            name: _(
                <>
                    <OverlayTrigger overlay={<Tooltip>{t('Release Clearing State Filter')}</Tooltip>}>
                        <span>{t('State')} </span>
                    </OverlayTrigger>
                    <DropdownButton
                        as={ButtonGroup}
                        drop='down'
                        title={<GoSingleSelect />}
                        id='states-filter-dropdown-btn'
                        className={`${styles['dropdown-btn']}`}
                    >
                        <span className='px-3'>{t('Release Clearing State')}</span>
                        <Dropdown.Divider />
                        {Object.values(releaseClearingStates).map((state: string) => (
                            <span key={state}>
                                <Form.Check
                                    className={`${styles.selection}`}
                                    type='checkbox'
                                    id={`state-${state}`}
                                    value={state}
                                    name='states'
                                    defaultChecked={
                                        filters.states.length !== filterOptions.states.length &&
                                        filters.states.includes(state)
                                    }
                                    label={state}
                                    onChange={updateFilters}
                                />
                            </span>
                        ))}
                    </DropdownButton>
                </>,
            ),
            width: '7%',
            formatter: (data: ListViewData) =>
                _(
                    <div className='text-center'>
                        <ClearingStateBadge
                            key={data.id}
                            isRelease={data.isRelease == 'true'}
                            clearingState={upperCaseWithUnderscore(data.clearingState) as string}
                            projectState={upperCaseWithUnderscore(data.projectState)}
                            t={t}
                        />
                    </div>,
                ),
            sort: {
                compare: (data1: ListViewData, data2: ListViewData) =>
                    data1.clearingState.localeCompare(data2.clearingState),
            },
        },
        {
            id: 'licenseClearing.releaseMainlineState',
            name: t('Release Mainline State'),
            width: '8%',
            sort: true,
        },
        {
            id: 'licenseClearing.projectMainlineState',
            name: t('Project Mainline State'),
            width: '8%',
            sort: true,
        },
        {
            id: 'licenseClearing.comment',
            name: t('Comment'),
            width: '10%',
            sort: true,
        },
        {
            id: 'licenseClearing.actions',
            name: t('Actions'),
            sort: false,
            width: '5%',
        },
    ]

    useEffect(() => {
        void (async () => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                MessageService.error(t('Session has expired'))
                return
            }
            try {
                const listViewResponse = await ApiUtils.GET(
                    `projects/network/${projectId}/listView`,
                    session.user.access_token,
                )

                const listViewData = (await listViewResponse.json()) as Array<ListViewData>
                const tableData = listViewData.map((data: ListViewData) => [
                    data,
                    data.type,
                    data.projectOrigin,
                    data.releaseOrigin ? data.releaseOrigin : '',
                    data.relation,
                    data.mainLicenses ? data.mainLicenses : '',
                    data,
                    data.releaseMainlineState ? data.releaseMainlineState : '',
                    data.projectMainlineState ? data.projectMainlineState : '',
                    data.comment ? data.comment : '',
                    _(
                        <div style={{ textAlign: 'center' }}>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <Link
                                    href={
                                        data.isRelease === 'true'
                                            ? `/components/editRelease/${data.id}`
                                            : `/projects/edit/${data.id}`
                                    }
                                    className='overlay-trigger'
                                >
                                    <FaPencilAlt className='btn-icon' />
                                </Link>
                            </OverlayTrigger>
                        </div>,
                    ) as JSX.Element,
                ])
                setData(tableData)
                filterData(tableData)
            } catch (e) {
                console.error(e)
            }
        })()
    }, [])

    const filterData = (data: Array<RowData>) => {
        const filteredData = data.filter(
            (item: RowData) =>
                includesIgnoreCase(filters.types, item[1] as string) &&
                includesIgnoreCase(filters.relations, item[4] as string) &&
                includesIgnoreCase(filters.states, (item[6] as ListViewData).clearingState),
        )

        setDisplayedData(filteredData)
    }

    useEffect(() => {
        if (data === undefined) return
        filterData(data)
    }, [filters])

    const doSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value === '' ? undefined : { keyword: event.target.value })
    }

    return (
        <>
            {displayedData ? (
                <div className='position-relative'>
                    <div className={`position-absolute ${styles['list-view-search-box']}`}>
                        <label className='d-inline-block'>Search:</label>
                        <Form.Control
                            className='d-inline-block list-view-search-input'
                            size='sm'
                            type='search'
                            onChange={doSearch}
                        />
                    </div>
                    <Table
                        columns={columns}
                        data={displayedData}
                        selector={true}
                        sort={false}
                        language={language}
                        search={search}
                    />
                </div>
            ) : (
                <div className='col-12 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </>
    )
}

const compare = (preState: { projectId: string }, nextState: { projectId: string }) => {
    return preState.projectId === nextState.projectId
}

export default React.memo(DependencyNetworkListView, compare)
