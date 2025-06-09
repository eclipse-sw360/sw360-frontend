// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, HttpStatus, Project as TypeProject } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { SW360_API_URL } from '@/utils/env'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AdvancedSearch, Table, _ } from 'next-sw360'
import Link from 'next/link'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type JSX } from 'react'
import { Dropdown, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaClipboard, FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import { MdOutlineTask } from 'react-icons/md'
import CreateClearingRequestModal from '../detail/[id]/components/CreateClearingRequestModal'
import ViewClearingRequestModal from '../detail/[id]/components/ViewClearingRequestModal'
import DeleteProjectDialog from './DeleteProjectDialog'
import ImportSBOMModal from './ImportSBOMModal'

type EmbeddedProjects = Embedded<TypeProject, 'sw360:projects'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

interface LicenseClearingData {
    'Release Count': number
    'Approved Count': number
}

interface ImportSBOMMetadata {
    importType: 'SPDX' | 'CycloneDx'
    show: boolean
}

function LicenseClearing({ projectId }: { projectId: string }) {
    const [lcData, setLcData] = useState<LicenseClearingData | null>(null)
    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        void (async () => {
            try {
                const session = await getSession()
                if (!session) {
                    return signOut()
                }

                const response = await ApiUtils.GET(
                    `projects/${projectId}/licenseClearingCount`,
                    session.user.access_token,
                    signal,
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const data = (await response.json()) as LicenseClearingData

                setLcData(data)
            } catch (e) {
                console.error(e)
            }
        })()
        return () => controller.abort()
    }, [])

    return (
        <>
            {lcData ? (
                <div className='text-center'>{`${lcData['Approved Count']}/${lcData['Release Count']}`}</div>
            ) : (
                <div className='col-12 text-center'>
                    <Spinner
                        className='spinner'
                        size='sm'
                    />
                </div>
            )}
        </>
    )
}

