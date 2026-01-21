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
import { notFound, useRouter } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader, SideBar } from 'next-sw360'
import { ReactNode, useEffect, useState } from 'react'
import AddCommercialDetails from '@/components/CommercialDetails/AddCommercialDetails'
import LinkedReleases from '@/components/LinkedReleases/LinkedReleases'
import {
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
import ReleaseAddTabs from './ReleaseAddTab'

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
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [tabList, setTabList] = useState(ReleaseAddTabs.WITHOUT_COMMERCIAL_DETAILS)

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

    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(`components/${componentId}`, session.user.access_token)
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
                    setTabList(ReleaseAddTabs.WITH_COMMERCIAL_DETAILS)
                }
            } catch (e) {
                console.error(e)
            }
        })()
    }, [
        componentId,
    ])

    const submit = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.POST('releases', releasePayload, session.user.access_token)
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
            <div
                className='container'
                style={{
                    maxWidth: '98vw',
                    marginTop: '10px',
                }}
            >
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                            tabList={tabList}
                        />
                    </div>
                    <div className='col'>
                        <div
                            className='row'
                            style={{
                                marginBottom: '20px',
                            }}
                        >
                            <PageButtonHeader buttons={headerButtons}></PageButtonHeader>
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}
                        >
                            <ReleaseAddSummary
                                releasePayload={releasePayload}
                                setReleasePayload={setReleasePayload}
                                vendor={vendor}
                                setVendor={setVendor}
                                mainLicenses={mainLicenses}
                                setMainLicenses={setMainLicenses}
                                otherLicenses={otherLicenses}
                                setOtherLicenses={setOtherLicenses}
                            />
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab !== ReleaseTabIds.LINKED_RELEASES ? true : false}
                        >
                            <LinkedReleases
                                releasePayload={releasePayload}
                                setReleasePayload={setReleasePayload}
                            />
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab !== ReleaseTabIds.COMMERCIAL_DETAILS ? true : false}
                        >
                            <AddCommercialDetails
                                releasePayload={releasePayload}
                                setReleasePayload={setReleasePayload}
                                cotsResponsible={cotsResponsible}
                                setCotsResponsible={setCotsResponsible}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddRelease
