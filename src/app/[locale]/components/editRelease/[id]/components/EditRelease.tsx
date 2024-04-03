// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import EditAttachments from '@/components/Attachments/EditAttachments'
import AddCommercialDetails from '@/components/CommercialDetails/AddCommercialDetails'
import LinkedReleases from '@/components/LinkedReleases/LinkedReleases'
import {
    ActionType,
    COTSDetails,
    ClearingInformation,
    CommonTabIds,
    ComponentOwner,
    DocumentTypes,
    ECCInformation,
    HttpStatus,
    Moderators,
    Release,
    ReleaseDetail,
    ReleaseTabIds,
    Vendor,
} from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { PageButtonHeader, SideBar } from 'next-sw360'
import DeleteReleaseModal from '../../../detail/[id]/components/DeleteReleaseModal'
import EditClearingDetails from './EditClearingDetails'
import EditECCDetails from './EditECCDetails'
import ReleaseEditSummary from './ReleaseEditSummary'
import ReleaseEditTabs from './ReleaseEditTabs'
import MessageService from '@/services/message.service'

interface Props {
    releaseId?: string
}

const EditRelease = ({ releaseId }: Props) => {
    const router = useRouter()
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [tabList, setTabList] = useState(ReleaseEditTabs.WITHOUT_COMMERCIAL_DETAILS)
    const [release, setRelease] = useState<ReleaseDetail>()
    const [componentId, setComponentId] = useState('')
    const [deletingRelease, setDeletingRelease] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    useEffect(() => {
        ; (async () => {
            try {
                const session = await getSession()
                const response = await ApiUtils.GET(`releases/${releaseId}`, session.user.access_token)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const release: ReleaseDetail = await response.json()
                setRelease(release)
                setDeletingRelease(releaseId)
                setComponentId(CommonUtils.getIdFromUrl(release['_links']['sw360:component']['href']))

                if (release.componentType === 'COTS') {
                    setTabList(ReleaseEditTabs.WITH_COMMERCIAL_DETAILS)
                }

                if (typeof release.eccInformation !== 'undefined') {
                    const eccInformation: ECCInformation = release.eccInformation
                    setEccInformation(eccInformation)
                }

                if (release['_embedded']['sw360:cotsDetail']) {
                    const cotsDetails: COTSDetails = release['_embedded']['sw360:cotsDetail']
                    setCotsDetails(cotsDetails)
                    if (cotsDetails['_embedded'] && cotsDetails['_embedded']['sw360:cotsResponsible']) {
                        const cotsResponsible: ComponentOwner = {
                            email: cotsDetails._embedded['sw360:cotsResponsible'].email,
                            fullName: cotsDetails._embedded['sw360:cotsResponsible'].fullName,
                        }
                        setCotsResponsible(cotsResponsible)
                    }
                }

                if (release['_embedded']['sw360:licenses']) {
                    const mainLicenses = release['_embedded']['sw360:licenses'].reduce((result, item) => {
                                                    result[item._links.self.href.split('/').at(-1)] = item.fullName
                                                    return result
                                                }, {} as { [k: string]: string })
                    setMainLicenses(mainLicenses)
                }

                if (release['_embedded']['sw360:otherLicenses']) {
                    const otherLicenses = release['_embedded']['sw360:otherLicenses'].reduce((result, item) => {
                                                    result[item._links.self.href.split('/').at(-1)] = item.fullName
                                                    return result
                                                }, {} as { [k: string]: string })
                    setOtherLicenses(otherLicenses)
                }

                if (typeof release.clearingInformation !== 'undefined') {
                    const clearingInformation: ClearingInformation = release.clearingInformation
                    setClearingInformation(clearingInformation)
                }
            } catch (e) {
                console.error(e)
            }
        })()
    }, [])

    const [releasePayload, setReleasePayload] = useState<Release>({
        name: '',
        cpeid: '',
        version: '',
        componentId: '',
        releaseDate: '',
        externalIds: null,
        additionalData: null,
        mainlineState: 'OPEN',
        contributors: null,
        createdOn: '',
        createBy: '',
        modifiedBy: '',
        modifiedOn: '',
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
        repository: null,
        releaseIdToRelationship: null,
        cotsDetails: null,
        attachmentDTOs: null,
    })

    const [eccInformation, setEccInformation] = useState<ECCInformation>({
        eccStatus: '',
        al: '',
        eccn: '',
        assessorContactPerson: '',
        assessorDepartment: '',
        eccComment: '',
        materialIndexNumber: '',
        assessmentDate: '',
    })

    const [cotsDetails, setCotsDetails] = useState<COTSDetails>({
        usedLicense: '',
        licenseClearingReportURL: '',
        containsOSS: false,
        ossContractSigned: false,
        ossInformationURL: '',
        usageRightAvailable: false,
        cotsResponsible: '',
        clearingDeadline: '',
        sourceCodeAvailable: false,
    })

    const [clearingInformation, setClearingInformation] = useState<ClearingInformation>({
        externalSupplierID: '',
        additionalRequestInfo: '',
        evaluated: '',
        procStart: '',
        requestID: '',
        binariesOriginalFromCommunity: false,
        binariesSelfMade: false,
        componentLicenseInformation: false,
        sourceCodeDelivery: false,
        sourceCodeOriginalFromCommunity: false,
        sourceCodeToolMade: false,
        sourceCodeSelfMade: false,
        sourceCodeCotsAvailable: false,
        screenshotOfWebSite: false,
        finalizedLicenseScanReport: false,
        licenseScanReportResult: false,
        legalEvaluation: false,
        licenseAgreement: false,
        scanned: '',
        componentClearingReport: false,
        clearingStandard: '',
        readmeOssAvailable: false,
        comment: '',
        countOfSecurityVn: 0,
        externalUrl: '',
    })

    const [vendor, setVendor] = useState<Vendor>({
        id: '',
        fullName: '',
    })

    const [mainLicenses, setMainLicenses] = useState<{ [k: string]: string }>({})

    const [otherLicenses, setOtherLicenses] = useState<{ [k: string]: string }>({})

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

    const submit = async () => {
        const session = await getSession()
        const response = await ApiUtils.PATCH(`releases/${releaseId}`, releasePayload, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const release = (await response.json()) as ReleaseDetail
            MessageService.success(`Release ${release.name} (${release.version})  updated successfully!`)
            const releaseId: string = CommonUtils.getIdFromUrl(release._links.self.href)
            router.push('/components/releases/detail/' + releaseId)
        } else {
            MessageService.error( t('Release Create failed'))
        }
    }

    const handleDeleteRelease = () => {
        setDeleteModalOpen(true)
    }

    const headerButtons = {
        'Update Release': { link: '', type: 'primary', onClick: submit, name: t('Update Release') },
        'Delete Release': {
            link: '',
            type: 'danger',
            onClick: handleDeleteRelease,
            name: t('Delete Release'),
        },
        Cancel: { link: '/components/releases/detail/' + releaseId, type: 'secondary', name: t('Cancel') },
    }

    return (
        release && (
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabList={tabList} />
                    </div>
                    <div className='col'>
                        <div className='row' style={{ marginBottom: '20px' }}>
                            <PageButtonHeader buttons={headerButtons} title={release.name}></PageButtonHeader>
                        </div>
                        <DeleteReleaseModal
                            actionType={ActionType.EDIT}
                            componentId={componentId}
                            releaseId={deletingRelease}
                            show={deleteModalOpen}
                            setShow={setDeleteModalOpen}
                        />
                        <div className='row' hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}>
                            <ReleaseEditSummary
                                release={release}
                                releaseId={releaseId}
                                actionType={ActionType.EDIT}
                                releasePayload={releasePayload}
                                setReleasePayload={setReleasePayload}
                                vendor={vendor}
                                setVendor={setVendor}
                                mainLicenses={mainLicenses}
                                setMainLicenses={setMainLicenses}
                                otherLicenses={otherLicenses}
                                setOtherLicenses={setOtherLicenses}
                                contributor={contributor}
                                setContributor={setContributor}
                                moderator={moderator}
                                setModerator={setModerator}
                                cotsDetails={cotsDetails}
                                eccInformation={eccInformation}
                                clearingInformation={clearingInformation}
                            />
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.LINKED_RELEASES ? true : false}>
                            <LinkedReleases
                                actionType={ActionType.EDIT}
                                release={release}
                                releasePayload={releasePayload}
                                setReleasePayload={setReleasePayload}
                            />
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.CLEARING_DETAILS ? true : false}>
                            <EditClearingDetails
                                releasePayload={releasePayload}
                                setReleasePayload={setReleasePayload}
                            />
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.ECC_DETAILS ? true : false}>
                            <EditECCDetails releasePayload={releasePayload} setReleasePayload={setReleasePayload} />
                        </div>
                        <div className='row' hidden={selectedTab != CommonTabIds.ATTACHMENTS ? true : false}>
                            <EditAttachments
                                documentId={releaseId}
                                documentType={DocumentTypes.RELEASE}
                                releasePayload={releasePayload}
                                setReleasePayload={setReleasePayload}
                            />
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
        )
    )
}

export default EditRelease
