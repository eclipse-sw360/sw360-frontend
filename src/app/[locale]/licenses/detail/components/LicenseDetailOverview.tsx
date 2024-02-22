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
import { PageButtonHeader, SideBar, ToastMessage } from '@/components/sw360'
import { Changelogs, HttpStatus, LicensePayload, LicenseTabIds, ToastData } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-bootstrap'
import Detail from './Detail'
import Obligations from './Obligations'
import Text from './Text'
import styles from '../detail.module.css'

interface Props {
    licenseId?: string
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

const LicenseDetailOverview = ({ licenseId }: Props) => {
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(LicenseTabIds.DETAILS)
    const [changesLogTab, setChangesLogTab] = useState('list-change')
    const [changeLogIndex, setChangeLogIndex] = useState(-1)
    const [license, setLicenseDetail] = useState<LicensePayload>(undefined)
    const [changeLogList, setChangeLogList] = useState<Array<Changelogs>>([])
    const [isEditWhitelist, setIsEditWhitelist] = useState(false)
    const [whitelist, setWhitelist] = useState<Map<string, boolean>>()
    const { data: session, status } = useSession()
    const params = useSearchParams()
    const updateLicense = params.get('update')

    useEffect(() => {
        if (!CommonUtils.isNullEmptyOrUndefinedString(updateLicense)) {
            alert(true, 'Success', t('License updated successfully!'), 'success')
        }
        const controller = new AbortController()
        const signal = controller.signal
        ;(async () => {
            try {
                const response = await ApiUtils.GET(`licenses/${licenseId}`, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const licenses = await response.json()
                setLicenseDetail(licenses)
            } catch (e) {
                console.error(e)
            }
        })()
        ;(async () => {
            try {
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

                const data = await response.json()

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
    }, [params, session, licenseId])

    const handleEditWhitelist = () => {
        setIsEditWhitelist(true)
    }
    const handleCancel = () => {
        setIsEditWhitelist(false)
    }

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

    const handleUpdateWhitelist = async () => {
        const whitelistObj = Object.fromEntries(whitelist)
        const response = await ApiUtils.PATCH(
            `licenses/${licenseId}/whitelist`,
            whitelistObj,
            session.user.access_token
        )
        if (response.status == HttpStatus.OK) {
            alert(true, 'Success', t('License updated successfully!'), 'success')
            window.location.reload()
        } else {
            alert(true, 'Failed', t('License updated failed!'), 'danger')
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

    if (status === 'unauthenticated') {
        signOut()
    } else {
        return (
            license && (
                <div className={`container ${styles['row-license-detail']}`}>
                    <div className='row'>
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
}

export default LicenseDetailOverview