function Project(): JSX.Element {
    const { data: session, status } = useSession()
    const t = useTranslations('default')
    const params = useSearchParams()
    const router = useRouter()
    const [deleteProjectId, setDeleteProjectId] = useState<string>('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [importSBOMMetadata, setImportSBOMMetadata] = useState<ImportSBOMMetadata>({
        show: false,
        importType: 'SPDX',
    })

    const [showCreateCRModal, setShowCreateCRModal] = useState(false)
    const [createCRProjectId, setCreateCRProjectId] = useState('')

    const [showViewCRModal, setShowViewCRModal] = useState(false)
    const [clearingRequestId, setClearingRequestId] = useState('')

    const handleDeleteProject = (projectId: string) => {
        setDeleteProjectId(projectId)
        setDeleteDialogOpen(true)
    }

    const handleAddProject = () => {
        router.push('/projects/add')
    }

    const handleEditProject = (projectId: string) => {
        router.push(`/projects/edit/${projectId}`)
        MessageService.success(t('You are editing the original document'))
    }

    const columns = [
        {
            id: 'projects.name',
            name: t('Project Name'),
            width: '15%',
            formatter: ({ id, name, version }: { id: string; name: string; version: string }) =>
                _(
                    <>
                        <Link
                            href={`/projects/detail/${id}`}
                            className='text-link'
                        >
                            {name} {version !== '' && `(${version})`}
                        </Link>
                    </>,
                ),
            sort: true,
        },
        {
            id: 'projects.description',
            name: t('Description'),
            width: '20%',
            sort: true,
        },
        {
            id: 'projects.projectResponsible',
            name: t('Project Responsible'),
            formatter: (email: string) =>
                _(
                    <>
                        <Link
                            href={`mailto:${email}`}
                            className='text-link'
                        >
                            {email}
                        </Link>
                    </>,
                ),
            sort: true,
        },
        {
            id: 'projects.state',
            name: t('State'),
            width: '8%',
            formatter: ({ state, clearingState }: { state: string; clearingState: string }) =>
                _(
                    <>
                        <OverlayTrigger overlay={<Tooltip>{`${t('Project State')}: ${Capitalize(state)}`}</Tooltip>}>
                            {state === 'ACTIVE' ? (
                                <span className='badge bg-success capsule-left overlay-badge'>{'PS'}</span>
                            ) : (
                                <span className='badge bg-secondary capsule-left overlay-badge'>{'PS'}</span>
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
                    </>,
                ),
            sort: true,
        },
        {
            id: 'projects.licenseClearing',
            name: t('License Clearing'),
            formatter: (id: string) => _(<LicenseClearing projectId={id} />),
            sort: true,
        },
        {
            id: 'projects.actions',
            name: t('Actions'),
            width: '13%',
            formatter: ([projectId, clearingRequestId]: [string, string]) =>
                _(
                    <>
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <span
                                    className='d-inline-block'
                                    onClick={() => handleEditProject(projectId)}
                                >
                                    <FaPencilAlt className='btn-icon' />
                                </span>
                            </OverlayTrigger>
                            {clearingRequestId !== '' ? (
                                <OverlayTrigger overlay={<Tooltip>{t('View Clearing Request')}</Tooltip>}>
                                    <span
                                        className='d-inline-block'
                                        onClick={() => {
                                            setClearingRequestId(clearingRequestId)
                                            setShowViewCRModal(true)
                                        }}
                                    >
                                        <MdOutlineTask
                                            className='btn-icon overlay-trigger'
                                            style={{ fill: 'orange' }}
                                        />
                                    </span>
                                </OverlayTrigger>
                            ) : (
                                <OverlayTrigger overlay={<Tooltip>{t('Create Clearing Request')}</Tooltip>}>
                                    <span
                                        className='d-inline-block'
                                        onClick={() => {
                                            setCreateCRProjectId(projectId)
                                            setShowCreateCRModal(true)
                                        }}
                                    >
                                        <MdOutlineTask className='btn-icon overlay-trigger' />
                                    </span>
                                </OverlayTrigger>
                            )}
                            <OverlayTrigger overlay={<Tooltip>{t('Duplicate')}</Tooltip>}>
                                <Link
                                    href={`/projects/duplicate/${projectId}`}
                                    className='overlay-trigger'
                                >
                                    <FaClipboard className='btn-icon' />
                                </Link>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                <span className='d-inline-block'>
                                    <FaTrashAlt
                                        className='btn-icon'
                                        onClick={() => handleDeleteProject(projectId)}
                                        style={{ color: 'gray', fontSize: '18px' }}
                                    />
                                </span>
                            </OverlayTrigger>
                        </span>
                    </>,
                ),
            sort: true,
        },
    ]

    const initServerPaginationConfig = () => {
        if (CommonUtils.isNullOrUndefined(session)) return

        const searchParams = Object.fromEntries(params)
        searchParams.allDetails = 'true'

        return {
            url: CommonUtils.createUrlWithParams(`${SW360_API_URL}/resource/api/projects`, searchParams),
            then: (data: EmbeddedProjects) => {
                return data._embedded['sw360:projects'].map((elem: TypeProject) => {
                    const clearingRequestId = elem.clearingRequestId ?? ''
                    const projectId = elem['_links']['self']['href'].substring(
                        elem['_links']['self']['href'].lastIndexOf('/') + 1,
                    )

                    return [
                        {
                            id: projectId,
                            name: elem.name,
                            version: elem.version ?? '',
                        },
                        elem.description ?? '',
                        elem.projectResponsible ?? '',
                        { state: elem.state ?? '', clearingState: elem.clearingState ?? '' },
                        projectId,
                        [projectId, clearingRequestId],
                    ]
                })
            },
            total: (data: EmbeddedProjects) => data.page?.totalElements ?? 0,
            headers: { Authorization: `${session.user.access_token}` },
        }
    }

    const exportProjectSpreadsheet = async ({ withLinkedRelease }: { withLinkedRelease: boolean }) => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            if (withLinkedRelease === false) {
                const response = await ApiUtils.GET('reports?module=PROJECTS', session.user.access_token)
                if (response.status == HttpStatus.OK) {
                    MessageService.success(t('Excel report generation has started'))
                } else if (response.status == HttpStatus.FORBIDDEN) {
                    MessageService.warn(t('Access Denied'))
                } else if (response.status == HttpStatus.INTERNAL_SERVER_ERROR) {
                    MessageService.error(t('Internal server error'))
                } else if (response.status == HttpStatus.UNAUTHORIZED) {
                    MessageService.error(t('Unauthorized request'))
                }
            } else {
                const response = await ApiUtils.GET(
                    'reports?module=PROJECTS&withLinkedRelease=true',
                    session.user.access_token,
                )
                if (response.status == HttpStatus.OK) {
                    MessageService.success(t('Excel report generation has started'))
                } else if (response.status == HttpStatus.FORBIDDEN) {
                    MessageService.warn(t('Access Denied'))
                } else if (response.status == HttpStatus.INTERNAL_SERVER_ERROR) {
                    MessageService.error(t('Internal server error'))
                } else if (response.status == HttpStatus.UNAUTHORIZED) {
                    MessageService.error(t('Unauthorized request'))
                }
            }
        } catch (e) {
            console.log(e)
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
            value: [
                {
                    key: 'None',
                    text: t('None'),
                },
            ],
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
                />
            )}
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
                                        >
                                            {t('Add Project')}
                                        </button>
                                        <Dropdown>
                                            <Dropdown.Toggle variant='secondary'>{t('Import SBOM')}</Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        setImportSBOMMetadata({ importType: 'SPDX', show: true })
                                                    }
                                                >
                                                    {t('SPDX')}
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        setImportSBOMMetadata({ importType: 'CycloneDx', show: true })
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
                                                onClick={() => exportProjectSpreadsheet({ withLinkedRelease: false })}
                                            >
                                                {t('Projects only')}
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => exportProjectSpreadsheet({ withLinkedRelease: true })}
                                            >
                                                {t('Projects with linked releases')}
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className='col-auto buttonheader-title'>{t('PROJECTS')}</div>
                        </div>
                        {status === 'authenticated' ? (
                            <Table
                                columns={columns}
                                server={initServerPaginationConfig()}
                                selector={true}
                                sort={false}
                            />
                        ) : (
                            <div className='col-12 d-flex justify-content-center align-items-center'>
                                <Spinner className='spinner' />
                            </div>
                        )}
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
