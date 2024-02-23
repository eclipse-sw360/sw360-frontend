// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, ECC } from '@/object-types'
import { SW360_API_URL } from '@/utils/env'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { QuickFilter, Table, _ } from 'next-sw360'
import { Spinner } from 'react-bootstrap'

type EmbeddedECC = Embedded<ECC, 'sw360:releases'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

export default function ECC() {
    const t = useTranslations('default')
    const { data: session, status } = useSession()

    const columns = [
        {
            id: 'ecc.status',
            name: t('Status'),
            sort: true,
        },
        {
            id: 'ecc.releaseName',
            name: t('Release name'),
            formatter: ({ name, version }: { id: string; name: string; version: string }) =>
            _(
                <div>
                        {`${name} (${version})`}
                </div>
            ),
            sort: true,
        },
        {
            id: 'ecc.releaseVersion',
            name: t('Release version'),
            sort: true,
        },
        {
            id: 'ecc.creatorGroup',
            name: t('Creator Group'),
            sort: true,
        },
        {
            id: 'ecc.eccAssessor',
            name: t('ECC Assessor'),
            sort: true,
        },
        {
            id: 'ecc.eccAssessorGroup',
            name: t('ECC Assessor Group'),
            sort: true,
        },
        {
            id: 'ecc.eccAssessmentDate',
            name: t('ECC Assessment Date'),
            sort: true,
        },
    ]

    const server = {
        url: `${SW360_API_URL}/resource/api/ecc`,
        then: (data: EmbeddedECC) => {
            return data._embedded['sw360:releases'].map((elem: ECC) => [
                Capitalize(elem.eccInformation.eccStatus ?? ''),
                {
                    version: elem.version ?? '',
                    name: elem.name ?? '',
                },
                elem.version ?? '',
                elem.eccInformation.creatorGroup ?? '',
                elem.eccInformation.assessorContactPerson ?? '',
                elem.eccInformation.assessorDepartment ?? '',
                elem.eccInformation.assessmentDate ?? '',
                elem.eccInformation.eccn ?? '',
            ])
        },
        total: (data: EmbeddedECC) => data.page.totalElements,
        headers: { Authorization: `Bearer ${status === 'authenticated' ? session.user.access_token : ''}` },
    }

    return (
        <>
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <div className='row mb-3'>
                            <QuickFilter id='vunerabilities.quickSearch' />
                        </div>
                    </div>
                    <div className='col-lg-10'>
                        <div className='buttonheader-title ms-1'>
                            {t('ECC Overview')}
                        </div>
                        <div className='row mt-3'>
                            {status === 'authenticated' ? (
                                <Table columns={columns} server={server} selector={true} sort={false} />
                            ) : (
                                <div className='col-12 d-flex justify-content-center align-items-center'>
                                    <Spinner className='spinner' />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}