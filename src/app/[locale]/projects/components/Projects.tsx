// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { AdvancedSearch, Table, _ } from '@/components/sw360'
import { ApiUtils, CommonUtils } from '@/utils'
import { HttpStatus, Session } from '@/object-types'
import { notFound, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FaTrashAlt, FaPencilAlt, FaClipboard } from 'react-icons/fa'
import { MdOutlineTask } from 'react-icons/md'
import { signOut } from 'next-auth/react'
import { Spinner } from 'react-bootstrap'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

function Project({ session }: { session: Session }) {
    const [data, setData] = useState<any[]>([])
    const t = useTranslations('default')
    const params = useSearchParams()

    const columns = [
        {
            id: 'projects.name',
            name: t('Project Name'),
            width: '15%',
            formatter: ({ id, name }: { id: string; name: string }) =>
                _(
                    <>
                        <Link href={`/projects/detail/${id}`} className='text-link'>
                            {name}
                        </Link>
                    </>
                ),
            sort: true,
        },
        {
            id: 'projects.description',
            name: t('Description'),
            width: '30%',
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
                                <span className='badge bg-success capsule-left' style={{ fontSize: '0.8rem' }}>
                                    {'PS'}
                                </span>
                            ) : (
                                <span className='badge bg-secondary capsule-left' style={{ fontSize: '0.8rem' }}>
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
                                <span className='badge bg-danger capsule-right' style={{ fontSize: '0.8rem' }}>
                                    {'CS'}
                                </span>
                            ) : clearingState === 'IN_PROGRESS' ? (
                                <span className='badge bg-warning capsule-right' style={{ fontSize: '0.8rem' }}>
                                    {'CS'}
                                </span>
                            ) : (
                                <span className='badge bg-success capsule-right' style={{ fontSize: '0.8rem' }}>
                                    {'CS'}
                                </span>
                            )}
                        </OverlayTrigger>
                    </>
                ),
            sort: true,
        },
        t('License Clearing'),
        {
            id: 'projects.actions',
            name: t('Actions'),
            width: '13%',
            formatter: (id: string) =>
                _(
                    <>
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <Link href={`/projects/edit/${id}`} style={{ color: 'gray', fontSize: '18px' }}>
                                    <FaPencilAlt className='btn-icon' />
                                </Link>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Create Clearing Request')}</Tooltip>}>
                                <span className='d-inline-block'>
                                    <MdOutlineTask className='btn-icon' style={{ color: 'gray', fontSize: '20px' }} />
                                </span>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Duplicate')}</Tooltip>}>
                                <span className='d-inline-block'>
                                    <FaClipboard className='btn-icon' style={{ color: 'gray', fontSize: '18px' }} />
                                </span>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                <span className='d-inline-block'>
                                    <FaTrashAlt className='btn-icon' style={{ color: 'gray', fontSize: '18px' }} />
                                </span>
                            </OverlayTrigger>
                        </span>
                    </>
                ),
            sort: true,
        },
    ]

    const advancedSearch = [
        {
            fieldName: 'Project Name',
            value: '',
            paramName: 'name',
        },
        {
            fieldName: 'Project Version',
            value: '',
            paramName: 'version',
        },
        {
            fieldName: 'Project Type',
            value: [
                {
                    key: 'Customer Project',
                    text: 'Customer Project',
                },
                {
                    key: 'Internal Project',
                    text: 'Internal Project',
                },
                {
                    key: 'Product',
                    text: 'Product',
                },
                {
                    key: 'Service',
                    text: 'Service',
                },
                {
                    key: 'Inner Source',
                    text: 'Inner Source',
                },
            ],
            paramName: 'type',
        },
        {
            fieldName: 'Project Responsible (Email)',
            value: '',
            paramName: 'projectResponsible',
        },
        {
            fieldName: 'Group',
            value: [
                {
                    key: 'None',
                    text: 'None',
                },
            ],
            paramName: 'group',
        },
        {
            fieldName: 'State',
            value: [
                {
                    key: 'Active',
                    text: 'Active',
                },
                {
                    key: 'PhaseOut',
                    text: 'PhaseOut',
                },
                {
                    key: 'Unknown',
                    text: 'Unknown',
                },
            ],
            paramName: 'state',
        },
        {
            fieldName: 'Clearing State',
            value: [
                {
                    key: 'Open',
                    text: 'Open',
                },
                {
                    key: 'In Progress',
                    text: 'In Progress',
                },
                {
                    key: 'Closed',
                    text: 'Closed',
                },
            ],
            paramName: 'clearingState',
        },
        {
            fieldName: 'Tag',
            value: '',
            paramName: 'tag',
        },
        {
            fieldName: 'Additional Data',
            value: '',
            paramName: 'additionalData',
        },
    ]

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const queryUrl = CommonUtils.createUrlWithParams('projects', Object.fromEntries(params))
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const data = await response.json()

                const dataTableFormat =
                    CommonUtils.isNullOrUndefined(data['_embedded']) &&
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:projects'])
                        ? []
                        : data['_embedded']['sw360:projects'].map((elem: any) => [
                              {
                                  id: elem['_links']['self']['href'].substring(
                                      elem['_links']['self']['href'].lastIndexOf('/') + 1
                                  ),
                                  name: elem.name ?? '',
                              },
                              elem.description ?? '',
                              elem.projectResponsible ?? '',
                              { state: elem.state ?? '', clearingState: elem.clearingState ?? '' },
                              '',
                              elem['_links']['self']['href'].substring(
                                  elem['_links']['self']['href'].lastIndexOf('/') + 1
                              ),
                          ])
                setData(dataTableFormat)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [params, session])

    return (
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
                                    <button className='btn btn-primary'>{t('Add Project')}</button>
                                    <Dropdown>
                                        <Dropdown.Toggle variant='secondary'>{t('Import SBOM')}</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item>{t('SPDX')}</Dropdown.Item>
                                            <Dropdown.Item>{t('CycloneDX')}</Dropdown.Item>
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
                    {data ? (
                        <div className='row ps-3'>
                            <Table columns={columns} data={data} selector={true} sort={false} />
                        </div>
                    ) : (
                        <div className='col-12' style={{ textAlign: 'center' }}>
                            <Spinner className='spinner' />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Project
