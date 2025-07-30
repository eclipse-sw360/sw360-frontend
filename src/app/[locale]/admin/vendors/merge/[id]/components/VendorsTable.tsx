// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, Vendor } from '@/object-types'
import { CommonUtils } from '@/utils'
import { SW360_API_URL } from '@/utils/env'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import { Dispatch, ReactNode, SetStateAction, useEffect } from 'react'
import { Form, Spinner } from 'react-bootstrap'

type EmbeddedVendors = Embedded<Vendor, 'sw360:vendors'>

export default function VendorTable({
    vendor,
    setVendor,
}: Readonly<{ vendor: Vendor | null; setVendor: Dispatch<SetStateAction<null | Vendor>> }>): ReactNode {
    const t = useTranslations('default')
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const columns = [
        {
            id: 'vendors.merge.select',
            width: '5%',
            formatter: (vend: Vendor) =>
                _(
                    <Form.Check
                        type='radio'
                        checked={
                            vendor !== null &&
                            vend._links?.self.href.split('/').at(-1) === vendor._links?.self.href.split('/').at(-1)
                        }
                        onChange={() => setVendor(vend)}
                    ></Form.Check>,
                ),
        },
        {
            id: 'vendors.merge.fullName',
            name: t('Vendor Full Name'),
            sort: true,
        },
        {
            id: 'vendors.merge.shortName',
            name: t('Vendor Short Name'),
            sort: true,
        },
        {
            id: 'vendors.merge.url',
            name: t('URL'),
            sort: true,
        },
    ]

    const initServerPaginationConfig = () => {
        if (CommonUtils.isNullOrUndefined(session)) return

        return {
            url: `${SW360_API_URL}/resource/api/vendors`,
            then: (data: EmbeddedVendors) => {
                return data._embedded['sw360:vendors'].map((elem: Vendor) => {
                    return [elem, elem.fullName ?? '', elem.shortName ?? '', elem.url ?? '']
                })
            },
            total: (data: EmbeddedVendors) => data.page?.totalElements ?? 0,
            headers: { Authorization: `${session.user.access_token}` },
        }
    }

    return (
        <>
            {status === 'authenticated' ? (
                <Table
                    columns={columns}
                    selector={true}
                    server={initServerPaginationConfig()}
                />
            ) : (
                <div className='col-12 d-flex justify-content-center align-items-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </>
    )
}
