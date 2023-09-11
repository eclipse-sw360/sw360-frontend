// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import Attachment from '@/object-types/Attachment'
import { signOut } from 'next-auth/react'
import HttpStatus from '@/object-types/enums/HttpStatus'
import ApiUtils from '@/utils/api/api.util'
import { Table, _ } from '@/components/sw360'
import AttachmentType from '@/object-types/enums/AttachmentTypes'
import { Button } from 'react-bootstrap'
import SPDXLicenseView from './SPDXLicenseView'
import { Alert } from 'react-bootstrap'
import { FiAlertTriangle } from 'react-icons/fi'

const SPDXAttachments = ({ releaseId, session }: any) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [tableData, setTableData] = useState<Array<any>>([])

    const columns = [
        {
            id: 'name',
            name: t('SPDX Attachments'),
            formatter: ({ isISR, fileName }: any) =>
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
            formatter: ({ isISR, showLicenseClicked, rowIndex, attachmentId }: any) =>
                _(
                    showLicenseClicked ? (
                        isISR == false ? (
                            <Button variant='primary' onClick={() => handleAddSpdxLicenses(rowIndex)}>
                                {t('Add License To Release')}
                            </Button>
                        ) : (
                            <></>
                        )
                    ) : (
                        <Button variant='secondary' onClick={() => handleShowLicenseInfo(rowIndex, attachmentId)}>
                            {t('Show License Info')}
                        </Button>
                    )
                ),
            sort: false,
        },
        {
            id: 'result',
            name: t('Result'),
            formatter: ({
                isISR,
                attachmentName,
                licenseInfo,
                addLicensesState,
            }: {
                isISR: boolean
                attachmentName: string
                licenseInfo: { [key: string]: any }
                addLicensesState: { [key: string]: any }
            }) =>
                _(
                    licenseInfo && (
                        <>
                            {addLicensesState ? (
                                <Alert variant={addLicensesState.variant}>{t(addLicensesState.message)}</Alert>
                            ) : (
                                <SPDXLicenseView
                                    isISR={isISR}
                                    licenseInfo={licenseInfo}
                                    attachmentName={attachmentName}
                                    t={t}
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

        const response = await ApiUtils.POST(
            `releases/${releaseId}/spdxLicenses`,
            requestBody,
            session.user.access_token
        )
        if (response.status == HttpStatus.UNAUTHORIZED) {
            signOut()
        } else {
            updateAddLicenseState(response.status, rowIndex)
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

        const newData = Object.entries(tableData).map(([index, rowData]: any) => {
            if (index === rowIndex) {
                rowData[2] = {
                    ...rowData[2],
                    addLicensesState: addLicensesState,
                }
            }
            return rowData
        })
        setTableData(newData)
    }

    const handleShowLicenseInfo = async (rowIndex: number, attachmentId: string) => {
        const licenseInfo = await fetchData(`releases/${releaseId}/spdxLicensesInfo?attachmentId=${attachmentId}`)

        const newData = Object.entries(tableData).map(([index, rowData]: any) => {
            if (index === rowIndex) {
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

    const fetchData: any = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json()
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                signOut()
            }
        },
        [session.user.access_token]
    )

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
            const data: any = []

            if (cliAndClxAttachments.length !== 0) {
                Object.entries(cliAndClxAttachments).map(([index, attachment]: any) => {
                    data.push(convertAttachmentToRowData(attachment, false, index))
                })
            } else {
                Object.entries(isrAttachments).map(([index, attachment]: any) => {
                    data.push(convertAttachmentToRowData(attachment, true, index))
                })
            }
            setTableData(data)
        }

        fetchData(`releases/${releaseId}/attachments`)
            .then((response: any) => (response._embedded ? response._embedded['sw360:attachmentDTOes'] : []))
            .then((attachments: Array<Attachment>) => {
                const isrAttachments = filterAttachmentByType(attachments, [AttachmentType.INITIAL_SCAN_REPORT])
                const cliAndClxAttachments = filterAttachmentByType(attachments, [
                    AttachmentType.COMPONENT_LICENSE_INFO_XML,
                    AttachmentType.COMPONENT_LICENSE_INFO_COMBINED,
                ])
                convertToTableData(isrAttachments, cliAndClxAttachments)
            })
    }, [releaseId, fetchData])

    return <Table data={tableData} columns={columns} pagination={false} selector={false} />
}

export default SPDXAttachments
