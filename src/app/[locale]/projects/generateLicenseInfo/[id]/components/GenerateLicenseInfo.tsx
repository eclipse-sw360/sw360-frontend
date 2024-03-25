// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Table, _ } from "next-sw360"
import { useTranslations } from "next-intl"
import { Button, Col, Form, Row } from "react-bootstrap"
import Link from "next/link"

interface Props {
    projectId: string
    projectName?: string
    projectVersion?: string
}

export default function GenerateLicenseInfo({projectId,
                                                  projectName,
                                                  projectVersion
                                                  }: Props) {
    const t = useTranslations('default')
    const handleDownloadLicenseInfo = (projectId: string) => {
        console.log('download license info', projectId, projectName, projectVersion)
    }

    const columns = [
        {
            id: 'genereateLicenseInfo.checkbox',
            name: _(<Form.Check defaultChecked={true} type='checkbox'></Form.Check>),
            formatter: (id: string) =>
                (
                    <div className='form-check text-center'>
                        <input className='form-check-input' type='checkbox' value={id} id={id} />
                    </div>
                ),
            width: '5%',
            sort: false,
        },
        {
            id: 'genereateLicenseInfo.Lvl',
            name: t('Lvl'),
            formatter: (lvl: string) => _(<div className='text-center'>{lvl}</div>),
            width: '8%',
            sort: true,
        },
        {
            id: 'genereateLicenseInfo.name',
            name: t('Name'),
            width: '18%',
            formatter: (id: string, name: string) =>
                _(
                    <Link href={`/component/release/detail/${id}`} className='text-link text-center'>
                        {name}
                    </Link>
                ),
            sort: true,
        },
        {
            id: 'genereateLicenseInfo.type',
            name: t('Type'),
            width: '10%',
            formatter: (type: string) => _(<div className='text-center'>{type}</div>),
            sort: true,
        },
        {
            id: 'genereateLicenseInfo.clearingState',
            name: t('Clearing State'),
            formatter: (clearingState: string) => _(<div className='text-center'>{clearingState}</div>),
            width: '10%',
            sort: true,
        },
        {
            id: 'genereateLicenseInfo.uploadedBy',
            name: t('Uploaded By'),
            formatter: (uploadedBy: string) => _(<div className='text-center'>{uploadedBy}</div>),
            width: '15%',
            sort: true,
        },
        {
            id: 'genereateLicenseInfo.clearingTeam',
            name: t('Clearing Team'),
            formatter: (clearingTeam: string) => _(<div className='text-center'>{clearingTeam}</div>),
            width: '15%',
            sort: true,
        },
    ]

    return (
        <>
            <div className='container page-content'>
                <div className='row'>
                    <Row className='d-flex justify-content-between'>
                        <Col lg={6} className='buttonheader-title'>
                            {'GENERATE LICENSE INFO'}
                        </Col>
                        <Col lg={4} className='text-truncate buttonheader-title'>
                            {projectId && `${projectId}`}
                        </Col>
                    </Row>
                    <div className='col-lg-12'>
                        <Button
                            variant='primary'
                            className='me-2 py-2 col-auto'
                            onClick={() => handleDownloadLicenseInfo(projectId)}
                        >
                            {t('Download')}
                        </Button>
                        <Button
                            className='me-2 py-2 col-auto'
                            variant='button-plain'
                            style={{ background:'#0c70f2' }}
                        >
                            <span style={{ color: 'white' }}>
                                {t('Show All')}
                            </span>
                        </Button>
                        <Button
                            className='button-plain me-2 py-2 col-auto'
                            variant='secondary'
                        >
                            {t('Only Approved')}
                        </Button>
                        <div className='subscriptionBox my-2' style={{ maxWidth: '98vw',
                                                                       textAlign:'left',
                                                                       fontSize: '15px'}}>
                            {t('No previous selection found If you have writing permissions to this project your selection will be stored automatically when downloading')}
                        </div>
                        <Table columns={columns} data={[]} sort={false}  />
                    </div>
                </div>

            </div>
        </>
    )
}
