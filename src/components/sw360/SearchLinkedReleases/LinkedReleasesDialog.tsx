// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, type JSX } from 'react';
import { Button, Modal } from 'react-bootstrap'

import { Embedded, HttpStatus, Release, ReleaseDetail, ReleaseLink } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import SelectTableLinkedReleases from './SelectTableLinkedReleases'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    onReRender: () => void
    releaseLinks: ReleaseLink[]
    setReleaseLinks: React.Dispatch<React.SetStateAction<ReleaseLink[]>>
    releasePayload: Release
    setReleasePayload: React.Dispatch<React.SetStateAction<Release>>
}

type EmbeddedReleases = Embedded<ReleaseDetail, 'sw360:releases'>

const LinkedReleasesDialog = ({
    show,
    setShow,
    onReRender,
    releaseLinks,
    setReleaseLinks,
    releasePayload,
    setReleasePayload,
}: Props) : JSX.Element => {
    const t = useTranslations('default')
    const [data, setData] = useState<(string | ReleaseDetail)[][]>([])
    const params = useSearchParams()
    const [linkedReleases] = useState<Array<ReleaseDetail>>([])
    const [linkedReleasesResponse, setLinkedReleasesResponse] = useState<ReleaseLink[]>([])
    const [releases, setReleases] = useState<(string | ReleaseDetail)[][]>([])

    const handleCloseDialog = () => {
        setShow(!show)
    }

    const searchLinkedReleases = () => {
        setReleases(data)
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session))
                    return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(`releases`, { ...Object.fromEntries(params), allDetails: 'true' })
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const releases = await response.json() as EmbeddedReleases
                if (
                    !CommonUtils.isNullOrUndefined(releases['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(releases['_embedded']['sw360:releases'])
                ) {
                    const data = releases['_embedded']['sw360:releases'].map((item: ReleaseDetail) => [
                        item,
                        item.vendor ? (item.vendor.fullName ?? '') : '',
                        item.name,
                        item.version,
                        item.clearingState,
                        item.mainlineState ?? 'OPEN',
                    ])
                    setData(data)
                }
            } catch (e) {
                console.error(e)
            }
        })()
        return () => controller.abort()
    }, [params])

    const handleClickSelectLinkedReleases = () => {
        linkedReleasesResponse.forEach((linkedRelease: ReleaseLink) => {
            releaseLinks.push(linkedRelease)
        })
        const mapReleaseRelationship = new Map<string, string>()
        releaseLinks.forEach((item) => {
            mapReleaseRelationship.set(item.id, item.releaseRelationship)
        })
        const obj = Object.fromEntries(mapReleaseRelationship)
        setReleasePayload({
            ...releasePayload,
            releaseIdToRelationship: obj,
        })
        releaseLinks = releaseLinks.filter((v, index, a) => a.findIndex((v2) => v2.id === v.id) === index)
        setReleaseLinks(releaseLinks)
        setShow(!show)
        onReRender()
    }

    const getLinkedReleases: (releaseLink: ReleaseLink[]) => void = useCallback(
        (releaseLink: ReleaseLink[]) => setLinkedReleasesResponse(releaseLink),
        []
    )

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>{t('Link Releases')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='modal-body'>
                    <div className='row'>
                        <div className='col-lg-8'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Enter search text')}
                                aria-describedby='Link Releases'
                            />
                        </div>
                        <div className='col-lg-4'>
                            <button
                                type='button'
                                className={`fw-bold btn btn-secondary`}
                                onClick={searchLinkedReleases}
                            >
                                {t('Search')}
                            </button>
                        </div>
                    </div>
                    <div className='row mt-3'>
                        <SelectTableLinkedReleases
                            releases={releases}
                            setLinkedReleases={getLinkedReleases}
                            linkedReleases={linkedReleases}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    data-bs-dismiss='modal'
                    className={`fw-bold btn btn-secondary`}
                    onClick={handleCloseDialog}
                >
                    {t('Close')}
                </Button>
                <Button type='button' className={`fw-bold btn btn-secondary`} onClick={handleClickSelectLinkedReleases}>
                    {t('Link Releases')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default LinkedReleasesDialog
