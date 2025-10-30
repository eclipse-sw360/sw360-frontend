// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, ExpandedState, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { BsCaretRightFill } from 'react-icons/bs'
import { PaddedCell, SW360Table } from '@/components/sw360'
import { NestedRows, TypedEntity } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

interface ViewRelease {
    id: string
    name: string
    version: string
}

type LicenseType = 'Global' | 'Others'

interface ViewObligation {
    topic: string
    text: string
}

interface ObligationsReleaseView {
    processedLicenses: {
        licenseInfo: {
            licenseNamesWithTexts: {
                licenseName: string
                type: string
                obligationsAtProject: ViewObligation[]
            }[]
        }
        release: ViewRelease
    }[]
}

type TypedRelease = TypedEntity<ViewRelease, 'release'>

type TypedLicenseType = TypedEntity<LicenseType, 'type'>

type TypedLicense = TypedEntity<string, 'license'>

type TypedObligation = TypedEntity<ViewObligation, 'obligation'>

export default function ReleaseView({
    projectId,
}: Readonly<{
    projectId: string
}>): ReactNode {
    const t = useTranslations('default')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    const [rowData, setRowData] = useState<
        NestedRows<TypedRelease | TypedLicense | TypedLicenseType | TypedObligation>[]
    >([])
    const memoizedData = useMemo(
        () => rowData,
        [
            rowData,
        ],
    )
    const [expandedState, setExpandedState] = useState<ExpandedState>({})
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = memoizedData.length === 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(
                    `projects/${projectId}/licenseObligations?view=true`,
                    session.data.user.access_token,
                    signal,
                )
                const obligations: ObligationsReleaseView = await response.json()
                const tableData: NestedRows<TypedRelease | TypedLicense | TypedObligation | TypedLicenseType>[] = []
                for (const x of obligations.processedLicenses) {
                    const globalLicenses: NestedRows<TypedRelease | TypedLicense | TypedObligation | TypedLicenseType> =
                        {
                            node: {
                                type: 'type',
                                entity: 'Global',
                            },
                            children: [],
                        }
                    const otherLicenses: NestedRows<TypedRelease | TypedLicense | TypedObligation | TypedLicenseType> =
                        {
                            node: {
                                type: 'type',
                                entity: 'Others',
                            },
                            children: [],
                        }

                    for (const l of x.licenseInfo.licenseNamesWithTexts) {
                        const license: NestedRows<TypedRelease | TypedLicense | TypedObligation | TypedLicenseType> = {
                            node: {
                                type: 'license',
                                entity: l.licenseName,
                            },
                            children: [],
                        }
                        const obligations: NestedRows<
                            TypedRelease | TypedLicense | TypedObligation | TypedLicenseType
                        >[] = []
                        for (const o of l.obligationsAtProject) {
                            const obligation: NestedRows<
                                TypedRelease | TypedLicense | TypedObligation | TypedLicenseType
                            > = {
                                node: {
                                    type: 'obligation',
                                    entity: o,
                                },
                                children: [],
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
                    const relNode: NestedRows<TypedRelease | TypedLicense | TypedObligation | TypedLicenseType> = {
                        node: {
                            type: 'release',
                            entity: x.release,
                        },
                        children: [],
                    }
                    if (globalLicenses.children && globalLicenses.children.length > 0) {
                        relNode.children?.push(globalLicenses)
                    }
                    if (otherLicenses.children && otherLicenses.children.length > 0) {
                        relNode.children?.push(otherLicenses)
                    }
                    tableData.push(relNode)
                }
                setRowData(tableData)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                throw new Error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => {
            controller.abort()
        }
    }, [])

    const columns = useMemo<ColumnDef<NestedRows<TypedRelease | TypedLicense | TypedObligation | TypedLicenseType>>[]>(
        () => [
            {
                id: 'status_hierarchy',
                header: () => (
                    <>
                        {t('Release')}
                        <BsCaretRightFill className='mx-1' />
                        {t('License Type')}
                        <BsCaretRightFill className='mx-1' />
                        {t('Release')}
                        <BsCaretRightFill className='mx-1' />
                        {t('Obligation')}
                    </>
                ),
                cell: ({ row }) => {
                    if (row.original.node.type === 'release') {
                        const { id, name, version } = row.original.node.entity
                        let totalObligations = 0
                        for (const ob of row.original.children?.[0]?.children ?? []) {
                            totalObligations += ob.children?.length ?? 0
                        }
                        for (const ob of row.original.children?.[1]?.children ?? []) {
                            totalObligations += ob.children?.length ?? 0
                        }
                        return (
                            <PaddedCell row={row}>
                                <Link
                                    href={`/component/release/detail/${id}`}
                                    className='text-center text-link'
                                >
                                    {`${name} ${version}`}
                                </Link>
                                <span className='ms-1 pt-1 badge bg-secondary capsule-right capsule-left'>
                                    {`(${totalObligations})`}
                                </span>
                            </PaddedCell>
                        )
                    } else if (row.original.node.type === 'type') {
                        return (
                            <PaddedCell row={row}>
                                <p className='green-cell'>{row.original.node.entity}</p>
                            </PaddedCell>
                        )
                    } else if (row.original.node.type === 'license') {
                        return (
                            <PaddedCell row={row}>
                                <p className='orange-cell'>{row.original.node.entity}</p>
                            </PaddedCell>
                        )
                    } else {
                        return (
                            <PaddedCell row={row}>
                                <p>{row.original.node.entity.topic}</p>
                            </PaddedCell>
                        )
                    }
                },
                meta: {
                    width: '40%',
                },
            },
            {
                id: 'text',
                header: t('Text'),
                cell: ({ row }) => {
                    if (row.original.node.type === 'obligation') {
                        return <p>{row.original.node.entity.text}</p>
                    } else if (row.original.node.type === 'type') {
                        return <p className='green-cell'></p>
                    } else if (row.original.node.type === 'license') {
                        return <p className='orange-cell'></p>
                    }
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'type',
                header: t('Type'),
                cell: ({ row }) => {
                    if (row.original.node.type === 'type') {
                        return <p className='green-cell'></p>
                    } else if (row.original.node.type === 'license') {
                        return <p className='orange-cell'></p>
                    }
                },
            },
            {
                id: 'id',
                header: t('Id'),
                cell: ({ row }) => {
                    if (row.original.node.type === 'type') {
                        return <p className='green-cell'></p>
                    } else if (row.original.node.type === 'license') {
                        return <p className='orange-cell'></p>
                    }
                },
            },
            {
                id: 'status',
                header: t('Status'),
                cell: ({ row }) => {
                    if (row.original.node.type === 'type') {
                        return <p className='green-cell'></p>
                    } else if (row.original.node.type === 'license') {
                        return <p className='orange-cell'></p>
                    }
                },
            },
            {
                id: 'comment',
                header: t('Comment'),
                cell: ({ row }) => {
                    if (row.original.node.type === 'type') {
                        return <p className='green-cell'></p>
                    } else if (row.original.node.type === 'license') {
                        return <p className='orange-cell'></p>
                    }
                },
            },
        ],
        [
            t,
        ],
    )

    const table = useReactTable({
        // table state config
        state: {
            expanded: expandedState,
        },

        data: rowData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // expand config
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => row.original.children !== undefined && row.original.children.length !== 0,
        onExpandedChange: setExpandedState,
    })

    return (
        <div className='mb-3'>
            {table ? (
                <SW360Table
                    table={table}
                    showProcessing={showProcessing}
                />
            ) : (
                <div className='col-12 mt-1 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}
