// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import { Component, Embedded } from '@/object-types'
import { CommonUtils } from '@/utils'
import { useSession } from 'next-auth/react'
import { SW360_API_URL } from '@/utils/env'
import { Table, _ } from 'next-sw360'
import { Form } from 'react-bootstrap'

type EmbeddedComponents = Embedded<Component, 'sw360:components'>

export default function ComponentTable({ component, setComponent }: Readonly<{ component: Component | null, setComponent: Dispatch<SetStateAction<null | Component>> }>): ReactNode {
    const t = useTranslations('default')
    const { data: session } = useSession()

    const columns = [
        {
            id: 'components.merge.select',
            width: '5%',
            formatter: (comp: Component) => _(<Form.Check type='radio' checked={component !== null && comp.id === component.id} onChange={() => setComponent(comp)}></Form.Check>),
        },
        {
            id: 'components.merge.name',
            name: t('Component Name'),
            width: '40%',
            sort: true,
        },
        {
            id: 'components.merge.createdBy',
            name: t('Created by'),
            width: '40%',
            sort: true,
        },
        {
            id: 'components.merge.releases',
            name: t('Releases'),
            width: '8%',
        }
    ]

    const initServerPaginationConfig = () => {
        if (CommonUtils.isNullOrUndefined(session)) return
        
        return {
            url: `${SW360_API_URL}/resource/api/components?allDetails=true`,
            then: (data: EmbeddedComponents) => {
                return data._embedded['sw360:components'].map((elem: Component) => {                    
                    return [
                        elem,
                        elem.name,
                        elem._embedded?.createdBy?.fullName ?? '',
                        elem._embedded?.['sw360:releases']?.length ?? 0
                    ]
                })
            },
            total: (data: EmbeddedComponents) => data.page?.totalElements ?? 0,
            headers: { Authorization: `${session.user.access_token}` },
        }
    }

    return (
        <Table columns={columns} selector={true} server={initServerPaginationConfig()} />
    )
}