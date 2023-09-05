// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useCallback, useEffect, useState } from 'react'

import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import { Session } from '@/object-types/Session'
import { SideBar, PageButtonHeader } from '@/components/sw360'
import ReleaseTabIds from '@/object-types/enums/ReleaseTabIds'
import { notFound, useRouter } from 'next/navigation'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { signOut } from 'next-auth/react'
import ReleaseAddSummary from './ReleaseAddSummary'
import ReleaseAddTabs from './ReleaseAddTab'
import AddCommercialDetails from '@/components/CommercialDetails/AddCommercialDetails'
import LinkedReleases from '@/components/LinkedReleases/LinkedRelesaes'
import Vendor from '@/object-types/Vendor'
import Moderators from '@/object-types/Moderators'
import Repository from '@/object-types/Repository'
import ComponentOwner from '@/object-types/ComponentOwner'
import Licenses from '@/object-types/Licenses'
import { TypeOptions, toast } from 'react-toastify'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import ReleasePayload from '@/object-types/ReleasePayload'
import COTSDetails from '@/object-types/COTSDetails'

interface Props {
    session?: Session
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

const AddRelease = ({ session, componentId }: Props) => {
    const router = useRouter()
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [tabList, setTabList] = useState(ReleaseAddTabs.WITHOUT_COMMERCIAL_DETAILS)
    const t = useTranslations(COMMON_NAMESPACE)
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
        cotsDetails: cotsDetails
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

    const fetchData: any = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json()
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                signOut()
            } else {
                notFound()
            }
        },
        [session.user.access_token]
    )

    useEffect(() => {
        fetchData(`components/${componentId}`).then((component: any) => {
            setReleasePayload({
                ...releasePayload,
                name: component.name,
            })
            if (component.componentType === 'COTS') {
                setTabList(ReleaseAddTabs.WITH_COMMERCIAL_DETAILS)
            }
        })
    }, [componentId, fetchData])

    const notify = (text: string, type: TypeOptions) =>
        toast(text, {
            type,
            position: toast.POSITION.TOP_LEFT,
            theme: 'colored',
        })

    const handleId = (id: string): string => {
        return id.split('/').at(-1)
    }

    const submit = async () => {
        const response = await ApiUtils.POST('releases', releasePayload, session.user.access_token)
        if (response.status == HttpStatus.CREATED) {
            const data = await response.json()
            notify(t('Component is created'), 'success')
            const releaseId: string = handleId(data._links.self.href)
            router.push('/components/releases/detail/' + releaseId)
        } else if (response.status == HttpStatus.CONFLICT) {
            notify(t('Component is Duplicate'), 'warning')
        } else {
            notify(t('Create Component failed'), 'error')
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
                        <div className='row' hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}>
                            <ReleaseAddSummary
                                session={session}
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
                            <LinkedReleases
                                session={session}
                                releasePayload={releasePayload}
                                setReleasePayload={setReleasePayload}
                            />
                        </div>
                        <div className='row' hidden={selectedTab != ReleaseTabIds.COMMERCIAL_DETAILS ? true : false}>
                            <AddCommercialDetails
                                session={session}
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
