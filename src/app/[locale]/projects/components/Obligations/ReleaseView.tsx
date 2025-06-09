// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { _, TreeTable } from '@/components/sw360'
import { NodeData } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsCaretRightFill } from 'react-icons/bs'

interface ObligationsReleaseView {
    processedLicenses: {
        licenseInfo: {
            licenseNamesWithTexts: {
                licenseName: string
                type: string
                obligationsAtProject: [
                    {
                        topic: string
                        text: string
                    },
                ]
            }[]
        }
        release: {
            id: string
            name: string
            version: string
        }
    }[]
}

export default function ReleaseView({ projectId }: Readonly<{ projectId: string }>): ReactNode {
    const { status } = useSession()
    const t = useTranslations('default')
    const [data, setData] = useState<NodeData[]>()

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(
                    `projects/${projectId}/licenseObligations?view=true`,
                    session.user.access_token,
                    signal,
                )
                const obligations: ObligationsReleaseView = await response.json()
                const tableData: NodeData[] = []
                for (const x of obligations.processedLicenses) {
                    const release_id = x.release.id
                    const globalLicenses: NodeData = {
                        rowData: [
                            <div
                                className={`text-center border-0-cell green-cell`}
                                key={`${release_id}_release_view_global_project_obligation_status`}
                            >
                                {t('Global')}
                            </div>,
                            <div
                                className={`text-center border-0-cell text-truncate green-cell`}
                                key={`${release_id}_release_view_global_text`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell green-cell`}
                                key={`${release_id}_release_view_global_type`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell green-cell`}
                                key={`${release_id}_release_view_global_id`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell green-cell`}
                                key={`${release_id}_release_view_global_status`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell green-cell`}
                                key={`${release_id}_release_view_global_comment`}
                            ></div>,
                        ],
                        children: [],
                        isExpanded: false,
                    }
                    const otherLicenses: NodeData = {
                        rowData: [
                            <div
                                className={`text-center border-0-cell green-cell`}
                                key={`${release_id}_release_view_others_project_obligation_status`}
                            >
                                {t('Others')}
                            </div>,
                            <div
                                className={`text-center border-0-cell text-truncate green-cell`}
                                key={`${release_id}_release_view_others_text`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell green-cell`}
                                key={`${release_id}_release_view_others_type`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell green-cell`}
                                key={`${release_id}_release_view_others_id`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell green-cell`}
                                key={`${release_id}_release_view_others_status`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell green-cell`}
                                key={`${release_id}_release_view_others_comment`}
                            ></div>,
                        ],
                        children: [],
                        isExpanded: false,
                    }

                    for (const l of x.licenseInfo.licenseNamesWithTexts) {
                        const license: NodeData = {
                            rowData: [
                                <div
                                    className={`text-center border-0-cell orange-cell`}
                                    key={`${release_id}_release_view_license_project_obligation_status`}
                                >
                                    {l.licenseName}
                                </div>,
                                <div
                                    className={`text-center border-0-cell text-truncate orange-cell`}
                                    key={`${release_id}_release_view_license_text`}
                                ></div>,
                                <div
                                    className={`text-center border-0-cell orange-cell`}
                                    key={`${release_id}_release_view_license_type`}
                                ></div>,
                                <div
                                    className={`text-center border-0-cell orange-cell`}
                                    key={`${release_id}_release_view_license_id`}
                                ></div>,
                                <div
                                    className={`text-center border-0-cell orange-cell`}
                                    key={`${release_id}_release_view_license_status`}
                                ></div>,
                                <div
                                    className={`text-center border-0-cell orange-cell`}
                                    key={`${release_id}_release_view_license_comment`}
                                ></div>,
                            ],
                            isExpanded: false,
                        }
                        const obligations: NodeData[] = []
                        for (const o of l.obligationsAtProject) {
                            const obligation: NodeData = {
                                rowData: [
                                    <OverlayTrigger
                                        overlay={<Tooltip>{o.topic}</Tooltip>}
                                        key={`${release_id}_release_view_obligation_project_obligation_status`}
                                    >
                                        <div className={`text-center border-0-cell text-truncate`}>{o.topic}</div>
                                    </OverlayTrigger>,
                                    <OverlayTrigger
                                        overlay={<Tooltip>{o.text}</Tooltip>}
                                        key={`${release_id}_release_view_others_text`}
                                    >
                                        <div className={`text-center border-0-cell text-truncate`}>{o.text}</div>
                                    </OverlayTrigger>,
                                    <div
                                        className={`text-center border-0-cell`}
                                        key={`${release_id}_release_view_obligation_type`}
                                    ></div>,
                                    <div
                                        className={`text-center border-0-cell`}
                                        key={`${release_id}_release_view_obligation_id`}
                                    ></div>,
                                    <div
                                        className={`text-center border-0-cell`}
                                        key={`${release_id}_release_view_obligation_status`}
                                    ></div>,
                                    <div
                                        className={`text-center border-0-cell`}
                                        key={`${release_id}_release_view_obligation_comment`}
                                    ></div>,
                                ],
                                isExpanded: false,
                            }
                            obligations.push(obligation)
                        }
                        license.children = obligations
                        if (l.type === 'Global') {
                            globalLicenses.children?.push(license)
                        } else {
                            otherLicenses.children?.push(license)
                        }
                    }
                    const relNode: NodeData = {
                        rowData: [
                            <Link
                                href={`/component/release/detail/${release_id}`}
                                className={`text-center text-link border-0-cell`}
                                key={`${release_id}_release_view_project_obligation_status`}
                            >
                                {`${x.release.name} ${x.release.version}`}
                            </Link>,
                            <div
                                className={`text-center border-0-cell text-truncate`}
                                key={`${release_id}_release_view_text`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell`}
                                key={`${release_id}_release_view_type`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell`}
                                key={`${release_id}_release_view_id`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell`}
                                key={`${release_id}_release_view_status`}
                            ></div>,
                            <div
                                className={`text-center border-0-cell`}
                                key={`${release_id}_release_view_comment`}
                            ></div>,
                        ],
                        children: [],
                        isExpanded: false,
                    }
                    if (globalLicenses.children && globalLicenses.children.length > 0) {
                        relNode.children?.push(globalLicenses)
                    }
                    if (otherLicenses.children && otherLicenses.children.length > 0) {
                        relNode.children?.push(otherLicenses)
                    }
                    tableData.push(relNode)
                }
                setData(tableData)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => {
            controller.abort()
        }
    }, [])

    const columns = [
        {
            id: 'releaseView.status',
            name: _(
                <>
                    {t('Release')}
                    <BsCaretRightFill className='mx-1' />
                    {t('License Type')}
                    <BsCaretRightFill className='mx-1' />
                    {t('Release')}
                    <BsCaretRightFill className='mx-1' />
                    {t('Obligation')}
                </>,
            ),
            width: '40%',
        },
        {
            id: 'releaseView.text',
            name: t('Text'),
            width: '25%',
        },
        {
            id: 'releaseView.type',
            name: t('Type'),
            width: '8%',
        },
        {
            id: 'releaseView.Id',
            name: t('Id'),
            width: '8%',
        },
        {
            id: 'releaseView.status',
            name: t('Status'),
            width: '8%',
        },
        {
            id: 'releaseView.Comment',
            name: t('Comment'),
            width: '10%',
        },
    ]

    if (status === 'unauthenticated') {
        return signOut()
    } else {
        return (
            <div className='ms-1'>
                {data ? (
                    <TreeTable
                        columns={columns}
                        data={data}
                        setData={setData as Dispatch<SetStateAction<NodeData[]>>}
                        selector={true}
                        sort={false}
                    />
                ) : (
                    <div className='col-12 text-center'>
                        <Spinner className='spinner' />
                    </div>
                )}
            </div>
        )
    }
}
