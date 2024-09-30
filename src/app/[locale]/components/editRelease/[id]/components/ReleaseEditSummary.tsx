// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'

import ReleaseRepository from '@/components/ReleaseRepository/ReleaseRepository'
import ReleaseSummary from '@/components/ReleaseSummary/ReleaseSummary'
import {
    COTSDetails,
    ClearingInformation,
    DocumentTypes,
    ECCInformation,
    InputKeyValue,
    Release,
    ReleaseDetail,
    Vendor,
} from '@/object-types'
import { CommonUtils } from '@/utils'
import { AddAdditionalRoles, AddKeyValue } from 'next-sw360'

interface Props {
    release: ReleaseDetail
    releaseId?: string
    actionType: string
    releasePayload: Release
    setReleasePayload: React.Dispatch<React.SetStateAction<Release>>
    vendor?: Vendor
    setVendor: React.Dispatch<React.SetStateAction<Vendor>>
    mainLicenses?: { [k: string]: string }
    setMainLicenses?: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    otherLicenses?: { [k: string]: string }
    setOtherLicenses?: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    cotsDetails?: COTSDetails
    eccInformation?: ECCInformation
    clearingInformation?: ClearingInformation
}

function ReleaseEditSummary({
    release,
    actionType,
    releasePayload,
    setReleasePayload,
    vendor,
    setVendor,
    mainLicenses,
    setMainLicenses,
    otherLicenses,
    setOtherLicenses,
    cotsDetails,
    eccInformation,
    clearingInformation,
}: Props) : ReactNode {
    const t = useTranslations('default')
    const [roles, setRoles] = useState<InputKeyValue[]>([])
    const [externalIds, setExternalIds] = useState<InputKeyValue[]>([])
    const [addtionalData, setAddtionalData] = useState<InputKeyValue[]>([])

    // Store users data in format {'email': 'fullName'}
    const [contributors, setContributors] = useState<{ [k: string]: string }>({})
    const [moderators, setModerators] = useState<{ [k: string]: string }>({})

    const setDataAddtionalData = (additionalDatas: Map<string, string>) => {
        const obj = Object.fromEntries(additionalDatas)
        setReleasePayload({
            ...releasePayload,
            additionalData: obj,
        })
    }

    const setDataExternalIds = (externalIds: Map<string, string>) => {
        const obj = Object.fromEntries(externalIds)
        setReleasePayload({
            ...releasePayload,
            externalIds: obj,
        })
    }

    const setDataRoles = (roles: InputKeyValue[]) => {
        const roleDatas = CommonUtils.convertRoles(roles)
        setReleasePayload({
            ...releasePayload,
            roles: roleDatas,
        })
    }

    useEffect(() => {
        if (typeof release.roles !== 'undefined') {
            setRoles(CommonUtils.convertObjectToMapRoles(release.roles))
        }

        if (typeof release.externalIds !== 'undefined') {
            setExternalIds(CommonUtils.convertObjectToMap(release.externalIds))
        }

        if (typeof release.additionalData !== 'undefined') {
            setAddtionalData(CommonUtils.convertObjectToMap(release.additionalData))
        }

        let vendorId = ''
        if (!CommonUtils.isNullEmptyOrUndefinedArray(release._embedded['sw360:vendors'])) {
            vendorId = CommonUtils.getIdFromUrl(release._embedded['sw360:vendors'][0]._links?.self.href)
            const vendor: Vendor = {
                id: vendorId,
                fullName: release._embedded['sw360:vendors'][0].fullName,
            }
            setVendor(vendor)
        }

        let modifiedBy = ''
        if (typeof release._embedded['sw360:modifiedBy'] !== 'undefined') {
            modifiedBy = release._embedded['sw360:modifiedBy'].fullName ?? ''
        }

        let createdBy = ''
        if (typeof release._embedded['sw360:createdBy'] !== 'undefined') {
            createdBy = release._embedded['sw360:createdBy'].fullName ?? ''
        }

        let componentId = ''
        if (typeof release._links['sw360:component'].href !== 'undefined') {
            componentId = CommonUtils.getIdFromUrl(release._links['sw360:component'].href)
        }

        let moderatorsFromRelease = {}
        if (typeof release._embedded['sw360:moderators'] !== 'undefined') {
            moderatorsFromRelease = CommonUtils.extractEmailsAndFullNamesFromUsers(release._embedded['sw360:moderators'])
            setModerators(moderatorsFromRelease)
        }

        let contributorsFromRelease = {}
        if (typeof release._embedded['sw360:contributors'] !== 'undefined') {
            contributorsFromRelease = CommonUtils.extractEmailsAndFullNamesFromUsers(release._embedded['sw360:contributors'])
            setContributors(contributorsFromRelease)
        }

        const releasePayload: Release = {
            name: release.name,
            cpeid: release.cpeId,
            version: release.version,
            componentId: componentId,
            releaseDate: release.releaseDate,
            externalIds: release.externalIds,
            additionalData: release.additionalData,
            clearingState: release.clearingState,
            mainlineState: release.mainlineState,
            contributors: Object.keys(contributorsFromRelease),
            createdOn: release.createdOn,
            createBy: createdBy,
            modifiedBy: modifiedBy,
            modifiedOn: release.modifiedOn,
            moderators: Object.keys(moderatorsFromRelease),
            roles: CommonUtils.convertRoles(CommonUtils.convertObjectToMapRoles(release.roles ?? {})),
            mainLicenseIds: release.mainLicenseIds,
            otherLicenseIds: release.otherLicenseIds,
            vendorId: vendorId,
            languages: release.languages,
            operatingSystems: release.operatingSystems,
            softwarePlatforms: release.softwarePlatforms,
            sourceCodeDownloadurl: release.sourceCodeDownloadurl,
            binaryDownloadurl: release.binaryDownloadurl,
            repository: release.repository,
            releaseIdToRelationship: release.releaseIdToRelationship,
            cotsDetails: cotsDetails,
            eccInformation: eccInformation,
            clearingInformation: clearingInformation,
        }
        setReleasePayload(releasePayload)
    }, [])

    return (
        <>
            <form
                action=''
                id='form_submit'
                method='post'
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <div className='col' style={{ fontSize: '0.875rem' }}>
                    <ReleaseSummary
                        actionType={actionType}
                        releasePayload={releasePayload}
                        setReleasePayload={setReleasePayload}
                        vendor={vendor}
                        setVendor={setVendor}
                        mainLicenses={mainLicenses}
                        setMainLicenses={setMainLicenses}
                        otherLicenses={otherLicenses}
                        setOtherLicenses={setOtherLicenses}
                        contributors={contributors}
                        setContributors={setContributors}
                        moderators={moderators}
                        setModerators={setModerators}
                    />
                    <div className='row mb-4'>
                        <AddAdditionalRoles
                            documentType={DocumentTypes.COMPONENT}
                            inputList={roles}
                            setInputList={setRoles}
                            setDataInputList={setDataRoles}
                        />
                    </div>
                    <div className='row mb-4'>
                        <AddKeyValue
                            header={t('External ids')}
                            keyName={'external id'}
                            setData={setExternalIds}
                            data={externalIds}
                            setObject={setDataExternalIds}
                        />
                    </div>
                    <div className='row mb-4'>
                        <AddKeyValue
                            header={t('Additional Data')}
                            keyName={'additional data'}
                            setData={setAddtionalData}
                            data={addtionalData}
                            setObject={setDataAddtionalData}
                        />
                    </div>
                    <ReleaseRepository releasePayload={releasePayload} setReleasePayload={setReleasePayload} />
                </div>
            </form>
        </>
    )
}

export default ReleaseEditSummary
