// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { ECC, Embedded } from '@/object-types'
import DownloadService from '@/services/download.service'
import { CommonUtils } from '@/utils'
import { SW360_API_URL } from '@/utils/env'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import Link from 'next/link'
import { Button, Spinner } from 'react-bootstrap'

import type { JSX } from 'react'

type EmbeddedProjectReleaseEcc = Embedded<ECC, 'sw360:releases'>

interface Props {
    projectId: string
    projectName?: string
    projectVersion?: string
}

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

export default function EccDetails({ projectId, projectName, projectVersion }: Props): JSX.Element {
    const t = useTranslations('default')
    const { data: session, status } = useSession()

    const columns = [
        {
            id: 'releases.status',
            name: t('Status'),
            sort: true,
        },
        {
            id: 'releases.name',
            name: t('Release name'),
            formatter: ({ id, name, version }: { id: string; name: string; version: string }) =>
                _(
                    <>
                        <Link
                            href={`/components/releases/detail/${id}`}
                            className='text-link'
                        >
                            {`${name} (${version})`}
                        </Link>
                    </>,
                ),
            sort: true,
        },
        {
            id: 'releases.version',
            name: t('Release version'),
            sort: true,
        },
        {
            id: 'releases.creatorGroup',
            name: t('Creator Group'),
            sort: true,
        },
        {
            id: 'releases.eccAssessor',
            name: t('ECC Assessor'),
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
            id: 'releases.eccAssessorGroup',
            name: t('ECC Assessor Group'),
            sort: true,
        },
        {
            id: 'releases.eccAssessmentDate',
            name: t('ECC Assessment Date'),
            sort: true,
        },
        {
            id: 'releases.eccn',
            name: t('ECCN'),
            sort: true,
        },
    ]

    const initServerPaginationConfig = () => {
        if (CommonUtils.isNullOrUndefined(session)) return
        return {
            url: `${SW360_API_URL}/resource/api/projects/${projectId}/releases/ecc?transitive=true`,
            then: (data: EmbeddedProjectReleaseEcc) => {
                return data._embedded['sw360:releases'].map((elem: ECC) => [
                    Capitalize(elem.eccInformation.eccStatus),
                    {
                        version: elem.version,
                        name: elem.name,
                        id: elem['_links']?.['self']['href'].substring(
                            elem['_links']['self']['href'].lastIndexOf('/') + 1,
                        ),
                    },
                    elem.version,
                    elem.eccInformation.creatorGroup,
                    elem.eccInformation.assessorContactPerson,
                    elem.eccInformation.assessorDepartment,
                    elem.eccInformation.assessmentDate,
                    elem.eccInformation.eccn,
                ])
            },
            total: (data: EmbeddedProjectReleaseEcc) => data.page?.totalElements ?? 0,
            headers: { Authorization: `${status === 'authenticated' ? session.user.access_token : ''}` },
        }
    }

    const exportSpreadsheet = () => {
        try {
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const currentDate = new Date().toISOString().split('T')[0]
            const eccSpreadSheetName = `releases-${projectName}-${projectVersion}-${currentDate}.xlsx`
            const url = `reports?projectId=${projectId}&module=projectReleaseSpreadSheetWithEcc&mimetype=xlsx`
            DownloadService.download(url, session, eccSpreadSheetName)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <Button
                variant='secondary'
                className='col-auto'
                onClick={() => exportSpreadsheet()}
            >
                {t('Export Spreadsheet')}
            </Button>
            {status === 'authenticated' ? (
                <Table
                    columns={columns}
                    server={initServerPaginationConfig()}
                    selector={true}
                    sort={false}
                />
            ) : (
                <div
                    className='col-12'
                    style={{ textAlign: 'center' }}
                >
                    <Spinner className='spinner' />
                </div>
            )}
        </>
    )
}
