// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import CommonUtils from '@/utils/common.utils'
import { FaTrashAlt, FaPencilAlt } from 'react-icons/fa'
import { Form } from 'react-bootstrap'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './ComponentsTable.module.css'
import { signOut } from 'next-auth/react'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import PageSpinner from '@/components/common/spinner/Spinner'
import { useSearchParams } from 'next/navigation'
import DeleteComponentDialog from '../delete-component-dialog/DeleteComponentDialog'
import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { Session } from '@/object-types/Session'

import { Table, _ } from '@/components/sw360'

interface Props {
    session?: Session
}

const ComponentsTable = ({ session }: Props) => {
    const params = useSearchParams()
    const t = useTranslations(COMMON_NAMESPACE)
    const [componentData, setComponentData] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [loading, setLoading] = useState(true)
    const [deletingComponent, setDeletingComponent] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const handleClickDelete = (componentId: any) => {
        setDeletingComponent(componentId)
        setDeleteDialogOpen(true)
    }

    const fetchData: any = useCallback(
        async (queryUrl: string, signal: any) => {
            const componentsResponse = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
            if (componentsResponse.status == HttpStatus.OK) {
                const components = await componentsResponse.json()
                return components
            } else if (componentsResponse.status == HttpStatus.UNAUTHORIZED) {
                signOut()
            } else {
                return []
            }
        },
        [session.user.access_token]
    )

    useEffect(() => {
        setLoading(true)
        const searchParams = Object.fromEntries(params)
        const queryUrl = CommonUtils.createUrlWithParams('components', searchParams)
        const data: any = []

        const parseTableRowData = (item: any) => {
            data.push([
                !CommonUtils.isNullOrUndefined(item.defaultVendor) ? item.defaultVendor.shortName : '',
                [item.id, item.name],
                !CommonUtils.isNullOrUndefined(item.mainLicenseIds) ? item.mainLicenseIds : [],
                item.componentType,
                [item.id, item.name],
            ])
        }

        const controller = new AbortController()
        const signal = controller.signal

        fetchData(queryUrl, signal).then((components: any) => {
            if (!CommonUtils.isNullOrUndefined(components['_embedded']['sw360:components'])) {
                components['_embedded']['sw360:components'].forEach(parseTableRowData)
                setComponentData(data)
                setTotalRows(data.length)
                setLoading(false)
            }
        })

        return () => {
            controller.abort()
        }
    }, [fetchData, params])

    const columns = [
        {
            name: t('Vendor'),
            sort: true,
        },
        {
            name: t('Component Name'),
            formatter: ([id, name]: any) =>
                _(
                    <Link href={'/components/detail/' + id} className='link'>
                        {name}
                    </Link>
                ),
            sort: true,
        },
        {
            name: t('Main Licenses'),
            formatter: (licenseIds: any) =>
                licenseIds.length > 0 &&
                _(
                    Object.entries(licenseIds)
                        .map(([index, item]: any) => (
                            <Link key={item} className='link' href={'/licenses/' + item}>
                                {' '}
                                {item}{' '}
                            </Link>
                        ))
                        .reduce((prev, curr): any => [prev, ', ', curr])
                ),
            sort: true,
        },
        {
            name: t('Component Type'),
            sort: true,
        },
        {
            name: t('Actions'),
            formatter: ([id, name]: any) =>
                _(
                    <span>
                        <Link href={'/components/edit/' + id} style={{ color: 'gray', fontSize: '14px' }}>
                            <FaPencilAlt />
                        </Link>{' '}
                        &nbsp;
                        <FaTrashAlt className={styles['delete-btn']} onClick={() => handleClickDelete(id)} />
                    </span>
                ),
        },
    ]

    return (
        <>
            <div className='row'>
                {loading == false ? (
                    <Table data={componentData} columns={columns} />
                ) : (
                    <div className='col-12' style={{ textAlign: 'center' }}>
                        <PageSpinner />
                    </div>
                )}
            </div>
            <DeleteComponentDialog
                componentId={deletingComponent}
                show={deleteDialogOpen}
                setShow={setDeleteDialogOpen}
            />
        </>
    )
}

export default ComponentsTable
