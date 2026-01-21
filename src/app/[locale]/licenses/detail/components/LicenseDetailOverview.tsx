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
import { useSearchParams } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import { PageButtonHeader, SideBar } from '@/components/sw360'
import {
    Changelogs,
    Embedded,
    ErrorDetails,
    LicenseDetail,
    LicenseTabIds,
    PageableQueryParam,
    PaginationMeta,
    UserGroupType,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

import Detail from './Detail'
import Obligations from './Obligations'
import Text from './Text'

interface Props {
    licenseId: string
}

type EmbeddedChangeLogs = Embedded<Changelogs, 'sw360:changeLogs'>

const LicenseDetailOverview = ({ licenseId }: Props): ReactNode => {
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(LicenseTabIds.DETAILS)
    const [license, setLicenseDetail] = useState<LicenseDetail | undefined>(undefined)
    const [isEditWhitelist, setIsEditWhitelist] = useState(false)
    const [whitelist, setWhitelist] = useState<Map<string, boolean> | undefined>(undefined)
    const params = useSearchParams()
    const [changeLogId, setChangeLogId] = useState('')
    const [changelogTab, setChangelogTab] = useState('list-change')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const tabList = [
        {
            id: LicenseTabIds.DETAILS,
            name: t('Details'),
        },
        {
            id: LicenseTabIds.TEXT,
            name: t('Text'),
        },
        {
            id: LicenseTabIds.OBLIGATIONS,
            name: t('Obligations'),
        },
        {
            id: LicenseTabIds.CHANGE_LOG,
            name: t('Change Log'),
        },
    ]

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(`licenses/${licenseId}`, session.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const licenses = (await response.json()) as LicenseDetail
                setLicenseDetail(licenses)
            } catch (error: unknown) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            }
        })()
        return () => controller.abort()
    }, [
        params,
        licenseId,
    ])

    const handleEditWhitelist = () => {
        setIsEditWhitelist(true)
    }
    const handleCancel = () => {
        setIsEditWhitelist(false)
    }

    const handleUpdateWhitelist = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        if (CommonUtils.isNullOrUndefined(whitelist)) return
        const whitelistObj = Object.fromEntries(whitelist)
        const response = await ApiUtils.PATCH(
            `licenses/${licenseId}/whitelist`,
            whitelistObj,
            session.user.access_token,
        )
        if (response.status == StatusCodes.OK) {
            MessageService.success(t('License updated successfully'))
            window.location.reload()
        } else {
            MessageService.error(t('License update failed'))
        }
    }

    const headerButtons = {
        'Edit License': {
            link: `/licenses/edit?id=${encodeURIComponent(licenseId)}`,
            type: 'primary',
            name: t('Edit License'),
        },
    }

    const headerButtonsEditWhitelist = {
        'Edit License': {
            link: `/licenses/edit?id=${encodeURIComponent(licenseId)}`,
            type: 'primary',
            name: t('Edit License'),
        },
        'Edit Whitelist': {
            link: '',
            type: 'secondary',
            onClick: handleEditWhitelist,
            name: t('Edit Whitelist'),
        },
    }

    const headerButtonsUpdateWhitelist = {
        'Update whitelist': {
            link: '',
            type: 'primary',
            onClick: handleUpdateWhitelist,
            name: t('Update whitelist'),
        },
        Cancel: {
            link: '',
            type: 'light',
            onClick: handleCancel,
            name: t('Cancel'),
        },
    }

    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: '',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const [changeLogList, setChangeLogList] = useState<Changelogs[]>(() => [])
    const memoizedData = useMemo(
        () => changeLogList,
        [
            changeLogList,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = changeLogList.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `changelog/document/${licenseId}`,
                    Object.fromEntries(
                        Object.entries(pageableQueryParam).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )

                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }
                const responseText = await response.text()
                if (CommonUtils.isNullEmptyOrUndefinedString(responseText)) {
                    setChangeLogList([])
                    return
                } else {
                    const data = JSON.parse(responseText) as EmbeddedChangeLogs
                    setPaginationMeta(data.page)
                    setChangeLogList(
                        CommonUtils.isNullOrUndefined(data['_embedded']['sw360:changeLogs'])
                            ? []
                            : data['_embedded']['sw360:changeLogs'],
                    )
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        pageableQueryParam,
        licenseId,
        session,
    ])

    return (
        license && (
            <div className='container license-detail-row'>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                            tabList={tabList}
                        />
                    </div>
                    <div className='col'>
                        <div className='row'>
                            {selectedTab === LicenseTabIds.OBLIGATIONS ? (
                                <>
                                    {!CommonUtils.isNullEmptyOrUndefinedArray(license.obligationDatabaseIds) ? (
                                        <>
                                            {isEditWhitelist ? (
                                                <PageButtonHeader
                                                    title={`${license.fullName} (${license.shortName})`}
                                                    buttons={headerButtonsUpdateWhitelist}
                                                    checked={license.checked}
                                                ></PageButtonHeader>
                                            ) : (
                                                <PageButtonHeader
                                                    title={`${license.fullName} (${license.shortName})`}
                                                    buttons={headerButtonsEditWhitelist}
                                                    checked={license.checked}
                                                ></PageButtonHeader>
                                            )}
                                        </>
                                    ) : (
                                        <PageButtonHeader
                                            title={`${license.fullName} (${license.shortName})`}
                                            buttons={headerButtons}
                                            checked={license.checked}
                                        ></PageButtonHeader>
                                    )}
                                </>
                            ) : (
                                <>
                                    {isEditWhitelist ? (
                                        <PageButtonHeader
                                            title={`${license.fullName} (${license.shortName})`}
                                            buttons={headerButtonsUpdateWhitelist}
                                            checked={license.checked}
                                        ></PageButtonHeader>
                                    ) : (
                                        <>
                                            {selectedTab === LicenseTabIds.CHANGE_LOG ? (
                                                <PageButtonHeader
                                                    title={`${license.fullName} (${license.shortName})`}
                                                    buttons={headerButtons}
                                                    checked={license.checked}
                                                    changesLogTab={changelogTab}
                                                    setChangesLogTab={setChangelogTab}
                                                    changeLogId={changeLogId}
                                                ></PageButtonHeader>
                                            ) : (
                                                <PageButtonHeader
                                                    title={`${license.fullName} (${license.shortName})`}
                                                    buttons={headerButtons}
                                                    checked={license.checked}
                                                ></PageButtonHeader>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab !== LicenseTabIds.DETAILS ? true : false}
                        >
                            <Detail
                                license={license}
                                setLicense={setLicenseDetail}
                            />
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab !== LicenseTabIds.TEXT ? true : false}
                        >
                            <Text license={license} />
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab !== LicenseTabIds.OBLIGATIONS ? true : false}
                        >
                            <Obligations
                                licenseId={licenseId}
                                isEditWhitelist={isEditWhitelist}
                                whitelist={whitelist}
                                setWhitelist={setWhitelist}
                            />
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab != LicenseTabIds.CHANGE_LOG ? true : false}
                        >
                            <div className='col'>
                                <div
                                    className='row'
                                    hidden={changelogTab !== 'list-change' ? true : false}
                                >
                                    <ChangeLogList
                                        setChangeLogId={setChangeLogId}
                                        documentId={licenseId}
                                        setChangesLogTab={setChangelogTab}
                                        changeLogList={memoizedData}
                                        pageableQueryParam={pageableQueryParam}
                                        setPageableQueryParam={setPageableQueryParam}
                                        showProcessing={showProcessing}
                                        paginationMeta={paginationMeta}
                                    />
                                </div>
                                <div
                                    className='row'
                                    hidden={changelogTab !== 'view-log' ? true : false}
                                >
                                    <ChangeLogDetail
                                        changeLogData={changeLogList.filter((d: Changelogs) => d.id === changeLogId)[0]}
                                    />
                                    <div
                                        id='cardScreen'
                                        style={{
                                            padding: '0px',
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

// export default LicenseDetailOverview
// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(LicenseDetailOverview, [
    UserGroupType.SECURITY_USER,
])
