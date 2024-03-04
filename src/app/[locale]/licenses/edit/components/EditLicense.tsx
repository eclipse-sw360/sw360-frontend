// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-bootstrap'

import { HttpStatus, LicensePayload, LicenseTabIds, ToastData } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { PageButtonHeader, SideBar, ToastMessage } from 'next-sw360'
import DeleteLicenseDialog from '../../components/DeleteLicenseDialog'
import EditLicenseSummary from './EditLicenseSummary'

interface Props {
    licenseId?: string
}

export default function EditLicense({ licenseId }: Props) {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [selectedTab, setSelectedTab] = useState<string>(LicenseTabIds.DETAILS)
    const params = useSearchParams()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const router = useRouter()
    const [inputValid, setInputValid] = useState(false)
    const [errorFullName, setErrorFullName] = useState(false)
    const [licensePayload, setLicensePayload] = useState<LicensePayload>({
        shortName: '',
        fullName: '',
        note: '',
        OSIApproved: 'NA',
        FSFLibre: 'NA',
        obligationDatabaseIds: [],
        text: '',
        checked: false,
        licenseTypeDatabaseId: '',
    })

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const queryUrl = CommonUtils.createUrlWithParams(`licenses/${licenseId}`, Object.fromEntries(params))
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const license = await response.json()
                setLicensePayload(license)
            } catch (e) {
                console.error(e)
            }
        })()
        ;(async () => {
            try {
                const response = await ApiUtils.GET(
                    `obligations?obligationLevel=LICENSE_OBLIGATION`,
                    session.user.access_token,
                    signal
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
            } catch (e) {
                console.error(e)
            }
        })()
        return () => controller.abort()
    }, [params, session, licenseId])

    const tabList = [
        {
            id: LicenseTabIds.DETAILS,
            name: 'License',
        },
        {
            id: LicenseTabIds.OBLIGATIONS,
            name: 'Linked Obligations',
        },
    ]

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
        setInputValid(true)
        if (CommonUtils.isNullEmptyOrUndefinedString(licensePayload.fullName)) {
            setErrorFullName(true)
            alert(true, 'Require!', t('Fullname not null or empty!'), 'danger')
        } else {
            const response = await ApiUtils.PATCH(`licenses/${licenseId}`, licensePayload, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as LicensePayload
                alert(true, 'Success', t('License updated successfully!'), 'success')
                router.push(`/licenses/detail?id=${data.shortName}&update=success`)
            } else {
                alert(true, 'Failed', t('License updated failed!'), 'danger')
            }
        }
    }

    const deleteLicense = () => {
        setDeleteDialogOpen(true)
    }

    const headerButtons = {
        'Update License': { link: '', type: 'primary', onClick: submit, name: t('Update License') },
        'Delete License': { link: '', type: 'danger', onClick: deleteLicense, name: t('Delete License') },
        Cancel: { link: `/licenses/detail?id=${licenseId}`, type: 'light', name: t('Cancel') },
    }

    const headerButtonAddObligations = {
        'Update License': { link: '', type: 'primary', onClick: submit, name: t('Update License') },
        'Delete License': { link: '', type: 'danger', onClick: deleteLicense, name: t('Delete License') },
        'Add Obligation': {
            link: '',
            type: 'secondary',
            name: t('Add Obligation'),
        },
        Cancel: { link: `/licenses/detail?id=${licenseId}`, type: 'light', name: t('Cancel') },
    }

    if (status === 'unauthenticated') {
        signOut()
    } else {
        return (
            licensePayload && (
                <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
                    <div className='row'>
                        <div className='col-2 sidebar'>
                            <SideBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabList={tabList} />
                        </div>
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
                        <DeleteLicenseDialog
                            licensePayload={licensePayload}
                            show={deleteDialogOpen}
                            setShow={setDeleteDialogOpen}
                        />
                        <div className='col'>
                            <div className='row' style={{ marginBottom: '20px' }}>
                                {selectedTab === LicenseTabIds.OBLIGATIONS ? (
                                    <PageButtonHeader
                                        title={`${licensePayload.fullName} (${licensePayload.shortName})`}
                                        buttons={headerButtonAddObligations}
                                        checked={licensePayload.checked}
                                    ></PageButtonHeader>
                                ) : (
                                    <PageButtonHeader
                                        title={`${licensePayload.fullName} (${licensePayload.shortName})`}
                                        buttons={headerButtons}
                                        checked={licensePayload.checked}
                                    ></PageButtonHeader>
                                )}
                            </div>
                            <div
                                className='row'
                                style={{ fontSize: '14px' }}
                                hidden={selectedTab !== LicenseTabIds.DETAILS ? true : false}
                            >
                                <EditLicenseSummary
                                    errorFullName={errorFullName}
                                    inputValid={inputValid}
                                    setErrorFullName={setErrorFullName}
                                    licensePayload={licensePayload}
                                    setLicensePayload={setLicensePayload}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
        )
    }
}
