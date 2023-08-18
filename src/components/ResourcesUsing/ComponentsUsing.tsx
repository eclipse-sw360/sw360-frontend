// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { _, Table } from '../sw360'
import styles from './ResourceUsing.module.css'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

interface Props {
    componentsUsing: Array<any>
    documentName: string
}

const ComponentsUsing = ({ componentsUsing, documentName }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [tableData, setTableData] = useState([])

    const columns = [
        {
            id: 'vendor',
            name: t('Vendor')
        },
        {
            id: 'name',
            name: t('Name')
        },
        {
            id: 'mainLicenses',
            name: t('Main Licenses')
        },
        {
            id: 'componentType',
            name: t('Component Type')
        }
    ]

    useEffect(() => {
        const data = componentsUsing.map((component: any) => [
            component.defaultVendor?.shortName,
            _(
                <Link key={component._links.self.href.split('/').at(-1)}
                    href={`/components/detail/${component._links.self.href.split('/').at(-1)}`}>
                    {component.name}
                </Link>
            ),
            component.mainLicenseIds.join(', '),
            component.componentType
        ])
        setTableData(data)
    }, [])

    return (
        <>
            <h5 id={styles['upper-case-title']}>
                {`${documentName} ${t('IS USED BY THE FOLLOWING COMPONENTS')}`}
            </h5>
            <Table data={tableData} columns={columns} />
        </>
    )
}

export default ComponentsUsing