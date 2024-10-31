// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Component } from '@/object-types'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Table, _ } from '../sw360'
import styles from './ResourceUsing.module.css'

interface Props {
    componentsUsing: Array<Component>
    documentName: string
}

const ComponentsUsing = ({ componentsUsing, documentName }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<(string | JSX.Element)[]>>([])

    const columns = [
        {
            id: 'vendor',
            name: t('Vendor'),
        },
        {
            id: 'name',
            name: t('Name'),
        },
        {
            id: 'mainLicenses',
            name: t('Main Licenses'),
        },
        {
            id: 'componentType',
            name: t('Component Type'),
        },
    ]

    useEffect(() => {
        const data = componentsUsing.map((component: Component) => [
            component.defaultVendor?.shortName ?? '',
            _(
                <Link
                    key={component._links?.self.href.split('/').at(-1)}
                    href={`/components/detail/${component._links?.self.href.split('/').at(-1)}`}
                >
                    {component.name}
                </Link>
            ) as JSX.Element,
            component.mainLicenseIds ? component.mainLicenseIds.join(', ') : '',
            component.componentType ?? '',
        ])
        setTableData(data)
    }, [componentsUsing])

    return (
        <>
            <h5 id={styles['upper-case-title']}>{`${documentName} ${t('IS USED BY THE FOLLOWING COMPONENTS')}`}</h5>
            <Table data={tableData} columns={columns} />
        </>
    )
}

export default ComponentsUsing
