// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Alert, Button } from 'react-bootstrap'
import SW360Table from '@/components/sw360/SW360Table/SW360Table'
import Link from 'next/link'
import { _ } from 'gridjs-react'
import { Form } from 'react-bootstrap'
import ChangeStateDialog from './ChangeStateDialog'
import { useState } from 'react'
import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import VulnerabilitiesVerificationState from '@/object-types/enums/VulnerabilitiesVerificationState'

interface Props {
    vulnerData: Array<any>
}

const noRecordsFound = 'No data available in table'

const ComponentVulnerabilities = ({ vulnerData }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [state, setState] = useState('NOT_CHECKED')

    const columns = [
        {
            name: _(<Form.Check type='checkbox'></Form.Check>),
            formatter: (externalId: string) => _(<Form.Check type='checkbox'></Form.Check>),
        },
        {
            name: t('Release'),
            sort: true,
        },
        {
            name: t('External Id'),
            formatter: ([externalId, id]: Array<string>) =>
                _(
                    <Link href={'/vulnerabilites/detail/' + id} className='link'>
                        {externalId}
                    </Link>
                ),
            sort: true,
        },
        {
            name: t('Priority'),
            sort: true,
        },
        {
            name: t('Matched by'),
            sort: true,
        },
        {
            name: t('Title'),
            sort: true,
        },
        {
            name: t('Verification'),
            sort: true,
        },
        t('Action'),
    ]

    const handleClick = useCallback(() => setDialogOpen(true), [])

    const handleChangeState = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setState(event.target.value)
    }

    const data = Object.entries(vulnerData).map(([index, item]: any) => [
        item.externalId,
        item.intReleaseName,
        [item.externalId, item.releaseVulnerabilityRelation.vulnerabilityId],
        item.priority,
        item.releaseVulnerabilityRelation.matchedBy,
        item.title,
        t(item.releaseVulnerabilityRelation.verificationStateInfo.at(-1).verificationState),
        item.projectAction,
    ])

    return (
        <div className='row'>
            <div className='col-12'>
                <Alert variant='primary'>
                    {t('Total vulnerabilities')}: <b>{vulnerData.length}</b>
                </Alert>
            </div>
            <div className='col-12'>
                <h5
                    style={{
                        color: '#5D8EA9',
                        borderBottom: '1px solid #5D8EA9',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                    }}
                >
                    VULNERABILITIES
                </h5>
                <SW360Table columns={columns} data={data} noRecordsFound={noRecordsFound} />
                <Form.Group className='mb-3' controlId='createdOn'>
                    <Form.Label>
                        <b>{t('Change verification state of selected vulnerabilities to')}</b>
                    </Form.Label>
                    <Form.Select
                        size='sm'
                        onChange={handleChangeState}
                        style={{
                            display: 'inline-block',
                            width: '170px',
                            marginLeft: '0.75rem',
                            padding: '8px',
                            marginRight: '0.75rem',
                            fontWeight: '500',
                        }}
                    >
                        {Object.values(VulnerabilitiesVerificationState).map(
                            (item): JSX.Element => (
                                <option key={item} value={item}>
                                    {' '}
                                    {t(item)}{' '}
                                </option>
                            )
                        )}
                    </Form.Select>
                    <Button onClick={handleClick}>{t('Change State')}</Button>
                </Form.Group>
                <h5
                    style={{
                        color: '#5D8EA9',
                        borderBottom: '1px solid #5D8EA9',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                    }}
                >
                    VULNERABILITY MATCHING STATISTICS
                </h5>
            </div>
            <ChangeStateDialog show={dialogOpen} setShow={setDialogOpen} state={state} />
        </div>
    )
}

export default ComponentVulnerabilities
