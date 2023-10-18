// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { Table, _ } from '@/components/sw360'
import { Component, Embedded, Session } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { SW360_API_URL } from '@/utils/env'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import styles from '../components.module.css'
import DeleteComponentDialog from './DeleteComponentDialog'

interface Props {
    session?: Session
    setNumberOfComponent: React.Dispatch<React.SetStateAction<number>>
}

const ComponentsTable = ({ session, setNumberOfComponent }: Props) => {
    const t = useTranslations('default')
    const params = useSearchParams()
    const searchParams = Object.fromEntries(params)
    const [deletingComponent, setDeletingComponent] = useState<string>('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const handleClickDelete = (componentId: string) => {
        setDeletingComponent(componentId)
        setDeleteDialogOpen(true)
    }

    const columns = [
        {
            id: 'vendor',
            name: t('Vendor'),
            sort: true,
        },
        {
            id: 'name',
            name: t('Component Name'),
            formatter: ([id, name]: Array<string>) =>
                _(
                    <Link href={'/components/detail/' + id} className='link'>
                        {name}
                    </Link>
                ),
            sort: true,
        },
        {
            id: 'mainLicenses',
            name: t('Main Licenses'),
            formatter: (licenseIds: Array<string>) =>
                licenseIds.length > 0 &&
                _(
                    Object.entries(licenseIds)
                        .map(
                            ([, item]: Array<string>): React.ReactNode => (
                                <Link key={item} className='link' href={'/licenses/' + item}>
                                    {' '}
                                    {item}{' '}
                                </Link>
                            )
                        )
                        .reduce((prev, curr): React.ReactNode[] => [prev, ', ', curr])
                ),
            sort: true,
        },
        {
            id: 'type',
            name: t('Component Type'),
            sort: true,
        },
        {
            id: 'action',
            name: t('Actions'),
            formatter: (id: string) =>
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

    const server = {
        url: CommonUtils.createUrlWithParams(`${SW360_API_URL}/resource/api/components`, searchParams),
        then: (data: Embedded<Component, 'sw360:components'>) => {
            setNumberOfComponent(data.page.totalElements)
            return data._embedded['sw360:components'].map((item: Component) => [
                !CommonUtils.isNullOrUndefined(item.defaultVendor) ? item.defaultVendor.shortName : '',
                [item.id, item.name],
                !CommonUtils.isNullOrUndefined(item.mainLicenseIds) ? item.mainLicenseIds : [],
                item.componentType,
                item.id,
            ])
        },
        total: (data: Embedded<Component, 'sw360:components'>) => data.page.totalElements,
        headers: { Authorization: `Bearer ${session.user.access_token}` },
    }

    return (
        <>
            <div className='row'>
                <Table columns={columns} selector={true} server={server} />
            </div>
            <DeleteComponentDialog
                componentId={deletingComponent}
                show={deleteDialogOpen}
                setShow={setDeleteDialogOpen}
            />
        </>
    )
}

export default React.memo(ComponentsTable)
