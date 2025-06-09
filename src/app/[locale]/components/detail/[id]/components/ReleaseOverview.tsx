// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import { HiOutlineLink } from 'react-icons/hi'

import fossologyIcon from '@/assets/images/fossology.svg'
import LinkReleaseToProjectModal from '@/components/LinkReleaseToProjectModal/LinkReleaseToProjectModal'
import FossologyClearing from '@/components/sw360/FossologyClearing/FossologyClearing'
import { Embedded, HttpStatus, LinkedRelease, ReleaseLink } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { Table, _ } from 'next-sw360'
import DeleteReleaseModal from './DeleteReleaseModal'

type EmbeddedLinkedReleases = Embedded<LinkedRelease, 'sw360:releaseLinks'>

interface Props {
    componentId: string
    calledFromModerationRequestDetail?: boolean
}

const ReleaseOverview = ({ componentId, calledFromModerationRequestDetail }: Props): ReactNode => {
    const t = useTranslations('default')
    const [data, setData] = useState<Array<Array<string | string[]>>>([])
    const [deletingRelease, setDeletingRelease] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [clearingReleaseId, setClearingReleaseId] = useState<string | undefined>(undefined)
    const [fossologyClearingModelOpen, setFossologyClearingModelOpen] = useState(false)
    const [linkingReleaseId, setLinkingReleaseId] = useState<string | undefined>(undefined)
    const [linkToProjectModalOpen, setLinkToProjectModalOpen] = useState(false)

    const handleClickDelete = (releaseId: string) => {
        setDeletingRelease(releaseId)
        setDeleteModalOpen(true)
    }

    const handleFossologyClearing = (releaseId: string) => {
        setClearingReleaseId(releaseId)
        setFossologyClearingModelOpen(true)
    }

    const handleLinkToProject = (releaseId: string) => {
        setLinkToProjectModalOpen(true)
        setLinkingReleaseId(releaseId)
    }

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = (await response.json()) as EmbeddedLinkedReleases
            return data
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        fetchData(`components/${componentId}/releases`)
            .then((releaseLinks: EmbeddedLinkedReleases | undefined) => {
                if (releaseLinks === undefined) return

                if (
                    !CommonUtils.isNullOrUndefined(releaseLinks['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(releaseLinks['_embedded']['sw360:releaseLinks'])
                ) {
                    const data = releaseLinks['_embedded']['sw360:releaseLinks'].map((item: ReleaseLink) => [
                        item.name,
                        [item.id, item.version],
                        t(item.clearingState as never),
                        t(item.clearingReport?.clearingReportStatus as never),
                        t(item.mainlineState as never),
                        item.id,
                    ])
                    setData(data)
                }
            })
            .catch((err) => console.error(err))
    }, [componentId, fetchData, t])

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
                    <Link
                        href={'/components/releases/detail/' + id}
                        className='link'
                    >
                        {version}
                    </Link>,
                ),
            sort: true,
        },
        {
            id: 'clearingState',
            name: t('Clearing State'),
            sort: true,
        },
        {
            id: 'clearingReport',
            name: t('CLEARING_REPORT'),
            sort: true,
        },
        {
            id: 'mainlineState',
            name: t('Release Mainline State'),
            sort: true,
        },
        {
            id: 'action',
            name: t('Actions'),
            formatter: (id: string) =>
                _(
                    <span>
                        <Image
                            src={fossologyIcon as StaticImport}
                            width={15}
                            height={15}
                            style={{ marginRight: '5px' }}
                            alt='Fossology'
                            onClick={() => handleFossologyClearing(id)}
                        />
                        <Link href={`/components/editRelease/${id}`}>
                            <FaPencilAlt className='btn-icon' />
                        </Link>
                        <HiOutlineLink
                            className='btn-icon'
                            onClick={() => handleLinkToProject(id)}
                        />
                        <FaTrashAlt
                            className='btn-icon'
                            onClick={() => handleClickDelete(id)}
                        />
                    </span>,
                ),
        },
    ]

    const moderationRequestCurrentComponentReleaseColumns = [
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
                    <Link
                        href={'/components/releases/detail/' + id}
                        className='link'
                    >
                        {version}
                    </Link>,
                ),
            sort: true,
        },
        {
            id: 'clearingState',
            name: t('Clearing State'),
            sort: true,
        },
        {
            id: 'clearingReport',
            name: t('CLEARING_REPORT'),
            sort: true,
        },
        {
            id: 'mainlineState',
            name: t('Release Mainline State'),
            sort: true,
        },
    ]

    return (
        <>
            <div className='row'>
                <Table
                    data={data}
                    search={true}
                    columns={
                        calledFromModerationRequestDetail !== undefined && calledFromModerationRequestDetail
                            ? moderationRequestCurrentComponentReleaseColumns
                            : columns
                    }
                    selector={true}
                />
            </div>
            <DeleteReleaseModal
                releaseId={deletingRelease}
                show={deleteModalOpen}
                setShow={setDeleteModalOpen}
            />
            {!CommonUtils.isNullOrUndefined(clearingReleaseId) && (
                <FossologyClearing
                    show={fossologyClearingModelOpen}
                    setShow={setFossologyClearingModelOpen}
                    releaseId={clearingReleaseId}
                />
            )}
            {!CommonUtils.isNullOrUndefined(linkingReleaseId) && (
                <LinkReleaseToProjectModal
                    show={linkToProjectModalOpen}
                    setShow={setLinkToProjectModalOpen}
                    releaseId={linkingReleaseId}
                />
            )}
        </>
    )
}

export default ReleaseOverview
