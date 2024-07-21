// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { _, TreeTable, EnumValueWithToolTip } from 'next-sw360'
import React, { useEffect, useState, useRef, useCallback, ChangeEvent } from 'react'
import { Tooltip, OverlayTrigger, ButtonGroup, Dropdown, DropdownButton, Spinner } from 'react-bootstrap'
import { GoSingleSelect } from 'react-icons/go'
import Form from 'react-bootstrap/Form'
import styles from '../detail.module.css'
import Link from 'next/link'
import { FaPencilAlt, FaSort } from 'react-icons/fa'
import { Attachment, Embedded, NodeData } from '@/object-types'
import ClearingStateBadge from './ClearingStateBadge'
import Alert from 'react-bootstrap/Alert'
import {
    releaseTypes, projectTypes,
    releaseRelations, projectRelations,
    releaseClearingStates, projectClearingState
} from './LicenseClearingFilters'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession } from 'next-auth/react'
import TogglerLicenseList from './TogglerLicenseList'

interface Props {
    projectId: string
}

interface ReleaseClearingState {
    id: string
    index?: number
    vendor?: string
    name?: string
    version?: string
    longName?: string
    releaseRelationship?: string
    mainlineState?: string
    hasSubreleases?: boolean
    clearingState?: string
    attachments?: null | Array<Attachment>
    componentType?: string
    licenseIds?: null | Array<string>
    comment?: string
    otherLicenseIds?: null | Array<string>
    accessible?: boolean
    projectId?: string
    releaseMainLineState?: string
    linkedReleases?: Array<ReleaseClearingState>
    ref?: ReleaseClearingState
    isExpanded?: boolean
}

interface ProjectClearingState {
    id: string
    name?: string
    relation?: string
    version?: string
    projectType?: string
    state?: string
    clearingState?: string
    subprojects?: Array<ProjectClearingState>
    linkedReleases?: Array<ReleaseClearingState>
    ref?: ProjectClearingState
    isExpanded?: boolean
}

type ClearingState = ReleaseClearingState & ProjectClearingState

type EmbeddedReleaseLinks = Embedded<ReleaseClearingState, 'sw360:releaseLinks'>

const filterOptions: { [k: string]: Array<string> } = {
    types: [...Object.keys(releaseTypes), ...Object.keys(projectTypes)],
    relations: [...Object.keys(releaseRelations), ...Object.keys(projectRelations)],
    states: [...Object.keys(releaseClearingStates), ...Object.keys(projectClearingState)],
}

const nameFormatter = (name: string) => {
    if (name.length <= 40)
        return <>{name}</>

    return (
        <OverlayTrigger placement='right-end' overlay={<Tooltip>{name}</Tooltip>}>
            <span className='d-inline-block'>
                {name.slice(0, 40)}...
            </span>
        </OverlayTrigger>
    )
}

