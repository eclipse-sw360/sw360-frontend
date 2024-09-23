// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Alert, Spinner } from 'react-bootstrap'

import { SearchResult } from '@/object-types'
import { useTranslations } from 'next-intl'
import { _, Table } from 'next-sw360'
import KeywordSearch from './KeywordSearch'

export default function Search() {
    const t = useTranslations('default')
    const [data, setData] = useState<SearchResult[] | null>([])

    const columns = [
        {
            id: 'searchResults.type',
            name: t('Type'),
            width: '6%',
            formatter: (type: string) =>
                _(
                    <>
                        {(() => {
                            if (type === 'package') {
                                return (
                                    <svg className='project_icon mb-1' height={18} width={18}>
                                        <use href='icons.svg#project'></use>
                                    </svg>
                                )
                            } else {
                                return (
                                    <svg className={`${type}_icon mb-1`} height={18} width={18}>
                                        <use href={`icons.svg#${type}`}></use>
                                    </svg>
                                )
                            }
                        })()}
                    </>
                ),
            sort: true,
        },
        {
            id: 'searchResults.text',
            name: t('Text'),
            formatter: ({ id, type, name }: { id: string; type: string; name: string }) =>
                _(
                    <>
                        {(() => {
                            if (type === 'project') {
                                return <Link href={`/projects/detail/${id}`}>{name}</Link>
                            } else if (type === 'release') {
                                return <Link href={`/components/releases/detail/${id}`}>{name}</Link>
                            } else if (type === 'component') {
                                return <Link href={`/components/detail/${id}`}>{name}</Link>
                            } else if (type === 'license') {
                                return <Link href={`/licenses/detail/${id}`}>{name}</Link>
                            } else if (type === 'package') {
                                return <Link href={`/packages/detail/${id}`}>{name}</Link>
                            } else if (type === 'obligation') {
                                return <Link href={`/obligations/detail/${id}`}>{name}</Link>
                            } else if (type === 'vendor') {
                                return <p>{name}</p>
                            } else if (type === 'user') {
                                return <p>{name}</p>
                            }
                        })()}
                    </>
                ),
            sort: true,
        },
    ]

    return (
        <>
            <div className='container page-content'>
                <div className='row mt-2'>
                    <div className='col-lg-2'>
                        <KeywordSearch setData={setData} />
                    </div>
                    <div className='col'>
                        <div className='row d-flex justify-content-end'>
                            <div className='col text-truncate buttonheader-title'>
                                {t('SEARCH RESULTS', { datalength: data ? data.length : 0 })}
                            </div>
                        </div>
                        <div className='row'>
                            {!data ? (
                                <div className='col-12' style={{ textAlign: 'center' }}>
                                    <Spinner className='spinner' />
                                </div>
                            ) : (
                                <Table
                                    data={data.map((elem) => [elem.type, elem])}
                                    columns={columns}
                                    pagination={true}
                                    selector={true}
                                />
                            )}
                            <div className='col-lg-8'>
                                <Alert variant='warning' dismissible>
                                    {t.rich('SEARCH_NOTE', {
                                        p: (chunks) => <p>{chunks}</p>,
                                        ul: (chunks) => <ul>{chunks}</ul>,
                                        li: (chunks) => <li>{chunks}</li>,
                                        underline: (chunks) => (
                                            <span className='text-decoration-underline'>{chunks}</span>
                                        ),
                                        bold: (chunks) => <span className='fw-medium'>{chunks}</span>,
                                    })}
                                </Alert>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
