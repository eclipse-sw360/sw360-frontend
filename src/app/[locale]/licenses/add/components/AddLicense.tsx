// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useRouter } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader, SideBar } from 'next-sw360'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import LinkedObligations from '@/components/LinkedObligations/LinkedObligations'
import LinkedObligationsDialog from '@/components/sw360/SearchObligations/LinkedObligationsDialog'
import { HttpStatus, LicensePayload, LicenseTabIds, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import AddLicenseSummary from './AddLicenseSummary'

function AddLicense(): ReactNode {
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(LicenseTabIds.DETAILS)
    const [addObligationDiaglog, setAddObligationDiaglog] = useState<boolean>(false)
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
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

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
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
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
        'Create License': {
            link: '',
            type: 'primary',
            onClick: submit,
            name: t('Create License'),
        },
        Cancel: {
            link: '/licenses',
            type: 'light',
            name: t('Cancel'),
        },
    }

    const headerButtonAddObligations = {
        'Create License': {
            link: '',
            type: 'primary',
            onClick: submit,
            name: t('Create License'),
        },
        'Add Obligation': {
            link: '',
            type: 'secondary',
            onClick: handleClickAddObligations,
            name: t('Add Obligation'),
        },
        Cancel: {
            link: '/licenses',
            type: 'light',
            name: t('Cancel'),
        },
    }

    return (
        <div
            className='container'
            style={{
                maxWidth: '98vw',
                marginTop: '10px',
            }}
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
                        style={{
                            marginBottom: '20px',
                        }}
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
                            setShow={setAddObligationDiaglog}
                            licensePayload={licensePayload}
                            setLicensePayload={setLicensePayload}
                        />
                        <LinkedObligations
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
export default AccessControl(AddLicense, [
    UserGroupType.SECURITY_USER,
])
