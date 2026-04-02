// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader } from 'next-sw360'
import { ReactNode, useEffect, useState } from 'react'
import { Col, ListGroup, Row, Tab } from 'react-bootstrap'
import AddCommercialDetails from '@/components/CommercialDetails/AddCommercialDetails'
import LinkedReleases from '@/components/LinkedReleases/LinkedReleases'
import {
    ActionType,
    COTSDetails,
    CommonTabIds,
    Component,
    Release,
    ReleaseDetail,
    ReleaseTabIds,
    Repository,
    Vendor,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import ReleaseAddSummary from './ReleaseAddSummary'

interface Props {
    componentId?: string
}

const releaseRepository: Repository = {
    repositorytype: 'UNKNOWN',
    url: '',
}

const cotsDetails: COTSDetails = {
    usedLicense: '',
    licenseClearingReportURL: '',
    containsOSS: false,
    ossContractSigned: false,
    ossInformationURL: '',
    usageRightAvailable: false,
    cotsResponsible: '',
    clearingDeadline: '',
    sourceCodeAvailable: false,
}

function AddRelease({ componentId }: Props): ReactNode {
    const t = useTranslations('default')
    const router = useRouter()

    const [releasePayload, setReleasePayload] = useState<Release>({
        name: '',
        cpeid: '',
        version: '',
        componentId: componentId,
        releaseDate: '',
        externalIds: null,
        additionalData: null,
        mainlineState: 'OPEN',
        contributors: null,
        moderators: null,
        roles: null,
        mainLicenseIds: null,
        otherLicenseIds: null,
        vendorId: '',
        languages: null,
        operatingSystems: null,
        softwarePlatforms: null,
        sourceCodeDownloadurl: '',
        binaryDownloadurl: '',
        repository: releaseRepository,
        releaseIdToRelationship: null,
        cotsDetails: cotsDetails,
    })

    const [vendor, setVendor] = useState<Vendor>({
        id: '',
        fullName: '',
    })

    const [mainLicenses, setMainLicenses] = useState<{
        [k: string]: string
    }>({})

    const [otherLicenses, setOtherLicenses] = useState<{
        [k: string]: string
    }>({})

    const [cotsResponsible, setCotsResponsible] = useState<{
        [k: string]: string
    }>({})

    const session = useSession()
    const [activeKey, setActiveKey] = useState(CommonTabIds.SUMMARY)
    const params = useSearchParams()
    const duplicateFromReleaseId = params.get('duplicate')
    const [withCotsDetails, setWithCotsDetails] = useState(false)
    const [sourceRelease, setSourceRelease] = useState<ReleaseDetail | null>(null)

    useEffect(() => {
        const fragment = params.get('tab') ?? CommonTabIds.SUMMARY
        setActiveKey(fragment)
    }, [
        params,
    ])

    const handleSelect = (key: string | null) => {
        setActiveKey(key ?? CommonTabIds.SUMMARY)
        const current = new URLSearchParams(params.toString())
        current.set('tab', key ?? CommonTabIds.SUMMARY)
        router.push(`?${current.toString()}`)
    }

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    useEffect(() => {
        if (!duplicateFromReleaseId) return
        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(
                    `releases/${duplicateFromReleaseId}`,
                    session.data.user.access_token,
                )
                if (response.status === StatusCodes.UNAUTHORIZED) return signOut()
                else if (response.status !== StatusCodes.OK) return notFound()

                const release: ReleaseDetail = (await response.json()) as ReleaseDetail
                const releaseComponentId = CommonUtils.getIdFromUrl(release._links['sw360:component'].href)

                if (!CommonUtils.isNullEmptyOrUndefinedArray(release._embedded?.['sw360:vendors'])) {
                    const v = release._embedded['sw360:vendors']![0]
                    setVendor({
                        id: CommonUtils.getIdFromUrl(v._links?.self?.href ?? ''),
                        fullName: v.fullName ?? '',
                    })
                }

                if (release._embedded?.['sw360:licenses']) {
                    setMainLicenses(
                        release._embedded['sw360:licenses'].reduce(
                            (acc, item) => {
                                const id = item._links?.self?.href.split('/').at(-1)
                                if (id) acc[id] = item.fullName ?? ''
                                return acc
                            },
                            {} as {
                                [k: string]: string
                            },
                        ),
                    )
                }

                if (release._embedded?.['sw360:otherLicenses']) {
                    setOtherLicenses(
                        release._embedded['sw360:otherLicenses'].reduce(
                            (acc, item) => {
                                const id = item._links?.self?.href.split('/').at(-1)
                                if (id) acc[id] = item.fullName ?? ''
                                return acc
                            },
                            {} as {
                                [k: string]: string
                            },
                        ),
                    )
                }

                const vendorId = !CommonUtils.isNullEmptyOrUndefinedArray(release._embedded?.['sw360:vendors'])
                    ? CommonUtils.getIdFromUrl(release._embedded['sw360:vendors']![0]._links?.self?.href ?? '')
                    : null

                setReleasePayload((prev) => ({
                    ...prev,
                    name: release.name,
                    cpeid: release.cpeId ?? '',
                    version: release.version,
                    componentId: releaseComponentId,
                    releaseDate: release.releaseDate ?? '',
                    externalIds: release.externalIds ?? null,
                    additionalData: release.additionalData ?? null,
                    mainlineState: release.mainlineState ?? 'OPEN',
                    roles: release.roles ?? null,
                    mainLicenseIds: release.mainLicenseIds ?? null,
                    otherLicenseIds: release.otherLicenseIds ?? null,
                    vendorId,
                    languages: release.languages ?? null,
                    operatingSystems: release.operatingSystems ?? null,
                    softwarePlatforms: release.softwarePlatforms ?? null,
                    sourceCodeDownloadurl: release.sourceCodeDownloadurl ?? '',
                    binaryDownloadurl: release.binaryDownloadurl ?? '',
                    repository: release.repository ?? null,
                    releaseIdToRelationship: release.releaseIdToRelationship ?? null,
                    contributors: release._embedded?.['sw360:contributors']?.map((u) => u.email) ?? null,
                    moderators: release._embedded?.['sw360:moderators']?.map((u) => u.email) ?? null,
                }))

                setSourceRelease(release)
            } catch (e) {
                ApiUtils.reportError(e)
            }
        })()
    }, [
        duplicateFromReleaseId,
    ])

    useEffect(() => {
        if (!componentId) return
        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(`components/${componentId}`, session.data.user.access_token)
                if (response.status === StatusCodes.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== StatusCodes.OK) {
                    return notFound()
                }
                const component: Component = (await response.json()) as Component
                setReleasePayload({
                    ...releasePayload,
                    name: component.name,
                })
                if (component.componentType === 'COTS') {
                    setWithCotsDetails(true)
                }
            } catch (e) {
                ApiUtils.reportError(e)
            }
        })()
    }, [
        componentId,
    ])

    const submit = async () => {
        if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
        const response = await ApiUtils.POST('releases', releasePayload, session.data.user.access_token)
        if (response.status === StatusCodes.CREATED) {
            const release = (await response.json()) as ReleaseDetail
            MessageService.success(t('Release is created'))
            const releaseId: string = CommonUtils.getIdFromUrl(release._links.self.href)
            router.push('/components/editRelease/' + releaseId)
        } else if (response.status === StatusCodes.CONFLICT) {
            MessageService.warn(t('Release is Duplicate'))
        } else {
            MessageService.error(t('Release Create failed'))
        }
    }

    const headerButtons = {
        'Create Release': {
            link: '',
            type: 'primary',
            name: t('Create Release'),
            onClick: submit,
        },
        Cancel: {
            link: '/components/detail/' + componentId,
            type: 'secondary',
            name: t('Cancel'),
        },
    }

    return (
        <>
            <div className='container page-content'>
                <Tab.Container
                    activeKey={activeKey}
                    onSelect={(k) => handleSelect(k)}
                >
                    <Row>
                        <Col
                            sm={2}
                            className='me-3'
                        >
                            <ListGroup>
                                <ListGroup.Item
                                    action
                                    eventKey={CommonTabIds.SUMMARY}
                                >
                                    <div className='my-2'>{t('Summary')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey={ReleaseTabIds.LINKED_RELEASES}
                                >
                                    <div className='my-2'>{t('Linked Releases')}</div>
                                </ListGroup.Item>
                                {withCotsDetails && (
                                    <ListGroup.Item
                                        action
                                        eventKey={ReleaseTabIds.COMMERCIAL_DETAILS}
                                    >
                                        <div className='my-2'>{t('Commercial Details')}</div>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Col>
                        <Col>
                            <Row>
                                <PageButtonHeader buttons={headerButtons}></PageButtonHeader>
                            </Row>
                            <Row>
                                <Tab.Content>
                                    <Tab.Pane eventKey={CommonTabIds.SUMMARY}>
                                        <ReleaseAddSummary
                                            releasePayload={releasePayload}
                                            setReleasePayload={setReleasePayload}
                                            vendor={vendor}
                                            setVendor={setVendor}
                                            mainLicenses={mainLicenses}
                                            setMainLicenses={setMainLicenses}
                                            otherLicenses={otherLicenses}
                                            setOtherLicenses={setOtherLicenses}
                                            releaseDetail={sourceRelease ?? undefined}
                                        />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey={ReleaseTabIds.LINKED_RELEASES}>
                                        <LinkedReleases
                                            actionType={duplicateFromReleaseId ? ActionType.EDIT : ActionType.ADD}
                                            release={sourceRelease ?? undefined}
                                            releasePayload={releasePayload}
                                            setReleasePayload={setReleasePayload}
                                        />
                                    </Tab.Pane>
                                    {withCotsDetails && (
                                        <Tab.Pane eventKey={ReleaseTabIds.COMMERCIAL_DETAILS}>
                                            <AddCommercialDetails
                                                releasePayload={releasePayload}
                                                setReleasePayload={setReleasePayload}
                                                cotsResponsible={cotsResponsible}
                                                setCotsResponsible={setCotsResponsible}
                                            />
                                        </Tab.Pane>
                                    )}
                                </Tab.Content>
                            </Row>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </>
    )
}

export default AddRelease
