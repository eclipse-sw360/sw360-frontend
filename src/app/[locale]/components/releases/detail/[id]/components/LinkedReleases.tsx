// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'

import { TreeTable } from '@/components/sw360'
import { Embedded, NodeData, ReleaseLink } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

type EmbeddedReleaseLinks = Embedded<ReleaseLink, 'sw360:releaseLinks'>
interface Props {
    releaseId: string
}

const LinkedReleases = ({ releaseId }: Props) : ReactNode => {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const [data, setData] = useState<Array<NodeData>>([])

    useEffect(() => {
        if (CommonUtils.isNullOrUndefined(session))
            return

        const convertNodeData = (children: Array<ReleaseLink>): Array<NodeData> => {
            const childrenNodeData: Array<NodeData> = []
            children.forEach((child: ReleaseLink) => {
                const convertedNode: NodeData = {
                    rowData: [
                        <a
                            key={child.id}
                            href={`${window.location.origin}/components/releases/detail/${child.id}`}
                        >{`${child.name} ${child.version}`}</a>,
                        t(child.releaseRelationship as never),
                        CommonUtils.isNullEmptyOrUndefinedArray(child.licenseIds) ? '' : child.licenseIds.join(', '),
                        t(child.clearingState as never),
                    ],
                    children: child._embedded ? convertNodeData(child._embedded['sw360:releaseLinks']) : [],
                }
                childrenNodeData.push(convertedNode)
            })
            return childrenNodeData
        }

        ApiUtils.GET(`releases/${releaseId}/releases?transitive=true`, session.user.access_token)
            .then((response) => response.json())
            .then((data: EmbeddedReleaseLinks) => {
                const convertedTreeData: Array<NodeData> = []
                data._embedded['sw360:releaseLinks'].forEach((node: ReleaseLink) => {
                    const convertedNode: NodeData = {
                        rowData: [
                            <a
                                key={node.id}
                                href={`${window.location.origin}/components/releases/detail/${node.id}`}
                            >{`${node.name} ${node.version}`}</a>,
                            t(node.releaseRelationship as never),
                            CommonUtils.isNullEmptyOrUndefinedArray(node.licenseIds)
                                ? ''
                                : node.licenseIds.join(', '),
                            t(node.clearingState as never),
                        ],
                        children: node._embedded ? convertNodeData(node._embedded['sw360:releaseLinks']) : [],
                    }
                    convertedTreeData.push(convertedNode)
                })
                setData(convertedTreeData)
            })
            .catch((err) => console.log(err))
    }, [releaseId, session, t])

    const columns = [
        {
            name: t('Name'),
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
                <TreeTable data={data} setData={setData} columns={columns} />
            </div>
        </>
    )
}

export default LinkedReleases
