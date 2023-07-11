// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Table, _ } from '@/components/sw360'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { useState, useEffect } from 'react'
import CommonUtils from '@/utils/common.utils'
import Link from 'next/link'
import ReleaseLink from '@/object-types/ReleaseLink'

interface Props {
    release: any
}

const LinkedReleases = ({ release }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [data, setData] = useState([])

    useEffect(() => {
      if (
          !CommonUtils.isNullOrUndefined(release['_embedded']) &&
          !CommonUtils.isNullOrUndefined(release['_embedded']['sw360:releaseLinks'])
      ) {
          const data = release['_embedded']['sw360:releaseLinks'].map((item: ReleaseLink) => [
              [item.name, item.version, item.id],
              t(item.releaseRelationship),
              (CommonUtils.isNullEmptyOrUndefinedArray(item.licenseIds)) ? '' : item.licenseIds.join(', '),
              t(item.clearingState)
          ])
          setData(data)
      }
    }, [])

    const columns = [
        {
            name: t('Name'),
            formatter: ([name, version, id]: Array<string>) =>
                _(
                    <Link href={`/components/releases/detail/${id}`} className='link'>
                        {`${name} ${version}`}
                    </Link>
                ),
        },
        {
            name: t('Release relation'),
        },
        {
            name: t('Licence names'),
        },
        {
            name: t('Clearing State'),
        },
    ]

    return (
        <>
            <div className='row'>
                <Table data={data} search={true} columns={columns} />
            </div>
        </>
    )
}

export default LinkedReleases
