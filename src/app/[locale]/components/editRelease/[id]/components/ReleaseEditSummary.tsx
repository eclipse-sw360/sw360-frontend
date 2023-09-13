// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import AddAdditionalRolesComponent from '@/components/AddAdditionalRoles'
import AddKeyValueComponent from '@/components/AddKeyValue'
import ReleaseRepository from '@/components/ReleaseRepository/ReleaseRepository'
import ReleaseSummary from '@/components/ReleaseSummary/ReleaseSummary'
import COTSDetails from '@/object-types/COTSDetails'
import ClearingInformation from '@/object-types/ClearingInformation'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import ECCInformation from '@/object-types/ECCInformation'
import Licenses from '@/object-types/Licenses'
import Moderators from '@/object-types/Moderators'
import ReleasePayload from '@/object-types/ReleasePayload'
import { Session } from '@/object-types/Session'
import Vendor from '@/object-types/Vendor'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import HttpStatus from '@/object-types/enums/HttpStatus'
import ApiUtils from '@/utils/api/api.util'
import CommonUtils from '@/utils/common.utils'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import InputKeyValue from '@/object-types/InputKeyValue'

interface Props {
    session?: Session
    release?: any
    releaseId?: string
    actionType?: string
    releasePayload?: ReleasePayload
    setReleasePayload?: React.Dispatch<React.SetStateAction<ReleasePayload>>
    vendor?: Vendor
    setVendor?: React.Dispatch<React.SetStateAction<Vendor>>
    mainLicensesId?: Licenses
    setMainLicensesId?: React.Dispatch<React.SetStateAction<Licenses>>
    otherLicensesId?: Licenses
    setOtherLicensesId?: React.Dispatch<React.SetStateAction<Licenses>>
    contributor?: Moderators
    setContributor?: React.Dispatch<React.SetStateAction<Moderators>>
    moderator?: Moderators
    setModerator?: React.Dispatch<React.SetStateAction<Moderators>>
    cotsDetails: COTSDetails
    eccInformation: ECCInformation
    clearingInformation: ClearingInformation
}

export default function ReleaseEditSummary({
    session,
    release,
    releaseId,
    actionType,
    releasePayload,
    setReleasePayload,
    vendor,
    setVendor,
    mainLicensesId,
    setMainLicensesId,
    otherLicensesId,
    setOtherLicensesId,
    contributor,
    setContributor,
    moderator,
    setModerator,
    cotsDetails,
    eccInformation,
    clearingInformation,
}: Props) {
    const t = useTranslations(COMMON_NAMESPACE)
    const [roles, setRoles] = useState<InputKeyValue[]>([])
    const [externalIds, setExternalIds] = useState<InputKeyValue[]>([])
    const [addtionalData, setAddtionalData] = useState<InputKeyValue[]>([])

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
        if (typeof release.roles !== 'undefined') {
            setRoles(CommonUtils.convertObjectToMapRoles(release.roles))
        }

        if (typeof release.externalIds !== 'undefined') {
            setExternalIds(CommonUtils.convertObjectToMap(release.externalIds))
        }

        if (typeof release.additionalData !== 'undefined') {
            setAddtionalData(CommonUtils.convertObjectToMap(release.additionalData))
        }

        if (typeof release['_embedded']['sw360:moderators'] !== 'undefined') {
            setModerator(CommonUtils.handlerModerators(release['_embedded']['sw360:moderators']))
        }

        if (typeof release['_embedded']['sw360:contributors'] !== 'undefined') {
            setContributor(CommonUtils.handlerContributor(release['_embedded']['sw360:contributors']))
        }

        let vendorId = ''
        if (typeof release['_embedded']['sw360:vendors'] !== 'undefined') {
            vendorId = CommonUtils.getIdFromUrl(release['_embedded']['sw360:vendors'][0]._links.self.href)
            const vendor: Vendor = {
                id: vendorId,
                fullName: release['_embedded']['sw360:vendors'][0].fullName,
            }
            setVendor(vendor)
        }

        let modifiedBy = ''
        if (typeof release['_embedded']['sw360:modifiedBy'] !== 'undefined') {
            modifiedBy = release['_embedded']['sw360:modifiedBy']['fullName']
        }

        let createBy = ''
        if (typeof release['_embedded']['sw360:createdBy'] !== 'undefined') {
            createBy = release['_embedded']['sw360:createdBy']['fullName']
        }

        let componentId = ''
        if (typeof release['_links']['sw360:component']['href'] !== 'undefined') {
            componentId = CommonUtils.getIdFromUrl(release['_links']['sw360:component']['href'])
        }

        const releasePayload: ReleasePayload = {
            name: release.name,
            cpeid: release.cpeId,
            version: release.version,
            componentId: componentId,
            releaseDate: release.releaseDate,
            externalIds: release.externalIds,
            additionalData: release.additionalData,
            clearingState: release.clearingState,
            mainlineState: release.mainlineState,
            contributors: CommonUtils.getEmailsModerators(release['_embedded']['sw360:contributors']),
            createdOn: release.createdOn,
            createBy: createBy,
            modifiedBy: modifiedBy,
            modifiedOn: release.modifiedOn,
            moderators: CommonUtils.getEmailsModerators(release['_embedded']['sw360:moderators']),
            roles: CommonUtils.convertRoles(CommonUtils.convertObjectToMapRoles(release.roles)),
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
    }, [
        releaseId,
        fetchData,
        release,
        cotsDetails,
        eccInformation,
        clearingInformation,
        setVendor,
        setReleasePayload,
        setContributor,
        setModerator,
    ])

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
                        session={session}
                        actionType={actionType}
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
                    <div className='row mb-4'>
                        <AddAdditionalRolesComponent
                            documentType={DocumentTypes.COMPONENT}
                            roles={roles}
                            setRoles={setRoles}
                            setDataRoles={setDataRoles}
                        />
                    </div>
                    <div className='row mb-4'>
                        <AddKeyValueComponent
                            header={t('External ids')}
                            keyName={'external id'}
                            setData={setExternalIds}
                            data={externalIds}
                            setMap={setDataExternalIds}
                        />
                    </div>
                    <div className='row mb-4'>
                        <AddKeyValueComponent
                            header={t('Additional Data')}
                            keyName={'additional data'}
                            setData={setAddtionalData}
                            data={addtionalData}
                            setMap={setDataAddtionalData}
                        />
                    </div>
                    <ReleaseRepository releasePayload={releasePayload} setReleasePayload={setReleasePayload} />
                </div>
            </form>
        </>
    )
}
