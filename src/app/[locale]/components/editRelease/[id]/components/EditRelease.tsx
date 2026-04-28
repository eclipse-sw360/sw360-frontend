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
import Link from 'next/link'
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader } from 'next-sw360'
import { ReactNode, useEffect, useState } from 'react'
import { Col, ListGroup, Row, Tab } from 'react-bootstrap'
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import EditAttachments from '@/components/Attachments/EditAttachments'
import AddCommercialDetails from '@/components/CommercialDetails/AddCommercialDetails'
import CreateMRCommentDialog from '@/components/CreateMRCommentDialog/CreateMRCommentDialog'
import LinkedReleases from '@/components/LinkedReleases/LinkedReleases'
import {
    ActionType,
    ClearingInformation,
    COTSDetails,
    CommonTabIds,
    Creator,
    DocumentCreationInformation,
    DocumentTypes,
    ECCInformation,
    Release,
    ReleaseDetail,
    ReleaseTabIds,
    SPDX,
    UserGroupType,
    Vendor,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import DeleteReleaseModal from '../../../detail/[id]/components/DeleteReleaseModal'
import EditClearingDetails from './EditClearingDetails'
import EditECCDetails from './EditECCDetails'
import EditLinkedPackages from './EditLinkedPackage'
import EditSPDXDocument from './EditSPDXDocument'
import ReleaseEditSummary from './ReleaseEditSummary'

interface Props {
    releaseId: string
    isSPDXFeatureEnabled: boolean
}

const EditRelease = ({ releaseId, isSPDXFeatureEnabled }: Props): ReactNode => {
    const router = useRouter()
    const t = useTranslations('default')
    const params = useSearchParams()
    const [release, setRelease] = useState<ReleaseDetail>()
    const [componentId, setComponentId] = useState('')
    const [deletingRelease, setDeletingRelease] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [showCommentModal, setShowCommentModal] = useState<boolean>(false)
    const { status } = useSession()
    const [activeKey, setActiveKey] = useState(CommonTabIds.SUMMARY)

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        const fragment = params.get('tab') ?? CommonTabIds.SUMMARY
        setActiveKey(fragment)
    }, [
        params,
    ])

    const handleSelect = (key: string | null) => {
        setActiveKey(key ?? CommonTabIds.SUMMARY)
        router.push(`?tab=${key}`)
    }

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
                if (response.status === StatusCodes.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== StatusCodes.OK) {
                    return notFound()
                }
                const release: ReleaseDetail = (await response.json()) as ReleaseDetail
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
                            release._embedded['sw360:createdBy'].email,
                        )
                    } else {
                        creators = [
                            {
                                type: 'Person',
                                value: `${session.user.name} (${session.user.email})`,
                                index: 0,
                            },
                        ]
                    }
                }
                const documentCreationInfomation: DocumentCreationInformation | undefined = release._embedded[
                    'sw360:documentCreationInformation'
                ]
                    ? {
                          id: release._embedded['sw360:documentCreationInformation'].id,
                          spdxDocumentId: release._embedded['sw360:documentCreationInformation'].spdxDocumentId, // Id of the parent SPDX Document
                          spdxVersion: release._embedded['sw360:documentCreationInformation'].spdxVersion, // 6.1
                          dataLicense: release._embedded['sw360:documentCreationInformation'].dataLicense, // 6.2
                          SPDXID: release._embedded['sw360:documentCreationInformation'].SPDXID, // 6.3
                          name: release._embedded['sw360:documentCreationInformation'].name, // 6.4
                          documentNamespace: release._embedded['sw360:documentCreationInformation'].documentNamespace, // 6.5
                          externalDocumentRefs:
                              release._embedded['sw360:documentCreationInformation'].externalDocumentRefs, // 6.6
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
                    : {
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
                const embeddedPkgs = release._embedded?.['sw360:packages'] ?? []
                const linkedPackages = embeddedPkgs
                    .map((p) => ({
                        packageId: CommonUtils.getIdFromUrl(p._links?.self?.href),
                        name: p.name ?? '',
                        version: p.version ?? '',
                        licenseIds: p.licenseIds ?? [],
                        packageManager: p.packageManager ?? '',
                    }))
                    .filter((p) => p.packageId)

                setReleasePayload((prev) => ({
                    ...prev,
                    linkedPackages,
                    clearingInformation: release.clearingInformation,
                    cotsDetails: release['_embedded']['sw360:cotsDetail'] ?? null,
                }))

                if (typeof release.eccInformation !== 'undefined') {
                    const eccInformation: ECCInformation = release.eccInformation
                    setEccInformation(eccInformation)
                }

                if (release['_embedded']['sw360:cotsDetail']) {
                    const cotsDetails: COTSDetails = release['_embedded']['sw360:cotsDetail']
                    setCotsDetails(cotsDetails)
                    if (cotsDetails['_embedded']) {
                        setCotsResponsible({
                            [cotsDetails._embedded['sw360:cotsResponsible'].email]:
                                cotsDetails._embedded['sw360:cotsResponsible'].fullName ?? '',
                        })
                    }
                }

                if (release['_embedded']['sw360:licenses']) {
                    const mainLicenses = release['_embedded']['sw360:licenses'].reduce(
                        (result, item) => {
                            const licenseId = item._links?.self.href.split('/').at(-1)
                            if (licenseId !== undefined) result[licenseId] = item.fullName ?? ''
                            return result
                        },
                        {} as {
                            [k: string]: string
                        },
                    )
                    setMainLicenses(mainLicenses)
                }

                if (release['_embedded']['sw360:otherLicenses']) {
                    const otherLicenses = release['_embedded']['sw360:otherLicenses'].reduce(
                        (result, item) => {
                            const licenseId = item._links?.self.href.split('/').at(-1)
                            if (licenseId !== undefined) result[licenseId] = item.fullName ?? ''
                            return result
                        },
                        {} as {
                            [k: string]: string
                        },
                    )
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
    }, [
        releaseId,
    ])

    const [releasePayload, setReleasePayload] = useState<
        Release & {
            packageIds?: string[]
        }
    >({
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

    const [mainLicenses, setMainLicenses] = useState<{
        [k: string]: string
    }>({})

    const [otherLicenses, setOtherLicenses] = useState<{
        [k: string]: string
    }>({})

    const [cotsResponsible, setCotsResponsible] = useState<{
        [k: string]: string
    }>({})

    const [errorLicenseIdentifier, setErrorLicenseIdentifier] = useState(false)
    const [errorExtractedText, setErrorExtractedText] = useState(false)
    const [errorCreator, setErrorCreator] = useState(false)
    const [inputValid, setInputValid] = useState(false)

    const validateCreator = (SPDXPayload: SPDX) => {
        if (CommonUtils.isNullEmptyOrUndefinedArray(SPDXPayload.documentCreationInformation?.creator)) {
            setErrorCreator(true)
        }
        return false
    }

    const validateLicenseIdentifier = (SPDXPayload: SPDX): boolean => {
        if (!SPDXPayload.spdxDocument) return false
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

    const updateRelease = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }

        if (isSPDXFeatureEnabled === true) {
            setInputValid(true)
            if (validateLicenseIdentifier(SPDXPayload) && validateExtractedText(SPDXPayload)) {
                setErrorLicenseIdentifier(true)
                setErrorExtractedText(true)
            }
            if (
                validateLicenseIdentifier(SPDXPayload) ||
                validateExtractedText(SPDXPayload) ||
                validateCreator(SPDXPayload)
            ) {
                return
            } else {
                const responseUpdateSPDX = await ApiUtils.PATCH(
                    `releases/${releaseId}/spdx`,
                    SPDXPayload,
                    session.user.access_token,
                )
                if (responseUpdateSPDX.status === StatusCodes.UNAUTHORIZED) {
                    MessageService.error(t('Session has expired'))
                    return
                }
                if (
                    responseUpdateSPDX.status !== StatusCodes.OK &&
                    responseUpdateSPDX.status !== StatusCodes.ACCEPTED
                ) {
                    MessageService.error('Release update failed')
                    return
                }
            }
        }
        try {
            const eccInfo = releasePayload.eccInformation
            const sanitizedEccInformation: ECCInformation | undefined = eccInfo
                ? {
                      ...eccInfo,
                      eccStatus: eccInfo.eccStatus?.trim() !== '' ? eccInfo.eccStatus : undefined,
                  }
                : undefined
            const { linkedPackages, clearingState, ...cleanPayload } = releasePayload

            const finalPayload: Release = {
                ...cleanPayload,
                eccInformation: sanitizedEccInformation,
            }
            const response = await ApiUtils.PATCH(`releases/${releaseId}`, finalPayload, session.user.access_token)

            if (response.status === StatusCodes.OK) {
                const release = (await response.json()) as ReleaseDetail
                MessageService.success(`Release ${release.name} (${release.version}) updated successfully!`)
                router.push('/components/releases/detail/' + releaseId)
            } else if (response.status === StatusCodes.ACCEPTED) {
                MessageService.success(t('Moderation request is created'))
                router.push('/components/releases/detail/' + releaseId)
            } else {
                const data = await response.json()
                MessageService.error(data.message)
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e)
            MessageService.error(msg)
        }
    }

    const checkUpdateEligibility = async (releaseId: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const url = CommonUtils.createUrlWithParams(`moderationrequest/validate`, {
            entityType: 'RELEASE',
            entityId: releaseId,
        })
        const response = await ApiUtils.POST(url, {}, session.user.access_token)
        switch (response.status) {
            case StatusCodes.UNAUTHORIZED:
                MessageService.warn(t('Unauthorized request'))
                return 'DENIED'
            case StatusCodes.FORBIDDEN:
                MessageService.warn(t('Access Denied'))
                return 'DENIED'
            case StatusCodes.BAD_REQUEST:
                MessageService.warn(t('Invalid input or missing required parameters'))
                return 'DENIED'
            case StatusCodes.INTERNAL_SERVER_ERROR:
                MessageService.error(t('Internal server error'))
                return 'DENIED'
            case StatusCodes.OK:
                MessageService.info(t('You can write to the entity'))
                return 'OK'
            case StatusCodes.ACCEPTED:
                MessageService.info(t('You are allowed to perform write with MR'))
                return 'ACCEPTED'
            default:
                MessageService.error(t('Error when processing'))
                return 'DENIED'
        }
    }

    const checkPreRequisite = async () => {
        const isEligible = await checkUpdateEligibility(releaseId)
        if (isEligible === 'OK') {
            await updateRelease()
        } else if (isEligible === 'ACCEPTED') {
            setShowCommentModal(true)
        } else if (isEligible === 'DENIED') {
            return
        }
    }

    const handleDeleteRelease = () => {
        setDeleteModalOpen(true)
    }

    const headerButtons = {
        'Update Release': {
            link: '',
            type: 'primary',
            onClick: checkPreRequisite,
            name: t('Update Release'),
        },
        'Delete Release': {
            link: '',
            type: 'danger',
            onClick: handleDeleteRelease,
            name: t('Delete Release'),
        },
        Cancel: {
            link: '/components/releases/detail/' + releaseId,
            type: 'secondary',
            name: t('Cancel'),
        },
    }

    const param = useParams()
    const locale = (param.locale as string) || 'en'
    const componentsPath = `/${locale}/components`

    return (
        release && (
            <>
                <Breadcrumb className='container page-content'>
                    <Breadcrumb.Item
                        linkAs={Link}
                        href={componentsPath}
                    >
                        {t('Components')}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item
                        linkAs={Link}
                        href={`${componentsPath}/detail/${componentId}`}
                    >
                        {release.name}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>{`${release.name} (${release.version})`}</Breadcrumb.Item>
                </Breadcrumb>
                <CreateMRCommentDialog<Release>
                    show={showCommentModal}
                    setShow={setShowCommentModal}
                    updateEntity={updateRelease}
                    setEntityPayload={setReleasePayload}
                />
                <DeleteReleaseModal
                    actionType={ActionType.EDIT}
                    componentId={componentId}
                    releaseId={deletingRelease}
                    show={deleteModalOpen}
                    setShow={setDeleteModalOpen}
                />
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
                                    {isSPDXFeatureEnabled && (
                                        <ListGroup.Item
                                            action
                                            eventKey={ReleaseTabIds.SPDX_DOCUMENT}
                                        >
                                            <div className='my-2'>{t('SPDX Document')}</div>
                                        </ListGroup.Item>
                                    )}
                                    <ListGroup.Item
                                        action
                                        eventKey={ReleaseTabIds.LINKED_RELEASES}
                                    >
                                        <div className='my-2'>{t('Linked Releases')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey={ReleaseTabIds.LINKED_PACKAGES}
                                    >
                                        <div className='my-2'>{t('Linked Packages')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey={ReleaseTabIds.CLEARING_DETAILS}
                                    >
                                        <div className='my-2'>{t('Clearing Details')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey={ReleaseTabIds.ECC_DETAILS}
                                    >
                                        <div className='my-2'>
                                            {t('ECC Details')}{' '}
                                            <span className={release.eccInformation?.eccStatus ?? ''}></span>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey={CommonTabIds.ATTACHMENTS}
                                    >
                                        <div className='my-2'>{t('Attachments')}</div>
                                    </ListGroup.Item>
                                    {release.componentType === 'COTS' && (
                                        <ListGroup.Item
                                            action
                                            eventKey={ReleaseTabIds.COMMERCIAL_DETAILS}
                                        >
                                            <div className='my-2'>{t('Commercial Details')}</div>
                                        </ListGroup.Item>
                                    )}
                                </ListGroup>
                            </Col>
                            <Col className='me-3 ms-2'>
                                <Row>
                                    <PageButtonHeader
                                        buttons={headerButtons}
                                        title={release.name}
                                    ></PageButtonHeader>
                                </Row>
                                <Row>
                                    <Tab.Content>
                                        <Tab.Pane eventKey={CommonTabIds.SUMMARY}>
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
                                        </Tab.Pane>
                                        {isSPDXFeatureEnabled === true && (
                                            <Tab.Pane eventKey={ReleaseTabIds.SPDX_DOCUMENT}>
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
                                            </Tab.Pane>
                                        )}
                                        <Tab.Pane eventKey={ReleaseTabIds.LINKED_RELEASES}>
                                            <LinkedReleases
                                                actionType={ActionType.EDIT}
                                                release={release}
                                                releasePayload={releasePayload}
                                                setReleasePayload={setReleasePayload}
                                            />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={ReleaseTabIds.LINKED_PACKAGES}>
                                            <EditLinkedPackages
                                                releasePayload={releasePayload}
                                                setReleasePayload={setReleasePayload}
                                            />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={ReleaseTabIds.CLEARING_DETAILS}>
                                            <EditClearingDetails
                                                releasePayload={releasePayload}
                                                setReleasePayload={setReleasePayload}
                                            />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={ReleaseTabIds.ECC_DETAILS}>
                                            <EditECCDetails
                                                releasePayload={releasePayload}
                                                setReleasePayload={setReleasePayload}
                                            />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={CommonTabIds.ATTACHMENTS}>
                                            {releasePayload.componentId !== null && (
                                                <EditAttachments
                                                    documentId={releaseId}
                                                    documentType={DocumentTypes.RELEASE}
                                                    documentPayload={releasePayload}
                                                    setDocumentPayload={setReleasePayload}
                                                />
                                            )}
                                        </Tab.Pane>
                                        {release.componentType === 'COTS' && (
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
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(EditRelease, [
    UserGroupType.SECURITY_USER,
    UserGroupType.VIEWER,
])
