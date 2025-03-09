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
import { ReactNode, useEffect, useState } from 'react'

import EditAttachments from '@/components/Attachments/EditAttachments'
import AddCommercialDetails from '@/components/CommercialDetails/AddCommercialDetails'
import LinkedReleases from '@/components/LinkedReleases/LinkedReleases'
import {
    ActionType,
    COTSDetails,
    ClearingInformation,
    CommonTabIds,
    DocumentTypes,
    ECCInformation,
    HttpStatus,
    Release,
    ReleaseDetail,
    ReleaseTabIds,
    Vendor,
    Creator,
    DocumentCreationInformation,
    SPDX
} from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { SPDX_ENABLE } from '@/utils/env'
import { PageButtonHeader, SideBar } from 'next-sw360'
import DeleteReleaseModal from '../../../detail/[id]/components/DeleteReleaseModal'
import EditClearingDetails from './EditClearingDetails'
import EditECCDetails from './EditECCDetails'
import ReleaseEditSummary from './ReleaseEditSummary'
import ReleaseEditTabs from './ReleaseEditTabs'
import EditSPDXDocument from './EditSPDXDocument'
import MessageService from '@/services/message.service'

interface Props {
    releaseId: string
}

const EditRelease = ({ releaseId }: Props) : ReactNode => {
    const router = useRouter()
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [tabList, setTabList] = useState(ReleaseEditTabs.WITHOUT_COMMERCIAL_DETAILS_AND_SPDX)
    const [release, setRelease] = useState<ReleaseDetail>()
    const [componentId, setComponentId] = useState('')
    const [deletingRelease, setDeletingRelease] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    const [SPDXPayload, setSPDXPayload] = useState<SPDX>({
        spdxDocument: null,
        documentCreationInformation: null,
        packageInformation: null,
    })

    const handleCreators = (fullName: string, data: string) => {
        if (CommonUtils.isNullEmptyOrUndefinedString(data)) {
            return []
        }
        const creators: Array<Creator> = []
        const creator: Creator = {
            type: 'Person',
            value: fullName + ' (' + data + ')',
            index: 0,
        }
        creators.push(creator)
        return creators
    }

    useEffect(() => {
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(`releases/${releaseId}`, session.user.access_token)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const release: ReleaseDetail = await response.json() as ReleaseDetail
                let createdDate = release._embedded['sw360:documentCreationInformation']?.created
                if (CommonUtils.isNullEmptyOrUndefinedString(createdDate)) {
                    createdDate = new Date().toISOString()
                }
                let creators: Creator[] | undefined = release._embedded['sw360:documentCreationInformation']?.creator
                if (CommonUtils.isNullEmptyOrUndefinedArray(creators)) {
                    if (
                        !CommonUtils.isNullOrUndefined(release._embedded) &&
                        !CommonUtils.isNullOrUndefined(release._embedded['sw360:createdBy'])
                    ) {
                        creators = handleCreators(
                            release._embedded['sw360:createdBy'].fullName ?? '',
                            release._embedded['sw360:createdBy'].email
                        )
                    } else {
                        creators = [{
                            type: 'Person',
                            value: `${session.user.name} (${session.user.email})`,
                            index: 0,
                        }]
                    }
                }
                const documentCreationInfomation: DocumentCreationInformation | undefined =
                    release._embedded['sw360:documentCreationInformation']
                        ?
                            {
                                id: release._embedded['sw360:documentCreationInformation'].id,
                                spdxDocumentId: release._embedded['sw360:documentCreationInformation'].spdxDocumentId, // Id of the parent SPDX Document
                                spdxVersion: release._embedded['sw360:documentCreationInformation'].spdxVersion, // 6.1
                                dataLicense: release._embedded['sw360:documentCreationInformation'].dataLicense, // 6.2
                                SPDXID: release._embedded['sw360:documentCreationInformation'].SPDXID, // 6.3
                                name: release._embedded['sw360:documentCreationInformation'].name, // 6.4
                                documentNamespace: release._embedded['sw360:documentCreationInformation'].documentNamespace, // 6.5
                                externalDocumentRefs: release._embedded['sw360:documentCreationInformation'].externalDocumentRefs, // 6.6
                                licenseListVersion: release._embedded['sw360:documentCreationInformation'].licenseListVersion, // 6.7
                                creator: creators, // 6.8
                                created: createdDate, // 6.9
                                creatorComment: release._embedded['sw360:documentCreationInformation'].creatorComment, // 6.10
                                documentComment: release._embedded['sw360:documentCreationInformation'].documentComment, // 6.11
                                // Information for ModerationRequests
                                documentState: release._embedded['sw360:documentCreationInformation'].documentState,
                                permissions: release._embedded['sw360:documentCreationInformation'].permissions,
                                createdBy: release._embedded['sw360:documentCreationInformation'].createdBy,
                                moderators: release._embedded['sw360:documentCreationInformation'].moderators, // people who can modify the data
                            }
                        :   {
                                creator: creators, // 6.8
                                created: createdDate, // 6.9
                            }

                const SPDXPayload: SPDX = {
                    spdxDocument: release._embedded['sw360:spdxDocument'],
                    documentCreationInformation: documentCreationInfomation,
                    packageInformation: release._embedded['sw360:packageInformation'],
                }
                setSPDXPayload(SPDXPayload)
                setRelease(release)
                setDeletingRelease(releaseId)
                setComponentId(CommonUtils.getIdFromUrl(release['_links']['sw360:component']['href']))

                if (release.componentType === 'COTS' && SPDX_ENABLE !== 'true') {
                    setTabList(ReleaseEditTabs.WITH_COMMERCIAL_DETAILS)
                }

                if (typeof release.eccInformation !== 'undefined') {
                    const eccInformation: ECCInformation = release.eccInformation
                    setEccInformation(eccInformation)
                }

                if (release.componentType === 'COTS' && SPDX_ENABLE === 'true') {
                    setTabList(ReleaseEditTabs.WITH_COMMERCIAL_DETAILS_AND_SPDX)
                }

                if (release.componentType !== 'COTS' && SPDX_ENABLE === 'true') {
                    setTabList(ReleaseEditTabs.WITH_SPDX)
                }

                if (release['_embedded']['sw360:cotsDetail']) {
                    const cotsDetails: COTSDetails = release['_embedded']['sw360:cotsDetail']
                    setCotsDetails(cotsDetails)
                    if (cotsDetails['_embedded']) {
                        setCotsResponsible({
                            [cotsDetails._embedded['sw360:cotsResponsible'].email]: cotsDetails._embedded['sw360:cotsResponsible'].fullName ?? ''
                        })
                    }
                }

                if (release['_embedded']['sw360:licenses']) {
                    const mainLicenses = release['_embedded']['sw360:licenses'].reduce((result, item) => {
                                                    const licenseId = item._links?.self.href.split('/').at(-1)
                                                    if (licenseId !== undefined)
                                                        result[licenseId] = item.fullName ?? ''
                                                    return result
                                                }, {} as { [k: string]: string })
                    setMainLicenses(mainLicenses)
                }

                if (release['_embedded']['sw360:otherLicenses']) {
                    const otherLicenses = release['_embedded']['sw360:otherLicenses'].reduce((result, item) => {
                                                    const licenseId = item._links?.self.href.split('/').at(-1)
                                                    if (licenseId !== undefined)
                                                        result[licenseId] = item.fullName ?? ''
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
    }, [releaseId])

    const [releasePayload, setReleasePayload] = useState<Release>({
        name: '',
        cpeid: '',
        version: '',
        componentId: null,
        releaseDate: '',
        externalIds: null,
        additionalData: null,
        mainlineState: 'OPEN',
        contributors: null,
        moderators: null,
        roles: null,
        mainLicenseIds: null,
        otherLicenseIds: null,
        vendorId: null,
        languages: null,
        operatingSystems: null,
        softwarePlatforms: null,
        sourceCodeDownloadurl: '',
        binaryDownloadurl: '',
        repository: null,
        releaseIdToRelationship: null,
        cotsDetails: null,
        attachments: null,
        spdxId: '',
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

    const [cotsResponsible, setCotsResponsible] = useState<{ [k: string]: string }>({})

    const [errorLicenseIdentifier, setErrorLicenseIdentifier] = useState(false)
    const [errorExtractedText, setErrorExtractedText] = useState(false)
    const [errorCreator, setErrorCreator] = useState(false)
    const [inputValid, setInputValid] = useState(false)

    const validateCreator = async (SPDXPayload: SPDX) => {
        if (
            CommonUtils.isNullEmptyOrUndefinedArray(SPDXPayload.documentCreationInformation?.creator)
        ) {
            setErrorCreator(true)
            await setSelectedTab(ReleaseTabIds.SPDX_DOCUMENT)
            window.location.hash = "#spdx-creator";
            return true
        }
        return false
    }

    const validateLicenseIdentifier = (SPDXPayload: SPDX): boolean => {
        if (!SPDXPayload.spdxDocument)
            return false
        if (CommonUtils.isNullEmptyOrUndefinedArray(SPDXPayload.spdxDocument.otherLicensingInformationDetecteds)) {
            return false
        }
        let validate = false

        SPDXPayload.spdxDocument.otherLicensingInformationDetecteds.map((item) => {
            if (CommonUtils.isNullEmptyOrUndefinedString(item.licenseId) || item.licenseId === 'LicenseRef-') {
                setErrorLicenseIdentifier(true)
                validate = true
            }
        })
        return validate
    }

    const validateExtractedText = (SPDXPayload: SPDX): boolean => {
        if (CommonUtils.isNullEmptyOrUndefinedArray(SPDXPayload.spdxDocument?.otherLicensingInformationDetecteds)) {
            return false
        }
        let validate = false
        SPDXPayload.spdxDocument.otherLicensingInformationDetecteds.map((item) => {
            if (CommonUtils.isNullEmptyOrUndefinedString(item.extractedText)) {
                setErrorExtractedText(true)
                validate = true
            }
        })
        return validate
    }

    const submit = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }

        if (SPDX_ENABLE === 'true') {
            setInputValid(true)
            if (validateLicenseIdentifier(SPDXPayload) && validateExtractedText(SPDXPayload)) {
                setErrorLicenseIdentifier(true)
                setErrorExtractedText(true)
            }
            if (
                validateLicenseIdentifier(SPDXPayload) ||
                validateExtractedText(SPDXPayload) ||
                await validateCreator(SPDXPayload)
            ) {
                return
            } else {
                const responseUpdateSPDX = await ApiUtils.PATCH(
                    `releases/${releaseId}/spdx`,
                    SPDXPayload,
                    session.user.access_token
                )
                if (responseUpdateSPDX.status === HttpStatus.UNAUTHORIZED) {
                    MessageService.error(t('Session has expired'))
                    return
                }
                if (responseUpdateSPDX.status !== HttpStatus.OK && responseUpdateSPDX.status !== HttpStatus.ACCEPTED) {
                    MessageService.error('Release update failed')
                    return
                }
            }
        }

        const response = await ApiUtils.PATCH(`releases/${releaseId}`, releasePayload, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const release = (await response.json()) as ReleaseDetail
            MessageService.success(`Release ${release.name} (${release.version}) updated successfully!`)
            router.push('/components/releases/detail/' + releaseId)
        } else if (response.status === HttpStatus.ACCEPTED) {
            MessageService.success(t('Moderation request is created'))
            router.push('/components/releases/detail/' + releaseId)
        } else {
            const data = await response.json()
            MessageService.error(data.message)
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
                        {SPDX_ENABLE === 'true' && (
                            <div className='row' hidden={selectedTab !== ReleaseTabIds.SPDX_DOCUMENT ? true : false}>
                                <EditSPDXDocument
                                    releaseId={releaseId}
                                    SPDXPayload={SPDXPayload}
                                    setSPDXPayload={setSPDXPayload}
                                    errorLicenseIdentifier={errorLicenseIdentifier}
                                    setErrorLicenseIdentifier={setErrorLicenseIdentifier}
                                    errorExtractedText={errorExtractedText}
                                    setErrorExtractedText={setErrorExtractedText}
                                    errorCreator={errorCreator}
                                    setErrorCreator={setErrorCreator}
                                    inputValid={inputValid}
                                />
                            </div>
                        )}
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.ECC_DETAILS ? true : false}>
                            <EditECCDetails releasePayload={releasePayload} setReleasePayload={setReleasePayload} />
                        </div>
                        <div className='row' hidden={selectedTab != CommonTabIds.ATTACHMENTS ? true : false}>
                            {
                                releasePayload.componentId !== null &&
                                <EditAttachments
                                    documentId={releaseId}
                                    documentType={DocumentTypes.RELEASE}
                                    documentPayload={releasePayload}
                                    setDocumentPayload={setReleasePayload}
                                />
                            }
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
