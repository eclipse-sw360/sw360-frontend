// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import { PageButtonHeader, SideBar } from '@/components/sw360'
import { Changelogs, HttpStatus, LicenseDetail, LicenseTabIds, Embedded } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { signOut, getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import Detail from './Detail'
import Obligations from './Obligations'
import Text from './Text'
import styles from '../detail.module.css'
import MessageService from '@/services/message.service'
import React from 'react'

interface Props {
    licenseId: string
}

const tabList = [
    {
        id: LicenseTabIds.DETAILS,
        name: 'Details',
    },
    {
        id: LicenseTabIds.TEXT,
        name: 'Text',
    },
    {
        id: LicenseTabIds.OBLIGATIONS,
        name: 'Obligations',
    },
    {
        id: LicenseTabIds.CHANGE_LOG,
        name: 'Change Log',
    },
]

type EmbeddedChangeLogs = Embedded<Changelogs, 'sw360:changeLogs'>

const LicenseDetailOverview = ({ licenseId }: Props) : ReactNode => {
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(LicenseTabIds.DETAILS)
    const [changesLogTab, setChangesLogTab] = useState('list-change')
    const [changeLogIndex, setChangeLogIndex] = useState(-1)
    const [license, setLicenseDetail] = useState<LicenseDetail | undefined>(undefined)
    const [changeLogList, setChangeLogList] = useState<Array<Changelogs>>([])
    const [isEditWhitelist, setIsEditWhitelist] = useState(false)
    const [whitelist, setWhitelist] = useState<Map<string, boolean> | undefined>(undefined)
    const params = useSearchParams()

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session))
                    return signOut()
                const response = await ApiUtils.GET(`licenses/${licenseId}`, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const licenses = await response.json() as LicenseDetail
                setLicenseDetail(licenses)
            } catch (e) {
                console.error(e)
            }
        })()
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session))
                    return signOut()
                const response = await ApiUtils.GET(
                    `changelog/document/${licenseId}`,
                    session.user.access_token,
                    signal
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const data = await response.json() as EmbeddedChangeLogs

                setChangeLogList(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:changeLogs'])
                        ? []
                        : data['_embedded']['sw360:changeLogs']
                )
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [params, licenseId])

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
            return
        }
        if (CommonUtils.isNullOrUndefined(whitelist))
            return
        const whitelistObj = Object.fromEntries(whitelist)
        const response = await ApiUtils.PATCH(
            `licenses/${licenseId}/whitelist`,
            whitelistObj,
            session.user.access_token
        )
        if (response.status == HttpStatus.OK) {
            MessageService.success(t('License updated successfully!'))
            window.location.reload()
        } else {
            MessageService.error(t('License updated failed!'))
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
        'Edit Whitelist': { link: '', type: 'secondary', onClick: handleEditWhitelist, name: t('Edit Whitelist') },
    }

    const headerButtonsUpdateWhitelist = {
        'Update Whitelist': { link: '', type: 'primary', onClick: handleUpdateWhitelist, name: t('Update Whitelist') },
        Cancel: { link: '', type: 'light', onClick: handleCancel, name: t('Cancel') },
    }


    return (
        license && (
            <div className={`container ${styles['row-license-detail']}`}>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabList={tabList} />
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
                                                    changesLogTab={changesLogTab}
                                                    setChangesLogTab={setChangesLogTab}
                                                    changeLogIndex={changeLogIndex}
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
                        <div className='row' hidden={selectedTab !== LicenseTabIds.DETAILS ? true : false}>
                            <Detail license={license} setLicense={setLicenseDetail} />
                        </div>
                        <div className='row' hidden={selectedTab !== LicenseTabIds.TEXT ? true : false}>
                            <Text license={license} />
                        </div>
                        <div className='row' hidden={selectedTab !== LicenseTabIds.OBLIGATIONS ? true : false}>
                            <Obligations
                                licenseId={licenseId}
                                isEditWhitelist={isEditWhitelist}
                                whitelist={whitelist}
                                setWhitelist={setWhitelist}
                            />
                        </div>
                        <div className='row' hidden={selectedTab != LicenseTabIds.CHANGE_LOG ? true : false}>
                            <div className='col'>
                                <div className='row' hidden={changesLogTab != 'list-change' ? true : false}>
                                    <ChangeLogList
                                        setChangeLogIndex={setChangeLogIndex}
                                        documentId={licenseId}
                                        setChangesLogTab={setChangesLogTab}
                                        changeLogList={changeLogList}
                                    />
                                </div>
                                <div className='row' hidden={changesLogTab != 'view-log' ? true : false}>
                                    <ChangeLogDetail changeLogData={changeLogList[changeLogIndex]} />
                                    <div id='cardScreen' style={{ padding: '0px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

export default LicenseDetailOverview
