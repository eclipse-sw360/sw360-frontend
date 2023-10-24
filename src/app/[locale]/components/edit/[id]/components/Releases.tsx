// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Table, _ } from '@/components/sw360'
import { HttpStatus, LinkedRelease } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

interface Props {
    componentId: string
}

const Releases = ({ componentId }: Props) => {
    const t = useTranslations('default')
    const params = useSearchParams()
    const { data: session } = useSession()
    const [linkedReleases, setLinkedReleases] = useState([])
    const router = useRouter()

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        ;(async () => {
            try {
                const queryUrl = CommonUtils.createUrlWithParams(
                    `components/${componentId}/releases`,
                    Object.fromEntries(params)
                )
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const releaseLinks = await response.json()
                if (
                    !CommonUtils.isNullOrUndefined(releaseLinks._embedded) &&
                    !CommonUtils.isNullOrUndefined(releaseLinks._embedded['sw360:releaseLinks'])
                ) {
                    setLinkedReleases(
                        releaseLinks._embedded['sw360:releaseLinks'].map((item: LinkedRelease) => [
                            item.name,
                            [item.id, item.version],
                        ])
                    )
                }
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [params, session, componentId])

    const columns = [
        {
            id: 'name',
            name: t('Name'),
            sort: true,
        },
        {
            id: 'version',
            name: t('Version'),
            formatter: ([id, version]: Array<string>) =>
                _(
                    <Link href={'/components/releases/detail/' + id} className='link'>
                        {version}
                    </Link>
                ),
            sort: true,
        },
    ]
    const handleAddReleaseClick = () => {
        router.push(`/components/edit/${componentId}/release/add`)
    }

    return (
        <>
            <div className='row'>
                <Table data={linkedReleases} search={true} columns={columns} />
            </div>
            <div>
                <button type='button' onClick={() => handleAddReleaseClick()} className={`fw-bold btn btn-secondary`}>
                    {t('Add Release')}
                </button>
            </div>
        </>
    )
}

export default Releases
