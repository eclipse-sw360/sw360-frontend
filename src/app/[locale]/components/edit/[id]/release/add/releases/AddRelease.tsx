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
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { ToastContainer } from 'react-bootstrap'

import AddCommercialDetails from '@/components/CommercialDetails/AddCommercialDetails'
import LinkedReleases from '@/components/LinkedReleases/LinkedReleases'
import { PageButtonHeader, SideBar } from '@/components/sw360'
import ToastMessage from '@/components/sw360/ToastContainer/Toast'
import { EmbeddedComponent, HttpStatus, Licenses } from '@/object-types'
import COTSDetails from '@/object-types/COTSDetails'
import ComponentOwner from '@/object-types/ComponentOwner'
import Moderators from '@/object-types/Moderators'
import ReleaseDetail from '@/object-types/ReleaseDetail'
import ReleasePayload from '@/object-types/ReleasePayload'
import Repository from '@/object-types/Repository'
import ToastData from '@/object-types/ToastData'
import Vendor from '@/object-types/Vendor'
import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import ReleaseTabIds from '@/object-types/enums/ReleaseTabIds'
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

function AddRelease({ componentId }: Props) {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const router = useRouter()
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [tabList, setTabList] = useState(ReleaseAddTabs.WITHOUT_COMMERCIAL_DETAILS)

    const [releasePayload, setReleasePayload] = useState<ReleasePayload>({
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

    const [mainLicensesId, setMainLicensesId] = useState<Licenses>({
        id: null,
        fullName: '',
    })

    const [otherLicensesId, setOtherLicensesId] = useState<Licenses>({
        id: null,
        fullName: '',
    })

    const [contributor, setContributor] = useState<Moderators>({
        emails: null,
        fullName: '',
    })

    const [moderator, setModerator] = useState<Moderators>({
        emails: null,
        fullName: '',
    })

    const [cotsResponsible, setCotsResponsible] = useState<ComponentOwner>({
        email: '',
        fullName: '',
    })

    const [toastData, setToastData] = useState<ToastData>({
        show: false,
        type: '',
        message: '',
        contextual: '',
    })

    const alert = (show_data: boolean, status_type: string, message: string, contextual: string) => {
        setToastData({
            show: show_data,
            type: status_type,
            message: message,
            contextual: contextual,
        })
    }

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const component = (await response.json()) as EmbeddedComponent
                return component
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                return null
            }
        },
        [session.user.access_token]
    )

    useEffect(() => {
        void fetchData(`components/${componentId}`).then((component: EmbeddedComponent) => {
            setReleasePayload({
                ...releasePayload,
                name: component.name,
            })
            if (component.componentType === 'COTS') {
                setTabList(ReleaseAddTabs.WITH_COMMERCIAL_DETAILS)
            }
        })
    }, [componentId, fetchData, releasePayload])

    const submit = async () => {
        const response = await ApiUtils.POST('releases', releasePayload, session.user.access_token)
        if (response.status == HttpStatus.CREATED) {
            const release = (await response.json()) as ReleaseDetail
            alert(true, 'Success', t('Release is created'), 'success')
            const releaseId: string = CommonUtils.getIdFromUrl(release._links.self.href)
            router.push('/components/releases/detail/' + releaseId)
        } else if (response.status == HttpStatus.CONFLICT) {
            alert(true, 'Duplicate', t('Release is Duplicate'), 'warning')
        } else {
            alert(true, 'Error', t('Release Create failed'), 'danger')
        }
    }

    const headerButtons = {
        'Create Release': { link: '', type: 'primary', onClick: submit },
        Cancel: { link: '/components/detail/' + componentId, type: 'secondary' },
    }

    return (
        <>
            <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabList={tabList} />
                    </div>
                    <div className='col'>
                        <div className='row' style={{ marginBottom: '20px' }}>
                            <PageButtonHeader buttons={headerButtons}></PageButtonHeader>
                        </div>
                        <ToastContainer position='top-start'>
                            <ToastMessage
                                show={toastData.show}
                                type={toastData.type}
                                message={toastData.message}
                                contextual={toastData.contextual}
                                onClose={() => setToastData({ ...toastData, show: false })}
                                setShowToast={setToastData}
                            />
                        </ToastContainer>
                        <div className='row' hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}>
                            <ReleaseAddSummary
                                releasePayload={releasePayload}
                                setReleasePayload={setReleasePayload}
                                vendor={vendor}
                                setVendor={setVendor}
                                mainLicensesId={mainLicensesId}
                                setMainLicensesId={setMainLicensesId}
                                otherLicensesId={otherLicensesId}
                                setOtherLicensesId={setOtherLicensesId}
                                contributor={contributor}
                                setContributor={setContributor}
                                moderator={moderator}
                                setModerator={setModerator}
                            />
                        </div>
                        <div className='row' hidden={selectedTab != ReleaseTabIds.LINKED_RELEASES ? true : false}>
                            <LinkedReleases releasePayload={releasePayload} setReleasePayload={setReleasePayload} />
                        </div>
                        <div className='row' hidden={selectedTab != ReleaseTabIds.COMMERCIAL_DETAILS ? true : false}>
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
