// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Table, _ } from 'next-sw360'
import { getSession, signOut,  } from 'next-auth/react'
import { useState, type JSX } from 'react';
import { notFound } from 'next/navigation'
import { ApiUtils, CommonUtils } from '@/utils'
import { HttpStatus, SearchDuplicatesResponse } from '@/object-types'

export default function DatabaseSanitation(): JSX.Element {
    const t = useTranslations('default')
    const [duplicates, setDuplicates] = useState<SearchDuplicatesResponse | null | undefined>(undefined)

    const searchDuplicate = async () => {
        try {
            setDuplicates(null)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return signOut()
            const response = await ApiUtils.GET(
                'databaseSanitation/searchDuplicate',
                session.user.access_token,
            )
            if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else if (response.status !== HttpStatus.OK) {
                return notFound()
            }
            const data = (await response.json() as SearchDuplicatesResponse)
            setDuplicates(data)
        } catch(e)   {
            console.error(e)
        }
    }

    const duplicateReleasesColumns = [
        {
            id: 'duplicateReleases.releaseName',
            name: t('Release Name'),
            sort: true,
        },
        {
            id: 'duplicateReleases.links',
            name: t('Links'),
            formatter: (ids: string[]) =>
                _(
                    <>
                        {ids.map((id, index) => (
                            <>
                                <Link className='text-link' href={`/components/releases/detail/${id}`}>
                                    {index + 1}
                                </Link>
                                {' '}
                            </>
                        ))}
                    </>
                ),
        },
    ]

    const duplicateReleaseSourcesColumns = [
        {
            id: 'duplicateReleaseSources.releaseName',
            name: t('Release Name'),
            sort: true,
        },
        {
            id: 'duplicateReleaseSources.sourceAttachmentsCounts',
            name: t('Source Attachments Counts'),
            formatter: (ids: string[]) =>
                _(
                    <>
                        {ids.length}
                    </>
                ),
        },
    ]

    const duplicateComponentsColumns = [
        {
            id: 'duplicateComponents.componentName',
            name: t('Component Name'),
            sort: true,
        },
        {
            id: 'duplicateComponents.links',
            name: t('Links'),
            formatter: (ids: string[]) =>
                _(
                    <>
                        {ids.map((id, index) => (
                            <>
                                <Link className='text-link' href={`/components/detail/${id}`}>
                                    {index + 1}
                                </Link>
                                {' '}
                            </>
                        ))}
                    </>
                ),
        },
    ]

    const duplicateProjectsColumns = [
        {
            id: 'duplicateProjects.projectName',
            name: t('Project Name'),
            sort: true,
        },
        {
            id: 'duplicateProjects.links',
            name: t('Links'),
            formatter: (ids: string[]) =>
                _(
                    <>
                        <ul>
                            {ids.map((id, index) => (
                                <>
                                    <Link key={index} className='text-link' href={`/projects/detail/${id}`}>
                                        {index + 1}
                                    </Link>
                                    {' '}
                                </>
                            ))}
                        </ul>
                    </>
                ),
        },
    ]

    return (
        <div className='mx-5 mt-3'>
            <div className='d-flex justify-content-between mb-3'>
                <div className="col col-lg-7">
                    <button
                        type='button'
                        className='btn btn-primary col-auto'
                        onClick={() => void searchDuplicate()}
                    >
                        {t('Search duplicate identifiers')}
                    </button>
                </div>
                <div className='col col-auto text-truncate buttonheader-title me-3'>
                    {t('DATABASE ADMINISTRATION')}
                </div>
            </div>
            {
                duplicates === null &&
                <div className="alert alert-primary" role="alert">
                    <p>{t('Searching for duplicate identifiers')}...</p>
                    <div className="progress">
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning w-100" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                </div>
            }
            {
                duplicates &&
                <>
                    <div className="alert alert-warning" role="alert">
                        <p>{t('The following duplicate identifiers were found')}...</p>
                    </div>
                    <div className="mb-3">
                        <h6 className="header-underlined">{t('RELEASES WITH THE SAME IDENTIFIER')}</h6>
                        <Table columns={duplicateReleasesColumns} data={Object.entries(duplicates.duplicateReleases)} sort={false}/>
                    </div>
                    <div className="mb-3">
                        <h6 className="header-underlined">{t('RELEASES WITH MORE THAN ONE SOURCE ATTACHMENT')}</h6>
                        <Table columns={duplicateReleaseSourcesColumns} data={Object.entries(duplicates.duplicateReleaseSources)} sort={false}/>
                    </div>
                    <div className="mb-3">
                        <h6 className="header-underlined">{t('COMPONENTS WITH THE SAME IDENTIFIER')}</h6>
                        <Table columns={duplicateComponentsColumns} data={Object.entries(duplicates.duplicateComponents)} sort={false}/>
                    </div>
                    <div className="mb-3">
                        <h6 className="header-underlined">{t('PROJECTS WITH THE SAME IDENTIFIER')}</h6>
                        <Table columns={duplicateProjectsColumns} data={Object.entries(duplicates.duplicateProjects)} sort={false}/>
                    </div>
                </>
            }
        </div>
    )
}
