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
import { Spinner } from 'react-bootstrap'
import { ActionType, Release, ReleaseDetail, ReleaseLink } from '@/object-types'
import { CommonUtils } from '@/utils'
import SearchReleasesModal from '../sw360/SearchReleasesModal'
import TableLinkedReleases from './TableLinkedReleases/TableLinkedReleases'

interface Props {
    release?: ReleaseDetail
    actionType?: string
    releasePayload: Release
    setReleasePayload: React.Dispatch<React.SetStateAction<Release>>
}

const LinkedReleases = ({ release, actionType, releasePayload, setReleasePayload }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [releaseLinks, setReleaseLinks] = useState<ReleaseLink[]>([])
    const [linkedReleasesDiaglog, setLinkedReleasesDiaglog] = useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const setReleaseIdToRelationshipsToReleasePayLoad = useCallback(
        (releaseIdToRelationships: Map<string, string>) => {
            const obj = Object.fromEntries(releaseIdToRelationships)
            setReleasePayload({
                ...releasePayload,
                releaseIdToRelationship: obj,
            })
        },
        [
            releasePayload,
            setReleasePayload,
        ],
    )

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
            <SearchReleasesModal
                show={linkedReleasesDiaglog}
                setShow={setLinkedReleasesDiaglog}
                onSelect={handleSelectReleases}
                showExactMatch={false}
            />
            <div className='row mb-4'>
                <div className='row header-1'>
                    <h6
                        className='fw-medium'
                        style={{
                            color: '#5D8EA9',
                            paddingLeft: '0px',
                        }}
                    >
                        {t('LINKED RELEASES')}
                        <hr
                            className='my-2 mb-2'
                            style={{
                                color: '#5D8EA9',
                                paddingLeft: '0px',
                            }}
                        />
                    </h6>
                </div>
                <div className='mb-3'>
                    {releaseLinks ? (
                        <TableLinkedReleases
                            releaseLinks={releaseLinks}
                            setReleaseLinks={setReleaseLinks}
                            setReleaseIdToRelationshipsToReleasePayLoad={setReleaseIdToRelationshipsToReleasePayLoad}
                        />
                    ) : (
                        <div className='col-12 mt-1 text-center'>
                            <Spinner className='spinner' />
                        </div>
                    )}
                </div>
                <div
                    className='row'
                    style={{
                        paddingLeft: '0px',
                    }}
                >
                    <div className='col-lg-4'>
                        <button
                            type='button'
                            className='btn btn-secondary'
                            onClick={() => setLinkedReleasesDiaglog(true)}
                        >
                            {t('Link Releases')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LinkedReleases
