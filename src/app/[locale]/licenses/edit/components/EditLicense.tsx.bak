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
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useState } from 'react'

import LinkedObligations from '@/components/LinkedObligations/LinkedObligations'
import LinkedObligationsDialog from '@/components/sw360/SearchObligations/LinkedObligationsDialog'
import { HttpStatus, LicensePayload, LicenseTabIds, Obligation, Embedded, LicenseDetail } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { PageButtonHeader, SideBar } from 'next-sw360'
import DeleteLicenseDialog from '../../components/DeleteLicenseDialog'
import EditLicenseSummary from './EditLicenseSummary'
import MessageService from '@/services/message.service'

interface Props {
    licenseId: string
}

type EmbeddedObligations = Embedded<Obligation, 'sw360:obligations'>

export default function EditLicense({ licenseId }: Props) : ReactNode {
    const t = useTranslations('default')
    const router = useRouter()
    const params = useSearchParams()

    const [selectedTab, setSelectedTab] = useState<string>(LicenseTabIds.DETAILS)
    const [data, setData] = useState<Array<(string | Obligation)[]>>([])
    const [reRender, setReRender] = useState(false)

    const [addObligationDiaglog, setAddObligationDiaglog] = useState<boolean>(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
    const [obligations, setObligations] = useState<Array<(string | Obligation)[]>>([])
    const [inputValid, setInputValid] = useState<boolean>(false)
    const [errorFullName, setErrorFullName] = useState<boolean>(false)
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

    const handleReRender = () => {
        setReRender(!reRender)
    }

    const handleClickAddObligations = useCallback(() => setAddObligationDiaglog(true), [])

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session))
                    return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(`licenses/${licenseId}`, Object.fromEntries(params))
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const license = await response.json() as LicenseDetail
                setLicensePayload(license)
                if (!CommonUtils.isNullOrUndefined(license._embedded['sw360:obligations'])) {
                    const data = license._embedded['sw360:obligations'].map((item: Obligation) => [
                        item,
                        item.title ?? '',
                        !CommonUtils.isNullEmptyOrUndefinedString(item.obligationType)
                            ? item.obligationType.charAt(0) + item.obligationType.slice(1).toLowerCase()
                            : '',
                        item,
                    ])
                    setData(data)
                }
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
                    'obligations?obligationLevel=LICENSE_OBLIGATION',
                    session.user.access_token,
                    signal
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const obligations = await response.json() as EmbeddedObligations
                if (!CommonUtils.isNullEmptyOrUndefinedArray(obligations._embedded['sw360:obligations'])) {
                    const data = obligations._embedded['sw360:obligations'].map((item: Obligation) => [
                        item,
                        item,
                        item.title ?? '',
                        !CommonUtils.isNullEmptyOrUndefinedString(item.obligationType)
                            ? item.obligationType.charAt(0) + item.obligationType.slice(1).toLowerCase()
                            : '',
                        item.text ?? '',
                    ])
                    setObligations(data)
                }
            } catch (e) {
                console.error(e)
            }
        })()
        return () => controller.abort()
    }, [params, licenseId])

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

    const submit = async () => {
        setInputValid(true)
        if (CommonUtils.isNullEmptyOrUndefinedString(licensePayload.fullName)) {
            setErrorFullName(true)
            MessageService.error(t('Fullname not null or empty'))
            return
        }

        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }
        const response = await ApiUtils.PATCH(`licenses/${licenseId}`, licensePayload, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as LicensePayload
            MessageService.success(t('License updated successfully!'))
            router.push(`/licenses/detail?id=${data.shortName}`)
        } else {
            MessageService.error(t('License updated failed!'))
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
            onClick: handleClickAddObligations,
            name: t('Add Obligation'),
        },
        Cancel: { link: `/licenses/detail?id=${licenseId}`, type: 'light', name: t('Cancel') },
    }

    return (
        <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <SideBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabList={tabList} />
                </div>
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
                    <div className='row' hidden={selectedTab != LicenseTabIds.OBLIGATIONS ? true : false}>
                        <LinkedObligationsDialog
                            show={addObligationDiaglog}
                            data={data}
                            setData={setData}
                            obligations={obligations}
                            setShow={setAddObligationDiaglog}
                            onReRender={handleReRender}
                            licensePayload={licensePayload}
                            setLicensePayload={setLicensePayload}
                        />
                        <LinkedObligations
                            data={data}
                            setData={setData}
                            licensePayload={licensePayload}
                            setLicensePayload={setLicensePayload}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