const DependencyNetworkTreeView = ({ projectId }: Props) => {
    const t = useTranslations('default')
    const [filters, setFilters] = useState<{ [k: string]: Array<string> }>(filterOptions)
    const [sortOption, setSortOption] = useState(undefined)
    const language = { noRecordsFound: t('No linked releases or projects') }
    const [isExpandedAllMessageShow, setIsExpandedAllMessageShow] = useState(false)
    const [search, setSearch] = useState({ keyword: '' })
    const hasExpanded = useRef(false)

    const [data, setData] = useState<ProjectClearingState>(undefined)

    const [treeData, setTreeData] = useState([])

    const [noOfLinkedResources, setNoOfLinkedResources] = useState({
        releases: 0,
        projects: 0
    })

    const updateFilters = (event: React.ChangeEvent<HTMLInputElement>) => {
        const filterName = event.target.name
        if (event.target.checked == true) {
            if (filters[filterName].length === filterOptions[filterName].length) {
                setFilters({
                    ...filterOptions,
                    [filterName]: [event.target.value]
                })
            } else {
                setFilters({
                    ...filterOptions,
                    [filterName]: [...filters[filterName], event.target.value]
                })
            }
        } else {
            if (filters[filterName].length === 1) {
                setFilters({
                    ...filterOptions,
                    [filterName]: [...filterOptions[filterName]]
                })
            } else {
                setFilters({
                    ...filterOptions,
                    [filterName]: [...filters[filterName].filter(el => el != event.target.value)]
                })
            }
        }
    }

    const expandNextLevel = () => {
        hasExpanded.current = false
        Object.values(treeData).map((node: NodeData) => findNextToExpand(node))
        if (!hasExpanded.current) {
            setIsExpandedAllMessageShow(true)
        }
    }

    const findNextToExpand = (node: NodeData) => {
        if (node.isExpanded) {
            Object.values(node.children).map((item) => findNextToExpand(item))
            return
        }

        if (node.isExpandable) {
            hasExpanded.current = true
            onExpand(node)
        }
    }

    const onExpand = async (item: NodeData) => {
        if (item.isNodeFetched) {
            item.isExpanded = true
            item.additionalData.node.isExpanded = true
            setTreeData([...treeData])
            return
        }

        const session = await getSession()
        if (item.additionalData.isRelease === false) {
            const response = await ApiUtils.GET(`projects/network/${item.additionalData.node.id}/linkedResources`, session.user.access_token)
            const responseData = await response.json() as ProjectClearingState
            item.additionalData.node.linkedReleases = responseData.linkedReleases
            item.additionalData.node.subprojects = responseData.subprojects
            item.additionalData.node.isExpanded = true
            item.isNodeFetched = true
            setData({ ...data })
        } else {
            const response = await ApiUtils.GET(`projects/network/${item.additionalData.node.projectId}/releases?path=${item.additionalData.releaseIndexPath.filter((el: number) => el !== undefined).join('->')}`, session.user.access_token)
            const responseData = await response.json() as EmbeddedReleaseLinks
            item.additionalData.node.linkedReleases = responseData._embedded['sw360:releaseLinks']
            item.additionalData.node.isExpanded = true
            item.isNodeFetched = true
            setData({ ...data })
        }
        return item
    }

    const collapseAll = () => {
        const allCollapsed = Object.values(treeData).map((node: NodeData): NodeData => {
            node.isExpanded = false
            node.additionalData.node.isExpanded = false
            return node
        })
        setTreeData(allCollapsed)
        setIsExpandedAllMessageShow(false)
    }

    const sortColumn = (columnName: string) => {
        if (sortOption === undefined || sortOption.col !== columnName) {
            setSortOption({
                col: columnName,
                sortAscending: true
            })
            return
        }

        setSortOption({
            ...sortOption,
            sortAscending: !sortOption.sortAscending
        })
    }

    const compareFn = (obj1: ClearingState, obj2: ClearingState) => {
        let propName = sortOption.col as keyof ClearingState
        if (propName === 'releaseRelationship' && obj1[propName] === undefined) {
            propName = 'relation'
        }
        if (propName === 'componentType' && obj1[propName] === undefined) {
            propName = 'projectType'
        }

        let obj1Prop, obj2Prop

        if (propName === 'name') {
            obj1Prop = convertToString(obj1[propName] + obj1['version'])
            obj2Prop = convertToString(obj2[propName] + obj2['version'])
        } else {
            obj1Prop = convertToString(obj1[propName])
            obj2Prop = convertToString(obj2[propName])
        }

        if (sortOption.sortAscending) {
            return obj1Prop.localeCompare(obj2Prop)
        }
        return obj2Prop.localeCompare(obj1Prop)
    }

    const convertToString = (item: unknown) => {
        if (!item)
            return ''
        if (typeof item === 'string')
            return item
        return item.toString()
    }

    const sortData = (data: ProjectClearingState): ProjectClearingState => {
        if (sortOption === undefined)
            return data

        const sortedLinkedReleases = [...data.linkedReleases].sort(compareFn)
        const sortedSubProjects = [...data.subprojects].sort(compareFn)
        return { ...data, linkedReleases: sortedLinkedReleases, subprojects: sortedSubProjects }
    }

    const columns = [
        {
            id: 'licenseClearing.name',
            name: _(
                <>
                    {(isExpandedAllMessageShow) &&
                        <Alert variant='warning' onClose={() => setIsExpandedAllMessageShow(false)}
                            className={styles['expanded-all-message']} dismissible>
                            {t('All the levels are expanded')}!
                        </Alert>
                    }
                    <div>
                        <span>{t('Name')}</span>
                        <FaSort className='cursor-pointer' onClick={() => sortColumn('name')} />
                        {
                            (noOfLinkedResources.releases !== 0 || noOfLinkedResources.projects !== 0) && <>
                                {' ('}
                                <a href='#' onClick={() => expandNextLevel()} className='expand-next text-primary'>{t('Expand Next Level')}</a>
                                {' | '}
                                <a href='#' onClick={() => collapseAll()} className='collapse-all text-primary'>{t('Collapse all')}</a>
                                {') '}
                            </>
                        }
                    </div>
                    {
                        (noOfLinkedResources.releases !== 0 || noOfLinkedResources.projects !== 0) && <div>
                            <span className='linked-releases'>{t('Linked Releases')}: {noOfLinkedResources.releases}</span>, {' '}
                            <span className='linked-projects'>{t('Linked Projects')}: {noOfLinkedResources.projects}</span>
                        </div>
                    }
                </>
            ),
            width: '26%'
        },
        {
            id: 'licenseClearing.type',
            name: _(
                <>
                    <OverlayTrigger overlay={<Tooltip>{t('Component Type Filter')}</Tooltip>}>
                        <span>{t('Type')} {' '}</span>
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
                        {
                            Object.keys(releaseTypes).map((releaseType: string) =>
                                <span key={releaseType}>
                                    <Form.Check
                                        className={`${styles.selection}`}
                                        type='checkbox'
                                        id={`type-${releaseType}`}
                                        value={releaseType}
                                        name='types'
                                        label={releaseTypes[releaseType]}
                                        defaultChecked={(filters.types.length !== filterOptions.types.length) && filters.types.includes(releaseType)}
                                        onChange={updateFilters}
                                    />
                                </span>
                            )
                        }
                    </DropdownButton>
                    <FaSort className='cursor-pointer' onClick={() => sortColumn('componentType')} />
                </>
            ),
            width: '10%',
        },
        {
            id: 'licenseClearing.relation',
            name: _(
                <>
                    <OverlayTrigger overlay={<Tooltip>{t('Release Relation Filter')}</Tooltip>}>
                        <span>{t('Relation')} {' '}</span>
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
                        {
                            Object.keys(releaseRelations).map((relation: string) =>
                                <span key={relation}>
                                    <Form.Check
                                        className={`${styles.selection}`}
                                        type='checkbox'
                                        id={`relation-${relation}`}
                                        value={relation}
                                        name='relations'
                                        label={releaseRelations[relation]}
                                        defaultChecked={(filters.relations.length !== filterOptions.relations.length) && filters.relations.includes(relation)}
                                        onChange={updateFilters}
                                    />
                                </span>
                            )
                        }
                    </DropdownButton>
                    <FaSort className='cursor-pointer' onClick={() => sortColumn('releaseRelationship')} />
                </>
            ),
            width: '10%',
        },
        {
            id: 'licenseClearing.mainLicenses',
            name: _(
                <>
                    {t('Main licenses')}
                    <FaSort className='cursor-pointer' onClick={() => sortColumn('licenseIds')} />
                </>
            ),
            width: '9%',
        },
        {
            id: 'licenseClearing.otherLicenses',
            name: t('Other licenses'),
            width: '8%',
        },
        {
            id: 'licenseClearing.state',
            name: _(
                <>
                    <OverlayTrigger overlay={<Tooltip>{t('Release Clearing State Filter')}</Tooltip>}>
                        <span>{t('State')} {' '}</span>
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
                        {
                            Object.keys(releaseClearingStates).map((state: string) =>
                                <span key={state}>
                                    <Form.Check
                                        className={`${styles.selection}`}
                                        type='checkbox'
                                        id={`state-${state}`}
                                        value={state}
                                        name='states'
                                        defaultChecked={(filters.states.length !== filterOptions.states.length) && filters.states.includes(state)}
                                        label={releaseClearingStates[state]}
                                        onChange={updateFilters}
                                    />
                                </span>
                            )
                        }
                    </DropdownButton>
                </>
            ),
            width: '7%'
        },
        {
            id: 'licenseClearing.releaseMainlineState',
            name: _(
                <>
                    {t('Release Mainline State')}
                    <FaSort className='cursor-pointer' onClick={() => sortColumn('releaseMainLineState')} />
                </>
            ),
            width: '6%',
        },
        {
            id: 'licenseClearing.projectMainlineState',
            name: _(
                <>
                    {t('Project Mainline State')}
                    <FaSort className='cursor-pointer' onClick={() => sortColumn('mainlineState')} />
                </>
            ),
            width: '6%',
        },
        {
            id: 'licenseClearing.comment',
            name: t('Comment'),
            width: '10%',
        },
        {
            id: 'licenseClearing.actions',
            name: t('Actions'),
            width: '5%',
        },
    ]

    const convertClearingStatusDataToTableNode = (item: ClearingState, isRelease: boolean, releaseIndexPath?: Array<number>): NodeData => {
        const rowData = [
            (isRelease)
                ? (item.accessible)
                    ?
                    <Link key={item.id} href={`/components/releases/detail/${item.id}`} style={{ wordBreak: 'break-all' }}>{nameFormatter(`${item.name} ${item.version}`)}</Link>
                    :
                    item.longName
                : <Link key={item.id} href={`/projects/detail/${item.id}`} style={{ wordBreak: 'break-all' }}>{nameFormatter(`${item.name} ${item.version}`)}</Link>,
            (isRelease) ? releaseTypes[item.componentType] : projectTypes[item.projectType],
            (isRelease) ? <EnumValueWithToolTip value={item.releaseRelationship} t={t} /> : projectRelations[item.relation],
            (item.licenseIds) && <TogglerLicenseList licenses={item.licenseIds} releaseId={item.id} t={t} />,
            (item.otherLicenseIds) && <TogglerLicenseList licenses={item.otherLicenseIds} releaseId={item.id} t={t} />,
            (item.accessible || !isRelease) && <ClearingStateBadge key={item.id} isRelease={isRelease} clearingState={item.clearingState} projectState={item.state} t={t} />,
            (isRelease) ? <EnumValueWithToolTip key={item.releaseMainLineState} value={item.releaseMainLineState} t={t} /> : '',
            (isRelease) ? <EnumValueWithToolTip key={item.mainlineState} value={item.mainlineState} t={t} /> : '',
            CommonUtils.nullToEmptyString(item.comment),
            (item.accessible || !isRelease) && <div key={item.name} style={{ textAlign: 'center' }}>
                <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                    <Link
                        href={
                            isRelease === true
                                ? `/components/editRelease/${item.id}`
                                : `/projects/edit/${item.id}`
                        }
                        className='overlay-trigger'
                    >
                        <FaPencilAlt className='btn-icon' />
                    </Link>
                </OverlayTrigger>
            </div>
        ]

        return {
            rowData: rowData,
            children: [
                ...((item.linkedReleases) ? Object.values(item.linkedReleases).map((subItem) => convertClearingStatusDataToTableNode(subItem, true, [...((releaseIndexPath) ? releaseIndexPath : []), item.index])) : []),
                ...((item.subprojects) ? Object.values(item.subprojects).map((subItem) => convertClearingStatusDataToTableNode(subItem, false)) : [])
            ],
            isExpanded: item.isExpanded,
            isExpandable: (isRelease) ? item.hasSubreleases : true,
            isNodeFetched: !CommonUtils.isNullEmptyOrUndefinedArray(item.linkedReleases) || !CommonUtils.isNullEmptyOrUndefinedArray(item.subprojects) || item.isExpanded,
            additionalData: {
                node: item.ref ? item.ref : item,
                isRelease: isRelease,
                releaseIndexPath: (releaseIndexPath) ? [...releaseIndexPath, item.index] : [],
                projectOrigin: item.projectId
            }
        }
    }

    function filterData(data: ProjectClearingState) {
        const filterRelease = (release: ReleaseClearingState): ReleaseClearingState => {
            if (!CommonUtils.isNullEmptyOrUndefinedArray(release.linkedReleases)) {
                const subNodes: Array<ReleaseClearingState> = release.linkedReleases.map(subRelease => filterRelease(subRelease)).filter(el => el !== undefined)
                if (subNodes.length) return { ...release, linkedReleases: subNodes, ref: release }
            }
            if (
                filters.types.includes(release.componentType) &&
                filters.relations.includes(release.releaseRelationship) &&
                filters.states.includes(release.clearingState)
            ) {
                return { ...release, ref: release }
            }
            return undefined
        }

        const filterProject = (project: ProjectClearingState) => {
            const filteredReleases = (project.linkedReleases) ? project.linkedReleases.map(release => filterRelease(release)).filter(el => el !== undefined) : []
            const filteredProjects: Array<ProjectClearingState> = project.subprojects
                ? project.subprojects
                    .map((prj) => {
                        const filteredProject = filterProject(prj)
                        if (prj.isExpanded !== true) {
                            return undefined
                        }
                        if (CommonUtils.isNullEmptyOrUndefinedArray(filteredProject.linkedReleases)
                            && CommonUtils.isNullEmptyOrUndefinedArray(filteredProject.subprojects)
                        )
                            return undefined
                        return filteredProject
                    }).filter(prj => prj !== undefined)
                : []
            return { ...project, subprojects: filteredProjects, linkedReleases: filteredReleases, ref: project }
        }

        return filterProject(data)
    }

    useEffect(() => {
        if (data === undefined) return

        setNoOfLinkedResources({
            releases: !CommonUtils.isNullEmptyOrUndefinedArray(data.linkedReleases) ? data.linkedReleases.length : 0,
            projects: !CommonUtils.isNullEmptyOrUndefinedArray(data.subprojects) ? data.subprojects.length : 0
        })

        const sortedData = sortData(data)
        const filteredData =
            (
                filters.types.length === filterOptions.types.length &&
                filters.relations.length === filterOptions.relations.length &&
                filters.states.length === filterOptions.states.length
            ) ? sortedData : filterData(sortedData)

        const treeData = [
            ...(!CommonUtils.isNullEmptyOrUndefinedArray(filteredData.linkedReleases) ? Object.values(filteredData.linkedReleases).map(
                (item) => convertClearingStatusDataToTableNode(item, true, [])
            ) : []),
            ...(!CommonUtils.isNullEmptyOrUndefinedArray(filteredData.subprojects) ? Object.values(filteredData.subprojects).map(
                (item) => convertClearingStatusDataToTableNode(item, false)
            ) : [])
        ]

        setTreeData(treeData)
    }, [data, filters, sortOption])

    const onLoadFetch = useCallback(
        async () => {
            const session = await getSession()
            const response = await ApiUtils.GET(`projects/network/${projectId}/linkedResources`, session.user.access_token)
            const responseData = await response.json()
            setData(responseData)
        }, [projectId]
    )

    useEffect(() => {
        onLoadFetch()
    }, [])

    const doSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value === '' ? undefined : { keyword: event.target.value })
    }

    return (
        <>
            <div >
                <Form.Control
                    placeholder={t('Search')}
                    className={`d-inline-block tree-view-search-input float-end ${styles['table-search-box']}`}
                    size='sm'
                    type='search'
                    onChange={doSearch}
                />
            </div>
            <div className='my-1'>
                {
                    data
                        ?
                            <TreeTable columns={columns} data={treeData} setData={setTreeData} language={language} onExpand={onExpand} search={search} />
                        :
                            <div className='col-12 text-center'>
                                <Spinner className='spinner' />
                            </div>
                }
            </div>
        </>
    )
}

const compare = (preState: { projectId: string }, nextState: { projectId: string }) => {
    return preState.projectId === nextState.projectId
}

export default React.memo(DependencyNetworkTreeView, compare)