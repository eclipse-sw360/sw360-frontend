// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useEffect, useState, useCallback } from 'react'
import CommonUtils from '@/utils/common.utils'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { signOut } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { Session } from '@/object-types/Session'
import ReleaseLink from '@/object-types/ReleaseLink'
import EmbeddedLinkedReleases from '@/object-types/ReleaseLink'
import { FaTrashAlt, FaPencilAlt } from 'react-icons/fa'
import styles from '../detail.module.css'
import Image from 'next/image'
import fossologyIcon from '@/assets/images/fossology.svg'
import FossologyClearing from '@/components/sw360/FossologyClearing/FossologyClearing'

import { Table, _ } from '@/components/sw360'
import DeleteReleaseModal from './DeleteReleaseModal'
import LinkReleaseToProjectModal from '@/components/LinkReleaseToProjectModal/LinkReleaseToProjectModal'
import { HiOutlineLink } from 'react-icons/hi'

interface Props {
    session: Session
    componentId: string
}

const ReleaseOverview = ({ session, componentId }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [data, setData] = useState([])
    const [deletingRelease, setDeletingRelease] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [clearingReleaseId, setClearingReleaseId] = useState<string>(undefined)
    const [fossologyClearingModelOpen, setFossologyClearingModelOpen] = useState(false)
    const [linkingReleaseId, setLinkingReleaseId] = useState<string>(undefined)
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

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as EmbeddedLinkedReleases
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                notFound()
            }
        },
        [session.user.access_token]
    )

    useEffect(() => {
        fetchData(`components/${componentId}/releases`)
            .then((releaseLinks: EmbeddedLinkedReleases) => {
                if (
                    !CommonUtils.isNullOrUndefined(releaseLinks['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(releaseLinks['_embedded']['sw360:releaseLinks'])
                ) {
                    const data = releaseLinks['_embedded']['sw360:releaseLinks'].map((item: ReleaseLink) => [
                        item.name,
                        [item.id, item.version],
                        t(item.clearingState),
                        t(item.clearingReport.clearingReportStatus),
                        t(item.mainlineState),
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
                    <Link href={'/components/releases/detail/' + id} className='link'>
                        {version}
                    </Link>
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
            name: t('Clearing Report'),
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
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            src={fossologyIcon}
                            width={15}
                            height={15}
                            style={{ marginRight: '5px' }}
                            alt='Fossology'
                            onClick={() => handleFossologyClearing(id)}
                        />
                        <Link href={`/components/editRelease/${id}`}>
                            <FaPencilAlt className={styles['icon-btn']} />
                        </Link>
                        <HiOutlineLink className={styles['icon-btn']} onClick={() => handleLinkToProject(id)} />
                        <FaTrashAlt className={styles['icon-btn']} onClick={() => handleClickDelete(id)} />
                    </span>
                ),
        },
    ]

    return (
        <>
            <div className='row'>
                <Table data={data} search={true} columns={columns} selector={true} />
            </div>
            <DeleteReleaseModal releaseId={deletingRelease} show={deleteModalOpen} setShow={setDeleteModalOpen} />
            {clearingReleaseId && (
                <FossologyClearing
                    show={fossologyClearingModelOpen}
                    setShow={setFossologyClearingModelOpen}
                    session={session}
                    releaseId={clearingReleaseId}
                />
            )}
            {linkingReleaseId && (
                <LinkReleaseToProjectModal
                    show={linkToProjectModalOpen}
                    setShow={setLinkToProjectModalOpen}
                    session={session}
                    releaseId={linkingReleaseId}
                />
            )}
        </>
    )
}

export default ReleaseOverview
