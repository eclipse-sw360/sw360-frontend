// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useState } from 'react'

import { AccessControl } from '@/components/AccessControl/AccessControl'
import LinkedObligations from '@/components/LinkedObligations/LinkedObligations'
import LinkedObligationsDialog from '@/components/sw360/SearchObligations/LinkedObligationsDialog'
import { Embedded, HttpStatus, LicensePayload, LicenseTabIds, Obligation, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { PageButtonHeader, SideBar } from 'next-sw360'
import AddLicenseSummary from './AddLicenseSummary'

type EmbeddedObligations = Embedded<Obligation, 'sw360:obligations'>

function AddLicense(): ReactNode {
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(LicenseTabIds.DETAILS)
    const [data, setData] = useState<Array<Array<string | Obligation>>>([])
    const [reRender, setReRender] = useState(false)
    const [obligations, setObligations] = useState<Array<Array<string | Obligation>>>([])
    const [addObligationDiaglog, setAddObligationDiaglog] = useState<boolean>(false)
    const params = useSearchParams()
    const router = useRouter()
    const [errorShortName, setErrorShortName] = useState<boolean>(false)
    const [errorFullName, setErrorFullName] = useState<boolean>(false)
    const [inputValid, setInputValid] = useState<boolean>(false)
    const [licensePayload, setLicensePayload] = useState<LicensePayload>({
        shortName: '',
        fullName: '',
        note: '',
        OSIApproved: 'NA',
        FSFLibre: 'NA',
        obligationDatabaseIds: [],
        text: '',
        checked: true,
        licenseTypeDatabaseId: '',
    })

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

    useEffect(() => {
        MessageService.success(t('New License'))
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(
                    `obligations?obligationLevel=LICENSE_OBLIGATION`,
                    session.user.access_token,
                    signal,
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const obligations = (await response.json()) as EmbeddedObligations
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
    }, [params])

    const handleReRender = () => {
        setReRender(!reRender)
    }

    const handleClickAddObligations = useCallback(() => setAddObligationDiaglog(true), [])

    const checkShortNameEmpty = (licensePayload: LicensePayload) => {
        if (CommonUtils.isNullEmptyOrUndefinedString(licensePayload.shortName)) {
            setErrorShortName(true)
            return true
        }
        return false
    }

    const checkFullNameEmpty = (licensePayload: LicensePayload) => {
        if (CommonUtils.isNullEmptyOrUndefinedString(licensePayload.fullName)) {
            setErrorFullName(true)
            return true
        }
        return false
    }

    const submit = async () => {
        setInputValid(true)
        const isShortNameEmpty = checkShortNameEmpty(licensePayload)
        const isFullNameEmpty = checkFullNameEmpty(licensePayload)
        if (isShortNameEmpty || isFullNameEmpty) {
            MessageService.error(`${t('Fullname shortname should not be null or empty')}!`)
            return
        }

        if (!licensePayload.shortName?.match(/^[A-Za-z0-9\-.+]*$/)) {
            MessageService.error(t('Shortname is invalid'))
            return
        }

        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return
        const response = await ApiUtils.POST('licenses', licensePayload, session.user.access_token)
        if (response.status == HttpStatus.CREATED) {
            MessageService.success(t('License added successfully'))
            router.push('/licenses')
        } else if (response.status == HttpStatus.CONFLICT) {
            MessageService.error(t('License shortname has already taken'))
        } else {
            MessageService.error(t('Create license failed'))
        }
    }

    const headerButtons = {
        'Create License': { link: '', type: 'primary', onClick: submit, name: t('Create License') },
        Cancel: { link: '/licenses', type: 'light', name: t('Cancel') },
    }

    const headerButtonAddObligations = {
        'Create License': { link: '', type: 'primary', onClick: submit, name: t('Create License') },
        'Add Obligation': {
            link: '',
            type: 'secondary',
            onClick: handleClickAddObligations,
            name: t('Add Obligation'),
        },
        Cancel: { link: '/licenses', type: 'light', name: t('Cancel') },
    }

    return (
        <div
            className='container'
            style={{ maxWidth: '98vw', marginTop: '10px' }}
        >
            <div className='row'>
                <div className='col-2 sidebar'>
                    <SideBar
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        tabList={tabList}
                    />
                </div>
                <div className='col'>
                    <div
                        className='row'
                        style={{ marginBottom: '20px' }}
                    >
                        {selectedTab === LicenseTabIds.OBLIGATIONS ? (
                            <PageButtonHeader
                                buttons={headerButtonAddObligations}
                                title='()'
                                checked={licensePayload.checked}
                            ></PageButtonHeader>
                        ) : (
                            <PageButtonHeader
                                buttons={headerButtons}
                                title='()'
                                checked={licensePayload.checked}
                            ></PageButtonHeader>
                        )}
                    </div>
                    <div
                        className='row'
                        hidden={selectedTab !== LicenseTabIds.DETAILS ? true : false}
                    >
                        <AddLicenseSummary
                            errorShortName={errorShortName}
                            setErrorShortName={setErrorShortName}
                            errorFullName={errorFullName}
                            inputValid={inputValid}
                            setErrorFullName={setErrorFullName}
                            licensePayload={licensePayload}
                            setLicensePayload={setLicensePayload}
                        />
                    </div>
                    <div
                        className='row'
                        hidden={selectedTab != LicenseTabIds.OBLIGATIONS ? true : false}
                    >
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

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(AddLicense, [UserGroupType.SECURITY_USER])
