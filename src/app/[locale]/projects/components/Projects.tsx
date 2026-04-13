// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AdvancedSearch, Breadcrumb, PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Dropdown, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsCheck2Square, BsClipboard, BsFillTrashFill, BsPencil } from 'react-icons/bs'
import LicenseClearing, { type LicenseClearingData } from '@/components/LicenseClearing'
import { useConfigKeyValue, useConfigValue } from '@/contexts'
import {
    ConfigKeys,
    Embedded,
    ErrorDetails,
    PageableQueryParam,
    PaginationMeta,
    Project as TypeProject,
    UIConfigKeys,
    UserGroupType,
} from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'
import ImportSBOMMetadata from '../../../../object-types/cyclonedx/ImportSBOMMetadata'
import CreateClearingRequestModal from '../detail/[id]/components/CreateClearingRequestModal'
import ViewClearingRequestModal from '../detail/[id]/components/ViewClearingRequestModal'
import DeleteProjectDialog from './DeleteProjectDialog'
import ImportSBOMModal from './ImportSBOMModal'

type EmbeddedProjects = Embedded<TypeProject, 'sw360:projects'>
type LicenseClearingMap = Record<string, LicenseClearingData>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

interface GroupEntry {
    key: string
    text: string
}

function Project(): JSX.Element {
    const t = useTranslations('default')
    const session = useSession()
    const params = useSearchParams()
    const router = useRouter()
    const [deleteProjectId, setDeleteProjectId] = useState<string>('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [hasClearingRequest, setHasClearingRequest] = useState(false)
    const [importSBOMMetadata, setImportSBOMMetadata] = useState<ImportSBOMMetadata>({
        show: false,
        importType: 'SPDX',
    })

    // Configs from backend
    const mailRequestForProjectReport = useConfigKeyValue(ConfigKeys.MAIL_REQUEST_FOR_PROJECT_REPORT)
    const clearingRequestDisabledGroups = useConfigValue(
        UIConfigKeys.UI_ORG_ECLIPSE_SW360_DISABLE_CLEARING_REQUEST_FOR_PROJECT_GROUP,
    ) as string[] | null

    const [showCreateCRModal, setShowCreateCRModal] = useState(false)
    const [createCRProjectId, setCreateCRProjectId] = useState('')

    const [showViewCRModal, setShowViewCRModal] = useState(false)
    const [clearingRequestId, setClearingRequestId] = useState('')
    const [licenseClearingData, setLicenseClearingData] = useState<LicenseClearingMap>({})
    const [projectGroups, setProjectGroups] = useState<GroupEntry[]>([
        {
            key: 'None',
            text: t('None'),
        },
    ])

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    const handleDeleteProject = (projectId: string, clearingRequestId?: string, clearingState?: string) => {
        setDeleteProjectId(projectId)
        const hasOpenCR = clearingRequestId && (clearingState === 'OPEN' || clearingState === 'IN_PROGRESS')
        setHasClearingRequest(!!hasOpenCR)
        setDeleteDialogOpen(true)
    }

    const handleAddProject = () => {
        router.push('/projects/add')
    }

    const handleEditProject = (projectId: string) => {
        router.push(`/projects/edit/${projectId}`)
        MessageService.success(t('You are editing the original document'))
    }

    const columns = useMemo<ColumnDef<TypeProject>[]>(
        () => [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('Project Name'),
                enableSorting: true,
                cell: ({ row }) => {
                    const { name, version } = row.original
                    const id = row.original['_links']['self']['href'].split('/').at(-1)
                    return (
                        <Link
                            href={`/projects/detail/${id}`}
                            className='text-link'
                        >
                            {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                        </Link>
                    )
                },
                meta: {
                    width: '17.5%',
                },
            },
            {
                id: 'description',
                header: t('Description'),
                accessorKey: 'description',
                cell: (info) => info.getValue(),
                meta: {
                    width: '32.5%',
                },
            },
            {
                id: 'projectResponsible',
                header: t('Project Responsible'),
                accessorKey: 'projectResponsible',
                cell: ({ row }) => {
                    const { projectResponsible } = row.original
                    return (
                        <>
                            {projectResponsible && (
                                <Link
                                    href={`mailto:${projectResponsible}`}
                                    className='text-link'
                                >
                                    {projectResponsible}
                                </Link>
                            )}
                        </>
                    )
                },
                meta: {
                    width: '17.5%',
                },
            },
            {
                id: 'state',
                header: t('State'),
                accessorKey: 'state',
                cell: ({ row }) => {
                    const { state, clearingState } = row.original
                    return (
                        <>
                            {state && clearingState && (
                                <div className='text-center'>
                                    <OverlayTrigger
                                        overlay={<Tooltip>{`${t('Project State')}: ${Capitalize(state)}`}</Tooltip>}
                                    >
                                        {state === 'ACTIVE' ? (
                                            <span className='badge bg-success capsule-left overlay-badge'>{'PS'}</span>
                                        ) : (
                                            <span className='badge bg-secondary capsule-left overlay-badge'>
                                                {'PS'}
                                            </span>
                                        )}
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip>{`${t('Project Clearing State')}: ${Capitalize(clearingState)}`}</Tooltip>
                                        }
                                    >
                                        {clearingState === 'OPEN' ? (
                                            <span className='badge bg-danger capsule-right overlay-badge'>{'CS'}</span>
                                        ) : clearingState === 'IN_PROGRESS' ? (
                                            <span className='badge bg-warning capsule-right overlay-badge'>{'CS'}</span>
                                        ) : (
                                            <span className='badge bg-success capsule-right overlay-badge'>{'CS'}</span>
                                        )}
                                    </OverlayTrigger>
                                </div>
                            )}
                        </>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'licenseClearing',
                header: t('License Clearing'),
                enableSorting: false,
                cell: ({ row }) => {
                    const id = row.original['_links']['self']['href'].split('/').at(-1)
                    return (
                        <>
                            {id && (
                                <LicenseClearing
                                    projectId={id}
                                    data={licenseClearingData[id]}
                                />
                            )}
                        </>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                enableSorting: false,
                cell: ({ row }) => {
                    const id = row.original['_links']['self']['href'].split('/').at(-1)
                    const projectClearingRequestId = row.original.clearingRequestId
                    const clearingState = row.original.clearingState
                    const isOpenClearingRequest = clearingState === 'OPEN'
                    const crIsAllowed = CommonUtils.isCrAllowed(
                        row.original.businessUnit ?? '',
                        row.original.clearingState ?? '',
                        clearingRequestDisabledGroups,
                        row.original.visibility,
                    )
                    return (
                        <>
                            {id && (
                                <span className='d-flex align-items-center justify-content-center'>
                                    <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                        <span
                                            className='d-inline-flex align-items-center justify-content-center'
                                            style={{
                                                width: 28,
                                                height: 28,
                                            }}
                                            onClick={() => handleEditProject(id)}
                                        >
                                            <BsPencil
                                                className='btn-icon'
                                                size={20}
                                            />
                                        </span>
                                    </OverlayTrigger>
                                    <span className='border-start align-self-stretch mx-1 my-1' />
                                    {projectClearingRequestId && projectClearingRequestId !== '' ? (
                                        <OverlayTrigger overlay={<Tooltip>{t('View Clearing Request')}</Tooltip>}>
                                            <span
                                                className='d-inline-flex align-items-center justify-content-center'
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                }}
                                                onClick={() => {
                                                    setClearingRequestId(projectClearingRequestId)
                                                    setShowViewCRModal(true)
                                                }}
                                            >
                                                <BsCheck2Square
                                                    size={20}
                                                    className={`btn-icon overlay-trigger ${isOpenClearingRequest ? 'cr-icon-highlighted' : ''}`}
                                                />
                                            </span>
                                        </OverlayTrigger>
                                    ) : crIsAllowed ? (
                                        <OverlayTrigger overlay={<Tooltip>{t('Create Clearing Request')}</Tooltip>}>
                                            <span
                                                className='d-inline-flex align-items-center justify-content-center'
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                }}
                                                onClick={() => {
                                                    setCreateCRProjectId(id)
                                                    setShowCreateCRModal(true)
                                                }}
                                            >
                                                <BsCheck2Square
                                                    size={20}
                                                    className='btn-icon overlay-trigger'
                                                />
                                            </span>
                                        </OverlayTrigger>
                                    ) : (
                                        <OverlayTrigger
                                            overlay={
                                                <Tooltip>
                                                    {t(
                                                        'CR is disabled for projects with specific Business unit or PRIVATE or CLOSED projects',
                                                    )}
                                                </Tooltip>
                                            }
                                        >
                                            <span
                                                className='d-inline-flex align-items-center justify-content-center'
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                }}
                                            >
                                                <BsCheck2Square
                                                    size={20}
                                                    className='btn-icon overlay-trigger icon-disabled'
                                                />
                                            </span>
                                        </OverlayTrigger>
                                    )}
                                    <span className='border-start align-self-stretch mx-1 my-1' />
                                    <OverlayTrigger overlay={<Tooltip>{t('Duplicate')}</Tooltip>}>
                                        <Link
                                            href={`/projects/duplicate/${id}`}
                                            className='overlay-trigger d-inline-flex align-items-center justify-content-center'
                                            style={{
                                                width: 28,
                                                height: 28,
                                            }}
                                        >
                                            <BsClipboard
                                                className='btn-icon mt-0'
                                                size={20}
                                            />
                                        </Link>
                                    </OverlayTrigger>

                                    <span className='border-start align-self-stretch mx-1 my-1' />
                                    <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                        <span
                                            className='d-inline-flex align-items-center justify-content-center'
                                            style={{
                                                width: 28,
                                                height: 28,
                                            }}
                                        >
                                            <BsFillTrashFill
                                                className='btn-icon'
                                                size={20}
                                                onClick={() => {
                                                    if (projectClearingRequestId && projectClearingRequestId !== '') {
                                                        handleDeleteProject(id, projectClearingRequestId, clearingState)
                                                    } else {
                                                        handleDeleteProject(id)
                                                    }
                                                }}
                                            />
                                        </span>
                                    </OverlayTrigger>
                                </span>
                            )}
                        </>
                    )
                },
                meta: {
                    width: '12.5%',
                },
            },
        ],
        [
            t,
            licenseClearingData,
        ],
    )
    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: 'name,asc',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const [projectData, setProjectData] = useState<TypeProject[]>(() => [])
    const memoizedData = useMemo(
        () => projectData,
        [
            projectData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET('projects/groups', session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }
                const data = (await response.json()) as string[]
                const mappedData = data.map(
                    (d: string) =>
                        ({
                            key: d,
                            text: d,
                        }) as GroupEntry,
                )
                setProjectGroups(mappedData)
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()

        return () => controller.abort()
    }, [
        session,
    ])

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = projectData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

                const searchParams = Object.fromEntries(params.entries())
                const queryUrl = CommonUtils.createUrlWithParams(
                    `projects`,
                    Object.fromEntries(
                        Object.entries({
                            ...searchParams,
                            ...pageableQueryParam,
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedProjects
                setPaginationMeta(data.page)
                setProjectData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:projects'])
                        ? []
                        : data['_embedded']['sw360:projects'],
                )
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        pageableQueryParam,
        params.toString(),
        session,
    ])

    useEffect(() => {
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: '',
        })
    }, [
        params.toString(),
    ])

    // Fetch license clearing counts in batch after project data is loaded
    useEffect(() => {
        if (session.status !== 'authenticated') return
        if (projectData.length === 0) {
            setLicenseClearingData({})
            return
        }

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

                const projectIds = projectData
                    .map((project) => project['_links']['self']['href'].split('/').at(-1))
                    .filter((id): id is string => id !== undefined)

                if (projectIds.length === 0) return

                const response = await ApiUtils.POST(
                    'projects/licenseClearingCount',
                    projectIds,
                    session.data.user.access_token,
                )

                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as LicenseClearingMap
                setLicenseClearingData(data)
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()
    }, [
        projectData,
        session,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // table state config
        state: {
            columnVisibility: {
                actions: !(session.data?.user?.userGroup === UserGroupType.SECURITY_USER),
                licenseClearing: !(session.data?.user?.userGroup === UserGroupType.SECURITY_USER),
            },
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
            sorting: [
                {
                    id: pageableQueryParam.sort.split(',')[0],
                    desc: pageableQueryParam.sort.split(',')[1] === 'desc',
                },
            ],
        },

        // server side sorting config
        manualSorting: true,
        onSortingChange: (updater) => {
            setPageableQueryParam((prev) => {
                const prevSorting: SortingState = [
                    {
                        id: prev.sort.split(',')[0],
                        desc: prev.sort.split(',')[1] === 'desc',
                    },
                ]

                const nextSorting = typeof updater === 'function' ? updater(prevSorting) : updater

                if (nextSorting.length > 0) {
                    const { id, desc } = nextSorting[0]
                    return {
                        ...prev,
                        sort: `${id},${desc ? 'desc' : 'asc'}`,
                    }
                }

                return {
                    ...prev,
                    sort: '',
                }
            })
        },

        // server side pagination config
        manualPagination: true,
        pageCount: paginationMeta?.totalPages ?? 1,
        onPaginationChange: (updater) => {
            const next =
                typeof updater === 'function'
                    ? updater({
                          pageIndex: pageableQueryParam.page,
                          pageSize: pageableQueryParam.page_entries,
                      })
                    : updater

            setPageableQueryParam((prev) => ({
                ...prev,
                page: next.pageIndex + 1,
                page_entries: next.pageSize,
            }))
        },

        meta: {
            rowHeightConstant: true,
        },
    })

    const exportProjectSpreadsheet = async ({ withLinkedRelease }: { withLinkedRelease: boolean }) => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

            const mailEnabled = mailRequestForProjectReport === 'true'
            const url = withLinkedRelease ? 'reports?module=PROJECTS&withLinkedRelease=true' : 'reports?module=PROJECTS'

            if (!mailEnabled) {
                // If mail is not enabled, download the file immediately
                const currentDate = new Date().toISOString().split('T')[0]
                const fileName = `Projects-${currentDate}.xlsx`
                const statusCode = await DownloadService.download(url, session.data, fileName)
                if (statusCode === StatusCodes.OK) {
                    MessageService.success(t('Spreadsheet download is successful'))
                } else if (statusCode === StatusCodes.FORBIDDEN) {
                    MessageService.warn(t('Access Denied'))
                } else if (statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
                    MessageService.error(t('Internal server error'))
                } else if (statusCode === StatusCodes.UNAUTHORIZED) {
                    MessageService.error(t('Unauthorized request'))
                }
            } else {
                // If mail is enabled, just send the request and show message
                const response = await ApiUtils.GET(url, session.data.user.access_token)
                if (response.status === StatusCodes.OK) {
                    MessageService.success(t('Excel report generation has started'))
                } else if (response.status === StatusCodes.FORBIDDEN) {
                    MessageService.warn(t('Access Denied'))
                } else if (response.status === StatusCodes.INTERNAL_SERVER_ERROR) {
                    MessageService.error(t('Internal server error'))
                } else if (response.status === StatusCodes.UNAUTHORIZED) {
                    MessageService.error(t('Unauthorized request'))
                }
            }
        } catch (e) {
            ApiUtils.reportError(e)
        }
    }

    const advancedSearch = [
        {
            fieldName: t('Project Name'),
            value: '',
            paramName: 'name',
        },
        {
            fieldName: t('Project Version'),
            value: '',
            paramName: 'version',
        },
        {
            fieldName: t('Project Type'),
            value: [
                {
                    key: 'CUSTOMER',
                    text: t('Customer Project'),
                },
                {
                    key: 'INTERNAL',
                    text: t('Internal Project'),
                },
                {
                    key: 'PRODUCT',
                    text: t('Product'),
                },
                {
                    key: 'SERVICE',
                    text: t('Service'),
                },
                {
                    key: 'INNER_SOURCE',
                    text: t('Inner Source'),
                },
                {
                    key: 'CLOUD_BACKEND',
                    text: t('Cloud Backend'),
                },
            ],
            paramName: 'type',
        },
        {
            fieldName: t('Project Responsible (Email)'),
            value: '',
            paramName: 'projectResponsible',
        },
        {
            fieldName: t('Group'),
            value: projectGroups,
            paramName: 'group',
        },
        {
            fieldName: t('State'),
            value: [
                {
                    key: 'ACTIVE',
                    text: t('Active'),
                },
                {
                    key: 'PHASE_OUT',
                    text: t('PhaseOut'),
                },
                {
                    key: 'UNKNOWN',
                    text: t('Unknown'),
                },
            ],
            paramName: 'state',
        },
        {
            fieldName: t('Clearing State'),
            value: [
                {
                    key: 'OPEN',
                    text: t('Open'),
                },
                {
                    key: 'IN_PROGRESS',
                    text: t('In Progress'),
                },
                {
                    key: 'CLOSED',
                    text: t('Closed'),
                },
            ],
            paramName: 'clearingStatus',
        },
        {
            fieldName: t('Tag'),
            value: '',
            paramName: 'tag',
        },
        {
            fieldName: t('Additional Data'),
            value: '',
            paramName: 'additionalData',
        },
    ]

    return (
        <>
            <ImportSBOMModal
                importSBOMMetadata={importSBOMMetadata}
                setImportSBOMMetadata={setImportSBOMMetadata}
            />
            {deleteProjectId && (
                <DeleteProjectDialog
                    projectId={deleteProjectId}
                    show={deleteDialogOpen}
                    setShow={setDeleteDialogOpen}
                    hasClearingRequest={hasClearingRequest}
                />
            )}
            <Breadcrumb name={t('Projects')} />
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <AdvancedSearch
                            title='Advanced Search'
                            fields={advancedSearch}
                        />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between'>
                            <div className='col-lg-5'>
                                <div className='row'>
                                    <div
                                        className='btn-group col-auto'
                                        role='group'
                                    >
                                        <button
                                            className='btn btn-primary'
                                            onClick={handleAddProject}
                                            disabled={
                                                session.status === 'authenticated' &&
                                                session.data?.user?.userGroup === UserGroupType.SECURITY_USER
                                            }
                                        >
                                            {t('Add Project')}
                                        </button>
                                        <Dropdown>
                                            <Dropdown.Toggle
                                                variant='secondary'
                                                hidden={
                                                    session.status === 'authenticated' &&
                                                    session.data?.user?.userGroup === UserGroupType.SECURITY_USER
                                                }
                                            >
                                                {t('Import SBOM')}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        setImportSBOMMetadata({
                                                            importType: 'SPDX',
                                                            show: true,
                                                        })
                                                    }
                                                >
                                                    {t('SPDX')}
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        setImportSBOMMetadata({
                                                            importType: 'CycloneDx',
                                                            show: true,
                                                        })
                                                    }
                                                >
                                                    {t('CycloneDX')}
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    <Dropdown className='col-auto'>
                                        <Dropdown.Toggle variant='secondary'>{t('Export Spreadsheet')}</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item
                                                onClick={() =>
                                                    void exportProjectSpreadsheet({
                                                        withLinkedRelease: false,
                                                    })
                                                }
                                            >
                                                {t('Projects only')}
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() =>
                                                    void exportProjectSpreadsheet({
                                                        withLinkedRelease: true,
                                                    })
                                                }
                                            >
                                                {t('Projects with linked releases')}
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className='col-auto buttonheader-title'>{t('PROJECTS')}</div>
                        </div>
                        <div className='mb-3'>
                            {pageableQueryParam && table && paginationMeta ? (
                                <>
                                    <PageSizeSelector
                                        pageableQueryParam={pageableQueryParam}
                                        setPageableQueryParam={setPageableQueryParam}
                                    />
                                    <SW360Table
                                        table={table}
                                        showProcessing={showProcessing}
                                    />
                                    <TableFooter
                                        pageableQueryParam={pageableQueryParam}
                                        setPageableQueryParam={setPageableQueryParam}
                                        paginationMeta={paginationMeta}
                                    />
                                </>
                            ) : (
                                <div className='col-12 mt-1 text-center'>
                                    <Spinner className='spinner' />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <CreateClearingRequestModal
                show={showCreateCRModal}
                setShow={setShowCreateCRModal}
                projectId={createCRProjectId}
            />
            <ViewClearingRequestModal
                show={showViewCRModal}
                setShow={setShowViewCRModal}
                clearingRequestId={clearingRequestId}
            />
        </>
    )
}

export default Project
