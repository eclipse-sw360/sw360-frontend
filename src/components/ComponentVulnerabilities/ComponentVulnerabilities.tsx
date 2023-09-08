// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Alert, Button } from 'react-bootstrap'
import Link from 'next/link'
import { Form } from 'react-bootstrap'

import ChangeStateDialog from './ChangeStateDialog'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import VulnerabilitiesVerificationState from '@/object-types/enums/VulnerabilitiesVerificationState'

import { Table, _ } from '@/components/sw360'
import { LinkedVulnerability, VerificationStateInfo } from '@/object-types/LinkedVulnerability'
import { Session } from '@/object-types/Session'
import VulnerabilitiesMatchingStatistics from './VulnerabilityMatchingStatistics'
import VerificationTooltip from '@/components/VerificationTooltip/VerificationTooltip'
import { FaInfoCircle } from 'react-icons/fa'

interface Props {
    vulnerData: Array<LinkedVulnerability>
    session: Session
}

const ComponentVulnerabilities = ({ vulnerData, session }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [state, setState] = useState('NOT_CHECKED')
    const [data, setData] = useState([])
    const [selectedVulner, setSelectedVulner] = useState<Array<any>>([])
    const [checkAll, setCheckAll] = useState<boolean>(false)

    const handleCheckBox = (index: number, checked: boolean) => {
        const newData = Object.entries(data).map(([i, rowData]: any) => {
            if (i == index) {
                rowData[0] = {
                    ...rowData[0],
                    checked: !checked,
                }
            }
            return rowData
        })

        setData(newData)
    }

    const handleCheckAll = () => {
        const newData = Object.entries(data).map(([, rowData]: any) => {
            rowData[0] = {
                ...rowData[0],
                checked: !checkAll,
            }
            return rowData
        })

        setData(newData)
        setCheckAll((prev) => !prev)
    }

    const handleClick = () => {
        const selectingVulner = Object.entries(data)
            .map(([index, item]: any) => {
                if (item[0].checked === true) {
                    return {
                        releaseId: item[0].releaseId,
                        vulnerExternalId: item[0].vulnerExternalId,
                        index: index,
                    }
                }
            })
            .filter((element) => element !== undefined)

        setSelectedVulner(selectingVulner)
        setDialogOpen(true)
    }

    const columns = [
        {
            id: 'check',
            name: _(<Form.Check defaultChecked={checkAll} type='checkbox' onClick={handleCheckAll}></Form.Check>),
            formatter: ({ checked, index }: any) =>
                _(
                    <Form.Check
                        defaultChecked={checked}
                        onClick={() => handleCheckBox(index, checked)}
                        type='checkbox'
                    ></Form.Check>
                ),
            sort: false,
        },
        {
            id: 'release',
            name: t('Release'),
            sort: true,
        },
        {
            id: 'externalId',
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
            id: 'priority',
            name: t('Priority'),
            sort: true,
        },
        {
            id: 'matchedBy',
            name: t('Matched by'),
            sort: true,
        },
        {
            id: 'title',
            name: t('Title'),
            sort: true,
        },
        {
            id: 'verification',
            name: t('Verification'),
            formatter: (verificationStateInfos: Array<VerificationStateInfo>) =>
                _(
                    <VerificationTooltip verificationStateInfos={verificationStateInfos}>
                        <FaInfoCircle style={{ marginRight: '5px', color: 'gray', width: '15px', height: '15px' }} />
                        {t(verificationStateInfos.at(-1).verificationState)}
                    </VerificationTooltip>
                ),
            sort: true,
        },
        t('Action'),
    ]

    useEffect(() => {
        const mappedData = Object.entries(vulnerData).map(([index, item]: any) => [
            {
                index: index,
                checked: false,
                releaseId: item.releaseVulnerabilityRelation.releaseId,
                vulnerExternalId: item.externalId,
            },
            item.intReleaseName,
            [item.externalId, item.releaseVulnerabilityRelation.vulnerabilityId],
            item.priority,
            item.releaseVulnerabilityRelation.matchedBy,
            item.title,
            item.releaseVulnerabilityRelation.verificationStateInfo,
            item.projectAction,
        ])
        setData(mappedData)
    }, [vulnerData])

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
                        textTransform: 'uppercase',
                    }}
                >
                    {t('Vulnerabilities')}
                </h5>
                <Table columns={columns} data={data} selector={true} />
                <Form.Group className='mb-3' controlId='createdOn'>
                    <Form.Label>
                        <b>{t('Change verification state of selected vulnerabilities to')}</b>
                    </Form.Label>
                    <Form.Select
                        size='sm'
                        onChange={(event) => setState(event.target.value)}
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
                <VulnerabilitiesMatchingStatistics vulnerData={vulnerData} />
            </div>
            <ChangeStateDialog
                show={dialogOpen}
                setShow={setDialogOpen}
                state={state}
                selectedVulner={selectedVulner}
                session={session}
            />
        </div>
    )
}

export default ComponentVulnerabilities
