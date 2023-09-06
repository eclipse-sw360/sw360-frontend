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
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import Licenses from '@/object-types/Licenses'
import Moderators from '@/object-types/Moderators'
import ReleasePayload from '@/object-types/ReleasePayload'
import { Session } from '@/object-types/Session'
import Vendor from '@/object-types/Vendor'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import HttpStatus from '@/object-types/enums/HttpStatus'
import ApiUtils from '@/utils/api/api.util'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

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
}: Props) {
    const t = useTranslations(COMMON_NAMESPACE)
    const [roles, setRoles] = useState<Input[]>([])
    const [externalIds, setExternalIds] = useState<Input[]>([])
    const [addtionalData, setAddtionalData] = useState<Input[]>([])

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

    const setDataRoles = (roles: Input[]) => {
        const roleDatas = convertRoles(roles)
        setReleasePayload({
            ...releasePayload,
            roles: roleDatas,
        })
    }
    const convertRoles = (datas: Input[]) => {
        if (datas === null) {
            return null;
        }
        const contributors: string[] = []
        const commiters: string[] = []
        const expecters: string[] = []
        datas.forEach((data) => {
            if (data.key === 'Contributor') {
                contributors.push(data.value)
            } else if (data.key === 'Committer') {
                commiters.push(data.value)
            } else if (data.key === 'Expert') {
                expecters.push(data.value)
            }
        })
        const roles = {
            Contributor: contributors,
            Committer: commiters,
            Expert: expecters,
        }
        return roles
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

    const handlerModerators = (emails: any[]) => {
        const fullNames: string[] = []
        const moderatorsEmail: string[] = []
        if (emails.length == 0) {
            return
        }
        emails.forEach((item) => {
            fullNames.push(item.fullName)
            moderatorsEmail.push(item.email)
        })
        const moderatorsName: string = fullNames.join(' , ')
        const moderatorsResponse: Moderators = {
            fullName: moderatorsName,
            emails: moderatorsEmail,
        }
        return moderatorsResponse
    }

    const handlerContributor = (emails: any[]) => {
        const fullNames: string[] = []
        const contributorsEmail: string[] = []
        if (emails.length == 0) {
            return
        }
        emails.forEach((item) => {
            fullNames.push(item.fullName)
            contributorsEmail.push(item.email)
        })
        const contributorsName: string = fullNames.join(' , ')
        const contributorsResponse: Moderators = {
            fullName: contributorsName,
            emails: contributorsEmail,
        }
        return contributorsResponse
    }

    const getEmailsModerators = (emails: any[]) => {
        const moderatorsEmail: string[] = []
        if (typeof emails === 'undefined') {
            return
        }
        emails.forEach((item) => {
            moderatorsEmail.push(item.email)
        })

        return moderatorsEmail
    }

    const convertObjectToMap = (data: string) => {
        const map = new Map(Object.entries(data))
        const inputs: Input[] = []
        map.forEach((value, key) => {
            const input: Input = {
                key: key,
                value: value,
            }
            inputs.push(input)
        })
        return inputs
    }

    const convertObjectToMapRoles = (data: string) => {
        if (data === undefined) {
            return null
        }
        const inputRoles: Input[] = []
        const mapRoles = new Map(Object.entries(data))
        mapRoles.forEach((value, key) => {
            for (let index = 0; index < value.length; index++) {
                const input: Input = {
                    key: key,
                    value: value.at(index),
                }
                inputRoles.push(input)
            }
        })
        return inputRoles
    }

    const handleId = (id: string): string => {
        return id.split('/').at(-1)
    }

    useEffect(() => {
            if (typeof release.roles !== 'undefined') {
                setRoles(convertObjectToMapRoles(release.roles))
            }

            if (typeof release.externalIds !== 'undefined') {
                setExternalIds(convertObjectToMap(release.externalIds))
            }

            if (typeof release.additionalData !== 'undefined') {
                setAddtionalData(convertObjectToMap(release.additionalData))
            }

            if (typeof release['_embedded']['sw360:moderators'] !== 'undefined') {
                setModerator(handlerModerators(release['_embedded']['sw360:moderators']))
            }

            if (typeof release['_embedded']['sw360:contributors'] !== 'undefined') {
                setContributor(handlerContributor(release['_embedded']['sw360:contributors']))
            }

            let vendorId = ''
            if (typeof release['_embedded']['sw360:vendors'] !== 'undefined') {
                vendorId = handleId(release['_embedded']['sw360:vendors'][0]._links.self.href)
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
                componentId = handleId(release['_links']['sw360:component']['href'])
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
                contributors: getEmailsModerators(release['_embedded']['sw360:contributors']),
                createdOn: release.createdOn,
                createBy: createBy,
                modifiedBy: modifiedBy,
                modifiedOn: release.modifiedOn,
                moderators: getEmailsModerators(release['_embedded']['sw360:moderators']),
                roles:convertRoles(convertObjectToMapRoles(release.roles)),
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
            }
            setReleasePayload(releasePayload)
    }, [releaseId, fetchData])

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
                    <ReleaseRepository
                        releasePayload={releasePayload}
                        setReleasePayload={setReleasePayload}
                    />
                </div>
            </form>
        </>
    )
}
