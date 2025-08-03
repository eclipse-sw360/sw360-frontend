// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState, type JSX } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'

import VerificationTooltip from '@/components/VerificationTooltip/VerificationTooltip'
import { LinkedVulnerability, VerificationStateInfo, VulnerabilitiesVerificationState } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { Table, _ } from 'next-sw360'
import ChangeStateDialog from './ChangeStateDialog'
import VulnerabilitiesMatchingStatistics from './VulnerabilityMatchingStatistics'

interface Props {
    vulnerData: Array<LinkedVulnerability>
}

interface SelectedVulnerability {
    releaseId: string
    vulnerExternalId: string
    index: string
}

type RowData = (string | string[] | VerificationStateInfo[] | FirstCellData)[]

interface FirstCellData {
    index: string
    checked: boolean
    releaseId: string
    vulnerExternalId: string
}

const ComponentVulnerabilities = ({ vulnerData }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [state, setState] = useState('NOT_CHECKED')
    const [data, setData] = useState<RowData[]>([])
    const [selectedVulner, setSelectedVulner] = useState<Array<SelectedVulnerability>>([])
    const [checkAll, setCheckAll] = useState<boolean>(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const handleCheckBox = (index: string, checked: boolean) => {
        const newData = Object.entries(data).map(([i, rowData]) => {
            const firstCell = rowData[0] as FirstCellData

            if (i === index) {
                rowData[0] = {
                    ...firstCell,
                    checked: !checked,
                }
            }
            return rowData
        })

        setData(newData)
    }

    const handleCheckAll = () => {
        const newData = Object.values(data).map((rowData) => {
            const firstCell = rowData[0] as FirstCellData

            rowData[0] = {
                ...firstCell,
                checked: !checkAll,
            }
            return rowData
        })

        setData(newData)
        setCheckAll((prev) => !prev)
    }

    const handleClick = () => {
        const selectingVulner = Object.entries(data)
            .map(([index, item]) => {
                const firstCell = item[0] as FirstCellData

                if (firstCell.checked === true) {
                    return {
                        releaseId: firstCell.releaseId,
                        vulnerExternalId: firstCell.vulnerExternalId,
                        index: index,
                    }
                }
            })
            .filter((element) => element !== undefined)

        setSelectedVulner(selectingVulner as Array<SelectedVulnerability>)
        setDialogOpen(true)
    }

    const columns = [
        {
            id: 'check',
            name: _(
                <Form.Check
                    defaultChecked={checkAll}
                    type='checkbox'
                    onClick={handleCheckAll}
                ></Form.Check>,
            ),
            formatter: ({ checked, index }: { checked: boolean; index: string }) =>
                _(
                    <Form.Check
                        defaultChecked={checked}
                        onClick={() => handleCheckBox(index, checked)}
                        type='checkbox'
                    ></Form.Check>,
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
                    <Link
                        href={'/vulnerabilites/detail/' + id}
                        className='link'
                    >
                        {externalId}
                    </Link>,
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
                verificationStateInfos.length > 0 &&
                _(
                    <VerificationTooltip verificationStateInfos={verificationStateInfos}>
                        <FaInfoCircle style={{ marginRight: '5px', color: 'gray', width: '15px', height: '15px' }} />
                        {verificationStateInfos.at(-1)?.verificationState}
                    </VerificationTooltip>,
                ),
            sort: true,
        },
        t('Action'),
    ]

    useEffect(() => {
        const mappedData = Object.entries(vulnerData).map(([index, item]) => [
            {
                index: index,
                checked: false,
                releaseId: item.releaseVulnerabilityRelation.releaseId,
                vulnerExternalId: item.externalId,
            },
            item.intReleaseName ?? '',
            [item.externalId, item.releaseVulnerabilityRelation.vulnerabilityId],
            item.priority ?? '',
            item.releaseVulnerabilityRelation.matchedBy,
            item.title ?? '',
            item.releaseVulnerabilityRelation.verificationStateInfo ?? [],
            item.projectAction ?? '',
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
                <Table
                    columns={columns}
                    data={data}
                    selector={true}
                />
                <Form.Group
                    className='mb-3'
                    controlId='createdOn'
                >
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
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {' '}
                                    {t(item)}{' '}
                                </option>
                            ),
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
            />
        </div>
    )
}

export default ComponentVulnerabilities
