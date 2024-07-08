// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, HttpStatus, Project as TypeProject, Session } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { SW360_API_URL } from '@/utils/env'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AdvancedSearch, Table, _ } from 'next-sw360'
import Link from 'next/link'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Dropdown, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaClipboard, FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import { MdOutlineTask } from 'react-icons/md'
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

        ;(async () => {
            try {
                const session = await getSession()
                if (!session) {
                    return signOut()
                }

                const response = await ApiUtils.GET(
                    `projects/${projectId}/licenseClearingCount`,
                    session.user.access_token,
                    signal
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const data = await response.json()

                setLcData(data)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [projectId])

    return (
        <>
            {lcData ? (
                <div className='text-center'>{`${lcData['Approved Count']}/${lcData['Release Count']}`}</div>
            ) : (
                <div className='col-12 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </>
    )
}

function Project() {
    const { data: session, status } = useSession()
    const t = useTranslations('default')
    const params = useSearchParams()
    const router = useRouter()
    const [deleteProjectId, setDeleteProjectId] = useState<string>('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [importSBOMMetadata, setImportSBOMMetadata] = useState<ImportSBOMMetadata>({ show: false, importType: 'SPDX' })

    const handleDeleteProject = (projectId: string) => {
        setDeleteProjectId(projectId)
        setDeleteDialogOpen(true)
    }

    const handleAddProject = () => {
        router.push('/projects/add')
    }

    const columns = [
        {
            id: 'projects.name',
            name: t('Project Name'),
            width: '15%',
            formatter: ({ id, name, version }: { id: string; name: string; version: string; }) =>
                _(
                    <>
                        <Link href={`/projects/detail/${id}`} className='text-link'>
                            {name}{' '}{(version !== "") && `(${version})`}
                        </Link>
                    </>
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
                        <Link href={`mailto:${email}`} className='text-link'>
                            {email}
                        </Link>
                    </>
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
                    </>
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
            formatter: (id: string) =>
                _(
                    <>
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <Link href={`/projects/edit/${id}`} className='overlay-trigger'>
                                    <FaPencilAlt className='btn-icon' />
                                </Link>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Create Clearing Request')}</Tooltip>}>
                                <span className='d-inline-block'>
                                    <MdOutlineTask className='btn-icon overlay-trigger' />
                                </span>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Duplicate')}</Tooltip>}>
                                <Link href={`/projects/duplicate/${id}`} className='overlay-trigger'>
                                    <FaClipboard className='btn-icon' />
                                </Link>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                <span className='d-inline-block'>
                                    <FaTrashAlt
                                        className='btn-icon'
                                        onClick={() => handleDeleteProject(id)}
                                        style={{ color: 'gray', fontSize: '18px' }}
                                    />
                                </span>
                            </OverlayTrigger>
                        </span>
                    </>
                ),
            sort: true,
        },
    ]

    const initServerPaginationConfig = (session: Session) => {
        return {
            url: CommonUtils.createUrlWithParams(`${SW360_API_URL}/resource/api/projects`, Object.fromEntries(params)),
            then: (data: EmbeddedProjects) => {
                return data._embedded['sw360:projects'].map((elem: TypeProject) => [
                    {
                        id: elem['_links']['self']['href'].substring(elem['_links']['self']['href'].lastIndexOf('/') + 1),
                        name: elem.name ?? '',
                        version: elem.version ?? ''
                    },
                    elem.description ?? '',
                    elem.projectResponsible ?? '',
                    { state: elem.state ?? '', clearingState: elem.clearingState ?? '' },
                    elem['_links']['self']['href'].substring(elem['_links']['self']['href'].lastIndexOf('/') + 1),
                    elem['_links']['self']['href'].substring(elem['_links']['self']['href'].lastIndexOf('/') + 1),
                ])
            },
            total: (data: EmbeddedProjects) => data.page.totalElements,
            headers: { Authorization: `${session.user.access_token}` },
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
                    key: 'Customer Project',
                    text: t('Customer Project'),
                },
                {
                    key: 'Internal Project',
                    text: t('Internal Project'),
                },
                {
                    key: 'Product',
                    text: t('Product'),
                },
                {
                    key: 'Service',
                    text: t('Service'),
                },
                {
                    key: 'Inner Source',
                    text: t('Inner Source'),
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
                    key: 'Active',
                    text: t('Active'),
                },
                {
                    key: 'PhaseOut',
                    text: t('PhaseOut'),
                },
                {
                    key: 'Unknown',
                    text: t('Unknown'),
                },
            ],
            paramName: 'state',
        },
        {
            fieldName: t('Clearing State'),
            value: [
                {
                    key: 'Open',
                    text: t('Open'),
                },
                {
                    key: 'In Progress',
                    text: t('In Progress'),
                },
                {
                    key: 'Closed',
                    text: t('Closed'),
                },
            ],
            paramName: 'clearingState',
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
            <ImportSBOMModal importSBOMMetadata={importSBOMMetadata} setImportSBOMMetadata={setImportSBOMMetadata} />
            <DeleteProjectDialog projectId={deleteProjectId} show={deleteDialogOpen} setShow={setDeleteDialogOpen} />
            <div className='mx-3 mt-3'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <AdvancedSearch title='Advanced Search' fields={advancedSearch} />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between ms-1'>
                            <div className='col-lg-5'>
                                <div className='row'>
                                    <div className='btn-group col-auto' role='group'>
                                        <button className='btn btn-primary' onClick={handleAddProject}>
                                            {t('Add Project')}
                                        </button>
                                        <Dropdown>
                                            <Dropdown.Toggle variant='secondary'>{t('Import SBOM')}</Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => setImportSBOMMetadata({ importType: 'SPDX', show: true })}>{t('SPDX')}</Dropdown.Item>
                                                <Dropdown.Item onClick={() => setImportSBOMMetadata({ importType: 'CycloneDx', show: true })}>{t('CycloneDX')}</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    <Dropdown className='col-auto'>
                                        <Dropdown.Toggle variant='secondary'>{t('Export Spreadsheet')}</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item>{t('Projects only')}</Dropdown.Item>
                                            <Dropdown.Item>{t('Projects with linked releases')}</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className='col-auto buttonheader-title'>{t('PROJECTS')}</div>
                        </div>
                        {status === 'authenticated' ? (
                            <Table columns={columns} server={initServerPaginationConfig(session)} selector={true} sort={false} />
                        ) : (
                            <div className='col-12 d-flex justify-content-center align-items-center'>
                                <Spinner className='spinner' />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Project
