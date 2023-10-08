// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut } from 'next-auth/react'
import { ToastContainer } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { ApiUtils, CommonUtils } from '@/utils'
import { Licenses, HttpStatus, Session } from '@/object-types'
import { PageButtonHeader, SideBar } from '@/components/sw360'
import ActionType from '@/object-types/enums/ActionType'
import AddCommercialDetails from '@/components/CommercialDetails/AddCommercialDetails'
import ClearingInformation from '@/object-types/ClearingInformation'
import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import ComponentOwner from '@/object-types/ComponentOwner'
import COTSDetails from '@/object-types/COTSDetails'
import DeleteReleaseModal from '../../../detail/[id]/components/DeleteReleaseModal'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import ECCInformation from '@/object-types/ECCInformation'
import EditAttachments from '@/components/Attachments/EditAttachments'
import EditClearingDetails from './EditClearingDetails'
import EditECCDetails from './EditECCDetails'
import LinkedReleases from '@/components/LinkedReleases/LinkedReleases'
import Moderators from '@/object-types/Moderators'
import ReleaseDetail from '@/object-types/ReleaseDetail'
import ReleaseEditSummary from './ReleaseEditSummary'
import ReleaseEditTabs from './ReleaseEditTabs'
import ReleasePayload from '@/object-types/ReleasePayload'
import ReleaseTabIds from '@/object-types/enums/ReleaseTabIds'
import ToastData from '@/object-types/ToastData'
import ToastMessage from '@/components/sw360/ToastContainer/Toast'
import Vendor from '@/object-types/Vendor'

interface Props {
    session?: Session
    releaseId?: string
}

const EditRelease = ({ session, releaseId }: Props) => {
    const router = useRouter()
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [tabList, setTabList] = useState(ReleaseEditTabs.WITHOUT_COMMERCIAL_DETAILS)
    const [release, setRelease] = useState<ReleaseDetail>()
    const [componentId, setComponentId] = useState('')
    const [deletingRelease, setDeletingRelease] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const release = (await response.json()) as ReleaseDetail
                return release
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                return null
            }
        },
        [session.user.access_token]
    )

    useEffect(() => {
        void fetchData(`releases/${releaseId}`).then((release: ReleaseDetail) => {
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

            if (typeof release['_embedded']['sw360:cotsDetail'] !== 'undefined') {
                const cotsDetails: COTSDetails = release['_embedded']['sw360:cotsDetail']
                const cotsResponsible: ComponentOwner = {
                    email: cotsDetails._embedded['sw360:cotsResponsible'].email,
                    fullName: cotsDetails._embedded['sw360:cotsResponsible'].fullName,
                }
                setCotsResponsible(cotsResponsible)
                setCotsDetails(cotsDetails)
            }

            if (typeof release.clearingInformation !== 'undefined') {
                const clearingInformation: ClearingInformation = release.clearingInformation
                setClearingInformation(clearingInformation)
            }
        })
    }, [releaseId, fetchData])

    const [releasePayload, setReleasePayload] = useState<ReleasePayload>({
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

    const submit = async () => {
        const response = await ApiUtils.PATCH(`releases/${releaseId}`, releasePayload, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const release = (await response.json()) as ReleaseDetail
            alert(
                true,
                'Success',
                `Success: Release ${release.name} (${release.version})  updated successfully!`,
                'success'
            )
            const releaseId: string = CommonUtils.getIdFromUrl(release._links.self.href)
            router.push('/components/releases/detail/' + releaseId)
        } else {
            alert(true, 'Error', t('Release Create failed'), 'danger')
        }
    }

    const handleDeleteRelease = () => {
        setDeleteModalOpen(true)
    }

    const headerButtons = {
        'Update Release': { link: '', type: 'primary', onClick: submit },
        'Delete Release': {
            link: '',
            type: 'danger',
            onClick: handleDeleteRelease,
        },
        Cancel: { link: '/components/releases/detail/' + releaseId, type: 'secondary' },
    }

    return (
        release && (
            <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
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
                            <ReleaseEditSummary
                                session={session}
                                release={release}
                                releaseId={releaseId}
                                actionType={ActionType.EDIT}
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
                                cotsDetails={cotsDetails}
                                eccInformation={eccInformation}
                                clearingInformation={clearingInformation}
                            />
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.LINKED_RELEASES ? true : false}>
                            <LinkedReleases
                                actionType={ActionType.EDIT}
                                session={session}
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
                                session={session}
                                documentId={releaseId}
                                documentType={DocumentTypes.RELEASE}
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
        )
    )
}

export default EditRelease
