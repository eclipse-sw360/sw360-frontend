// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { FiAlertTriangle } from 'react-icons/fi'

import { Attachment, AttachmentType, EmbeddedAttachments, HttpStatus } from '@/object-types'
import { ApiUtils } from '@/utils'
import { Table, _ } from 'next-sw360'
import SPDXLicenseView from './SPDXLicenseView'

interface Props {
    releaseId: string
}

interface CellData {
    isISR?: boolean
    fileName?: string
    showLicenseClicked?: boolean
    rowIndex?: number
    attachmentId?: string
    attachmentName?: string
    licenseInfo?: {
        [key: string]: string | Array<string> | number
    }
    addLicensesState?: { [key: string]: string }
}

const SPDXAttachments = ({ releaseId }: Props) => {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const [tableData, setTableData] = useState<Array<Array<CellData>>>([])

    const columns = [
        {
            id: 'name',
            name: t('SPDX Attachments'),
            formatter: ({ isISR, fileName }: CellData) =>
                _(
                    isISR ? (
                        <>
                            {fileName} <FiAlertTriangle style={{ color: 'red', fontSize: '20px' }} />
                        </>
                    ) : (
                        <>{fileName}</>
                    )
                ),
            sort: false,
        },
        {
            id: 'action',
            name: t('Action'),
            formatter: ({ isISR, showLicenseClicked, rowIndex, attachmentId }: CellData) =>
                _(
                    showLicenseClicked ? (
                        isISR == false ? (
                            <Button variant='primary' onClick={() => void handleAddSpdxLicenses(rowIndex)}>
                                {t('Add License To Release')}
                            </Button>
                        ) : (
                            <></>
                        )
                    ) : (
                        <Button variant='secondary' onClick={() => void handleShowLicenseInfo(rowIndex, attachmentId)}>
                            {t('Show License Info')}
                        </Button>
                    )
                ),
            sort: false,
        },
        {
            id: 'result',
            name: t('Result'),
            formatter: ({ isISR, attachmentName, licenseInfo, addLicensesState }: CellData) =>
                _(
                    licenseInfo && (
                        <>
                            {addLicensesState ? (
                                <Alert variant={addLicensesState.variant}>
                                    {t('VALUE', { value: addLicensesState.message })}
                                </Alert>
                            ) : (
                                <SPDXLicenseView
                                    isISR={isISR}
                                    licenseInfo={licenseInfo}
                                    attachmentName={attachmentName}
                                />
                            )}
                        </>
                    )
                ),
            sort: false,
        },
    ]

    const handleAddSpdxLicenses = async (rowIndex: number) => {
        const requestBody = {
            otherLicenseIds: tableData[rowIndex][2].licenseInfo.otherLicenseIds
                ? tableData[rowIndex][2].licenseInfo.otherLicenseIds
                : [],
            mainLicenseIds: tableData[rowIndex][2].licenseInfo.licenseIds
                ? tableData[rowIndex][2].licenseInfo.licenseIds
                : [],
        }

        try {
            const response = await ApiUtils.POST(
                `releases/${releaseId}/spdxLicenses`,
                requestBody,
                session.user.access_token
            )
            if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                updateAddLicenseState(response.status, rowIndex)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const updateAddLicenseState = (status: number, rowIndex: number) => {
        const addLicensesState =
            status === HttpStatus.OK
                ? {
                      variant: 'success',
                      message: 'Success! Please reload page to see the changes!',
                  }
                : {
                      variant: 'danger',
                      message: 'Error when processing!',
                  }

        const newData = Object.entries(tableData).map(([index, rowData]) => {
            if (index === rowIndex.toString()) {
                rowData[2] = {
                    ...rowData[2],
                    addLicensesState: addLicensesState,
                }
            }
            return rowData
        })
        setTableData(newData)
    }

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as { [key: string]: string | Array<string> } & EmbeddedAttachments
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            }
        },
        [session.user.access_token]
    )

    const handleShowLicenseInfo = async (rowIndex: number, attachmentId: string) => {
        const licenseInfo = await fetchData(`releases/${releaseId}/spdxLicensesInfo?attachmentId=${attachmentId}`)

        const newData = Object.entries(tableData).map(([index, rowData]) => {
            if (index === rowIndex.toString()) {
                rowData[1] = {
                    ...rowData[1],
                    showLicenseClicked: true,
                }
                rowData[2] = {
                    ...rowData[2],
                    licenseInfo: licenseInfo,
                }
            }
            return rowData
        })

        setTableData(newData)
    }

    const filterAttachmentByType = (attachments: Array<Attachment>, types: Array<string>) => {
        return attachments.filter((attachment) => types.includes(attachment.attachmentType))
    }

    useEffect(() => {
        const convertAttachmentToRowData = (attachment: Attachment, isISR: boolean, rowIndex: number) => {
            return [
                { isISR: isISR, fileName: attachment.filename },
                {
                    isISR: isISR,
                    showLicenseClicked: false,
                    rowIndex: rowIndex,
                    attachmentId: attachment.attachmentContentId,
                },
                { isISR: isISR, attachmentName: attachment.filename },
            ]
        }

        const convertToTableData = (isrAttachments: Array<Attachment>, cliAndClxAttachments: Array<Attachment>) => {
            const data: Array<Array<CellData>> = []

            if (cliAndClxAttachments.length !== 0) {
                Object.entries(cliAndClxAttachments).map(([index, attachment]) => {
                    data.push(convertAttachmentToRowData(attachment, false, parseInt(index)))
                })
            } else {
                Object.entries(isrAttachments).map(([index, attachment]) => {
                    data.push(convertAttachmentToRowData(attachment, true, parseInt(index)))
                })
            }
            setTableData(data)
        }

        fetchData(`releases/${releaseId}/attachments`)
            .then((response: EmbeddedAttachments) =>
                response._embedded ? response._embedded['sw360:attachmentDTOes'] : []
            )
            .then((attachments: Array<Attachment>) => {
                const isrAttachments = filterAttachmentByType(attachments, [AttachmentType.INITIAL_SCAN_REPORT])
                const cliAndClxAttachments = filterAttachmentByType(attachments, [
                    AttachmentType.COMPONENT_LICENSE_INFO_XML,
                    AttachmentType.COMPONENT_LICENSE_INFO_COMBINED,
                ])
                convertToTableData(isrAttachments, cliAndClxAttachments)
            })
            .catch((err) => console.error(err))
    }, [releaseId, fetchData])

    return <Table data={tableData} columns={columns} pagination={false} selector={false} />
}

export default SPDXAttachments
