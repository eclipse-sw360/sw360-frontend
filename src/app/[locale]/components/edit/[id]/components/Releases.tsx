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
import Link from 'next-intl/link'
import { notFound, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { Table, _ } from '@/components/sw360'
import { EmbeddedLinkedReleases, HttpStatus, LinkedRelease } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

interface Props {
    componentId: string
}

const Releases = ({ componentId }: Props) => {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const [linkedReleases, setLinkedReleases] = useState([])
    const router = useRouter()

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as EmbeddedLinkedReleases
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },
        [session]
    )

    useEffect(() => {
        void fetchData(`components/${componentId}/releases`).then((releaseLinks: EmbeddedLinkedReleases) => {
            if (
                !CommonUtils.isNullOrUndefined(releaseLinks._embedded) &&
                !CommonUtils.isNullOrUndefined(releaseLinks._embedded['sw360:releaseLinks'])
            ) {
                const data = releaseLinks._embedded['sw360:releaseLinks'].map((item: LinkedRelease) => [
                    item.name,
                    [item.id, item.version],
                ])
                setLinkedReleases(data)
            }
        })
    }, [componentId, fetchData])

    const columns = [
        {
            name: t('Name'),
            sort: true,
        },
        {
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
