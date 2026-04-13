// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useState } from 'react'
import { ActionType, Release, ReleaseDetail, ReleaseLink } from '@/object-types'
import { CommonUtils } from '@/utils'
import SearchReleasesModal from '../sw360/SearchReleasesModal'
import TableLinkedReleases from './TableLinkedReleases/TableLinkedReleases'
import TitleLinkedReleases from './TitleLinkedReleases/TitleLinkedReleases'

interface Props {
    release?: ReleaseDetail
    actionType?: string
    releasePayload: Release
    setReleasePayload: React.Dispatch<React.SetStateAction<Release>>
}

const LinkedReleases = ({ release, actionType, releasePayload, setReleasePayload }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [reRender, setReRender] = useState(false)
    const [releaseLinks, setReleaseLinks] = useState<ReleaseLink[]>([])
    const handleReRender = () => {
        setReRender(!reRender)
    }
    const [linkedReleasesDiaglog, setLinkedReleasesDiaglog] = useState(false)
    const handleClickSelectLinkedReleases = useCallback(() => setLinkedReleasesDiaglog(true), [])
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const setReleaseIdToRelationshipsToReleasePayLoad = (releaseIdToRelationships: Map<string, string>) => {
        const obj = Object.fromEntries(releaseIdToRelationships)
        setReleasePayload({
            ...releasePayload,
            releaseIdToRelationship: obj,
        })
    }

    const handleSelectReleases = useCallback(
        (selectedReleases: ReleaseDetail[]) => {
            const newReleaseLinks: ReleaseLink[] = selectedReleases.map((release: ReleaseDetail) => ({
                id: release.id ?? '',
                name: release.name,
                version: release.version,
                mainlineState: release.mainlineState,
                clearingState: release.clearingState,
                vendor: release.vendor ? release.vendor.fullName : '',
                releaseRelationship: 'CONTAINED',
            }))

            const updatedReleaseLinks = [
                ...releaseLinks,
                ...newReleaseLinks,
            ]
            setReleaseLinks(updatedReleaseLinks)

            const mapReleaseRelationship = new Map<string, string>()
            updatedReleaseLinks.forEach((item) => {
                mapReleaseRelationship.set(item.id, item.releaseRelationship)
            })
            const obj = Object.fromEntries(mapReleaseRelationship)
            setReleasePayload({
                ...releasePayload,
                releaseIdToRelationship: obj,
            })
            handleReRender()
        },
        [
            releaseLinks,
            releasePayload,
            setReleasePayload,
        ],
    )

    useEffect(() => {
        if (actionType === ActionType.EDIT && release !== undefined) {
            if (
                !CommonUtils.isNullOrUndefined(release['_embedded']) &&
                !CommonUtils.isNullOrUndefined(release['_embedded']['sw360:releaseLinks'])
            ) {
                const linkedReleases: ReleaseLink[] = []
                release['_embedded']['sw360:releaseLinks'].map((item: ReleaseLink) => [
                    linkedReleases.push(item),
                ])
                setReleaseLinks(linkedReleases)
            }
        }
    }, [
        actionType,
        release,
    ])

    return (
        <>
            <div
                className='col'
                style={{
                    fontSize: '0.875rem',
                }}
            >
                <SearchReleasesModal
                    show={linkedReleasesDiaglog}
                    setShow={setLinkedReleasesDiaglog}
                    onSelect={handleSelectReleases}
                    showExactMatch={false}
                />
                <div className='row ps-4 pb-4'>
                    <TitleLinkedReleases />
                    <TableLinkedReleases
                        releaseLinks={releaseLinks}
                        setReleaseLinks={setReleaseLinks}
                        setReleaseIdToRelationshipsToReleasePayLoad={setReleaseIdToRelationshipsToReleasePayLoad}
                    />
                </div>
                <div>
                    <button
                        type='button'
                        className={`fw-bold btn btn-secondary ms-2`}
                        onClick={handleClickSelectLinkedReleases}
                    >
                        {t('Click to add Releases')}
                    </button>
                </div>
            </div>
        </>
    )
}

export default LinkedReleases
