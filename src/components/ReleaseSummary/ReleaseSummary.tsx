// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ShowInfoOnHover } from 'next-sw360'
import React, { type JSX, useCallback, useState } from 'react'
import { BsXCircle } from 'react-icons/bs'
import LicensesDialog from '@/components/sw360/SearchLicensesDialog/LicensesDialog'
import SelectUsersDialog from '@/components/sw360/SearchUsersDialog/SelectUsersDialog'
import VendorDialog from '@/components/sw360/SearchVendorsModal/VendorDialog'
import SuggestionBox from '@/components/sw360/SuggestionBox/SuggestionBox'
import { useConfigValue } from '@/contexts'
import { ActionType, Release, ReleaseDetail, UIConfigKeys, Vendor } from '@/object-types'

interface Props {
    actionType?: string
    releasePayload: Release
    setReleasePayload: React.Dispatch<React.SetStateAction<Release>>
    vendor: Vendor
    setVendor: React.Dispatch<React.SetStateAction<Vendor>>
    mainLicenses: {
        [k: string]: string
    }
    setMainLicenses: React.Dispatch<
        React.SetStateAction<{
            [k: string]: string
        }>
    >
    otherLicenses: {
        [k: string]: string
    }
    setOtherLicenses: React.Dispatch<
        React.SetStateAction<{
            [k: string]: string
        }>
    >
    contributors: {
        [k: string]: string
    }
    setContributors: React.Dispatch<
        React.SetStateAction<{
            [k: string]: string
        }>
    >
    moderators: {
        [k: string]: string
    }
    setModerators: React.Dispatch<
        React.SetStateAction<{
            [k: string]: string
        }>
    >
    releaseDetail?: ReleaseDetail
}

const ReleaseSummary = ({
    actionType,
    releasePayload,
    setReleasePayload,
    vendor,
    setVendor,
    mainLicenses,
    setMainLicenses,
    otherLicenses,
    setOtherLicenses,
    contributors,
    setContributors,
    moderators,
    setModerators,
    releaseDetail,
}: Props): JSX.Element => {
    const t = useTranslations('default')
    const [currentDate] = useState(new Date().toLocaleDateString())
    const [dialogOpenMainLicenses, setDialogOpenMainLicenses] = useState(false)
    const handleClickSearchMainLicenses = useCallback(() => setDialogOpenMainLicenses(true), [])
    const [dialogOpenOtherLicenses, setDialogOpenOtherLicenses] = useState(false)
    const handleClickSearchOtherLicenses = useCallback(() => setDialogOpenOtherLicenses(true), [])
    const [dialogOpenVendor, setDialogOpenVendor] = useState(false)
    const handleClickSearchVendor = useCallback(() => setDialogOpenVendor(true), [])
    const [dialogOpenContributors, setDialogOpenContributors] = useState(false)
    const handleClickSearchContributors = useCallback(() => setDialogOpenContributors(true), [])
    const [dialogOpenModerators, setDialogOpenModerators] = useState(false)
    const handleClickSearchModerators = useCallback(() => setDialogOpenModerators(true), [])

    // Configs from backend
    const operatingSystemSuggestions = useConfigValue(UIConfigKeys.UI_OPERATING_SYSTEMS) as string[] | null
    const languagesSuggestions = useConfigValue(UIConfigKeys.UI_PROGRAMMING_LANGUAGES) as string[] | null
    const platformSuggestions = useConfigValue(UIConfigKeys.UI_SOFTWARE_PLATFORMS) as string[] | null

    const setMainLicensesToPayload = (mainLicenses: { [k: string]: string }) => {
        setMainLicenses(mainLicenses)
        setReleasePayload({
            ...releasePayload,
            mainLicenseIds: Object.keys(mainLicenses),
        })
    }

    const setOtherLicensesToPayload = (otherLicenses: { [k: string]: string }) => {
        setOtherLicenses(otherLicenses)
        setReleasePayload({
            ...releasePayload,
            otherLicenseIds: Object.keys(otherLicenses),
        })
    }

    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setReleasePayload({
            ...releasePayload,
            [e.target.name]: e.target.value,
        })
    }

    const splitValueCategories = (valueCategories: string) => {
        return valueCategories.split(',').map((v) => v.trim())
    }

    const setMultiValueSuggestionFields = (key: string) => (input: string) => {
        const data: string[] = splitValueCategories(input)
        setReleasePayload({
            ...releasePayload,
            [key]: data,
        })
    }

    const setVendorId = (vendorResponse: Vendor) => {
        setVendor(vendorResponse)
        setReleasePayload({
            ...releasePayload,
            vendorId: vendorResponse._links?.self.href.split('/').at(-1),
        })
    }

    const handleClearVendor = () => {
        setVendor({})
        setReleasePayload({
            ...releasePayload,
            vendorId: undefined,
        })
    }

    const setContributorsToPayload = (users: { [k: string]: string }) => {
        setContributors(users)
        setReleasePayload({
            ...releasePayload,
            contributors: Object.keys(users),
        })
    }

    const setModeratorsToPayload = (users: { [k: string]: string }) => {
        setModerators(users)
        setReleasePayload({
            ...releasePayload,
            moderators: Object.keys(users),
        })
    }

    const defaultValueCreatedOn = () => {
        return actionType === ActionType.EDIT && releaseDetail !== undefined
            ? (releaseDetail.createdOn ?? '')
            : currentDate
    }

    const defaultValueClearingState = () => {
        return actionType === ActionType.EDIT ? releasePayload.clearingState : 'NEW'
    }

    return (
        <>
            <div
                className='col'
                style={{
                    padding: '0px 12px',
                }}
            >
                <div className='row mb-4'>
                    <div className='section-header'>
                        <span className='fw-bold'>{t('Release Summary')}</span>
                    </div>
                    <div className='col bg-white'>
                        <div className='row with-divider pt-2 pb-2'>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='default_vendor'
                                    className='form-label fw-bold'
                                >
                                    {t('Vendor')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    data-bs-toggle='modal'
                                    data-bs-target='#search_vendors_modal'
                                    placeholder={t('Click to set vendor')}
                                    id='default_vendor'
                                    aria-describedby='Vendor'
                                    readOnly={true}
                                    name='defaultVendorId'
                                    onClick={handleClickSearchVendor}
                                    value={vendor.fullName ?? ''}
                                />

                                <VendorDialog
                                    show={dialogOpenVendor}
                                    setShow={setDialogOpenVendor}
                                    setVendor={setVendorId}
                                    vendor={vendor}
                                />
                                <div
                                    className='form-text'
                                    onClick={handleClearVendor}
                                >
                                    {' '}
                                    <BsXCircle size={20} />
                                </div>
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='name'
                                    className='form-label fw-bold'
                                >
                                    {t('Name')}{' '}
                                    <span
                                        className='text-red'
                                        style={{
                                            color: '#F7941E',
                                        }}
                                    >
                                        *
                                    </span>
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder={t('Enter Name')}
                                    id='name'
                                    name='name'
                                    aria-describedby='name'
                                    readOnly={true}
                                    value={releasePayload.name ?? ''}
                                />
                                <div
                                    id='learn_more_about_component_name'
                                    className='form-text'
                                >
                                    <ShowInfoOnHover text={t('NAME_COMPONENT')} />
                                    {t('Name of the component')}.
                                </div>
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='version'
                                    className='form-label fw-bold'
                                >
                                    {t('Version')}{' '}
                                    <span
                                        className='text-red'
                                        style={{
                                            color: '#F7941E',
                                        }}
                                    >
                                        *
                                    </span>
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder='Enter Version'
                                    id='version'
                                    aria-describedby='version'
                                    required
                                    name='version'
                                    onChange={updateField}
                                    value={releasePayload.version ?? ''}
                                />
                            </div>
                        </div>
                        <div className='row pt-2 pb-2 with-divider'>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='programming_languages'
                                    className='form-label fw-bold'
                                >
                                    {t('Programming Languages')}
                                </label>
                                <SuggestionBox
                                    initialValue={releasePayload.languages?.join(', ')}
                                    possibleValues={languagesSuggestions === null ? [] : languagesSuggestions}
                                    onValueChange={setMultiValueSuggestionFields('languages')}
                                    inputProps={{
                                        id: 'programming_languages',
                                        name: 'languages',
                                        required: false,
                                        placeHolder: 'e.g., Java, C++, C#,...',
                                        aria_describedby: 'programming_languages',
                                    }}
                                    isMultiValue={true}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='operating_systems'
                                    className='form-label fw-bold'
                                >
                                    {t('Operating Systems')}
                                </label>
                                <SuggestionBox
                                    initialValue={releasePayload.operatingSystems?.join(', ')}
                                    possibleValues={
                                        operatingSystemSuggestions === null ? [] : operatingSystemSuggestions
                                    }
                                    onValueChange={setMultiValueSuggestionFields('operatingSystems')}
                                    inputProps={{
                                        id: 'operating_systems',
                                        name: 'operatingSystems',
                                        required: false,
                                        placeHolder: 'e.g.,Linux,MAC,Windows,...',
                                        aria_describedby: 'operating_systems',
                                    }}
                                    isMultiValue={true}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='tag'
                                    className='form-label fw-bold'
                                >
                                    {t('CPE ID')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder='Enter CPE ID'
                                    id='tag'
                                    aria-describedby='Tag'
                                    name='cpeid'
                                    onChange={updateField}
                                    value={releasePayload.cpeid ?? ''}
                                />
                                <div
                                    id='learn_more_about_cpe'
                                    className='form-text'
                                >
                                    <ShowInfoOnHover text={t('CPE_ID')} />
                                    {t('Learn more about the CPE ID format')}.
                                </div>
                            </div>
                        </div>
                        <div className='row pt-2 pb-2 with-divider'>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='software_platforms'
                                    className='form-label fw-bold'
                                >
                                    {t('Software Platforms')}
                                </label>
                                <SuggestionBox
                                    initialValue={releasePayload.softwarePlatforms?.join(', ')}
                                    possibleValues={platformSuggestions === null ? [] : platformSuggestions}
                                    onValueChange={setMultiValueSuggestionFields('softwarePlatforms')}
                                    inputProps={{
                                        id: 'software_platforms',
                                        name: 'softwarePlatforms',
                                        required: false,
                                        placeHolder: 'e.g.,Adobe AIR,.NET,Qt,...',
                                        aria_describedby: 'software_platforms',
                                    }}
                                    isMultiValue={true}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='releaseDate'
                                    className='form-label fw-bold'
                                >
                                    {t('Release date')}
                                </label>
                                <input
                                    type='date'
                                    className='form-control'
                                    placeholder='Enter Release Date'
                                    id='releaseDate'
                                    aria-describedby='releaseDate'
                                    name='releaseDate'
                                    onChange={updateField}
                                    value={releasePayload.releaseDate ?? ''}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='mainLicenseIds'
                                    className='form-label fw-bold'
                                >
                                    {t('Main Licenses')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    data-bs-toggle='modal'
                                    data-bs-target='#search_mainLicense_modal'
                                    placeholder={t('Click to set Licenses')}
                                    id='mainLicenseIds'
                                    aria-describedby='MainLicense'
                                    readOnly={true}
                                    name='mainLicenseIds'
                                    value={Object.values(mainLicenses).join(', ')}
                                    onClick={handleClickSearchMainLicenses}
                                />
                                <LicensesDialog
                                    show={dialogOpenMainLicenses}
                                    setShow={setDialogOpenMainLicenses}
                                    selectLicenses={setMainLicensesToPayload}
                                    releaseLicenses={mainLicenses}
                                />
                            </div>
                        </div>
                        <div className='row pt-2 pb-2 with-divider'>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='otherLicenseIds'
                                    className='form-label fw-bold'
                                >
                                    {t('Other licenses')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    data-bs-toggle='modal'
                                    data-bs-target='#search_licenses_modal'
                                    placeholder={t('Click to set Licenses')}
                                    id='otherLicenseIds'
                                    aria-describedby='License'
                                    readOnly={true}
                                    name='otherLicenseIds'
                                    onClick={handleClickSearchOtherLicenses}
                                    value={Object.values(otherLicenses).join(', ')}
                                />
                                <LicensesDialog
                                    show={dialogOpenOtherLicenses}
                                    setShow={setDialogOpenOtherLicenses}
                                    selectLicenses={setOtherLicensesToPayload}
                                    releaseLicenses={otherLicenses}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='sourceCodeDownloadurl'
                                    className='form-label fw-bold'
                                >
                                    {t('Source Code Download URL')}
                                </label>
                                <input
                                    type='URL'
                                    className='form-control'
                                    placeholder={t('Enter URL')}
                                    id='wiki_url'
                                    aria-describedby='wiki_url'
                                    name='sourceCodeDownloadurl'
                                    onChange={updateField}
                                    value={releasePayload.sourceCodeDownloadurl ?? ''}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='binaryDownloadurl'
                                    className='form-label fw-bold'
                                >
                                    {t('Binary Download URL')}
                                </label>
                                <input
                                    type='URL'
                                    className='form-control'
                                    placeholder={t('Enter URL')}
                                    id='binaryDownloadurl'
                                    aria-describedby='wiki_url'
                                    name='binaryDownloadurl'
                                    onChange={updateField}
                                    value={releasePayload.binaryDownloadurl ?? ''}
                                />
                            </div>
                        </div>
                        <div className='row pt-2 pb-2 with-divider'>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='modified_on'
                                    className='form-label fw-bold'
                                >
                                    {t('Clearing State')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='modified_on'
                                    aria-describedby='Modified on'
                                    readOnly={true}
                                    name='clearingState'
                                    defaultValue={defaultValueClearingState()}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='mainlineState'
                                    className='form-label fw-bold'
                                >
                                    {t('Release Mainline State')}
                                </label>
                                <select
                                    className='form-select'
                                    aria-label='component_type'
                                    id='mainlineState'
                                    required
                                    name='mainlineState'
                                    onChange={updateField}
                                    value={releasePayload.mainlineState ?? ''}
                                >
                                    <option value='OPEN'>{t('OPEN')}</option>
                                    <option value='MAINLINE'> {t('MAINLINE')}</option>
                                    <option value='SPECIFIC'>{t('SPECIFIC')}</option>
                                    <option value='PHASEOUT'>{t('PHASEOUT')}</option>
                                    <option value='DENIED'>{t('DENIED')}</option>
                                </select>
                                <div
                                    id='mainlineState-i'
                                    className='form-text'
                                >
                                    <ShowInfoOnHover text={t('RELEASE_MAIN_STATE')} />
                                    {t('Learn more about mainline states')}.
                                </div>
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='createdOn'
                                    className='form-label fw-bold'
                                >
                                    {t('Created on')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='createdOn'
                                    aria-describedby='Modified on'
                                    readOnly={true}
                                    defaultValue={defaultValueCreatedOn()}
                                />
                            </div>
                        </div>
                        <div className='row pt-2 pb-2 with-divider'>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='createdBy'
                                    className='form-label fw-bold'
                                >
                                    {t('Created by')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='createdBy'
                                    placeholder='Will be set automatically'
                                    aria-describedby='Create by'
                                    readOnly={true}
                                    name='createBy'
                                    value={
                                        releaseDetail !== undefined
                                            ? releaseDetail._embedded['sw360:createdBy']?.fullName
                                            : ''
                                    }
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='contributors'
                                    className='form-label fw-bold'
                                >
                                    {t('Contributors')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    data-bs-toggle='modal'
                                    data-bs-target='#search_users_modal'
                                    placeholder={t('Click to edit')}
                                    id='contributors'
                                    aria-describedby='Contributor'
                                    readOnly={true}
                                    name='contributors'
                                    onClick={handleClickSearchContributors}
                                    value={Object.values(contributors).join(', ')}
                                />
                                <SelectUsersDialog
                                    show={dialogOpenContributors}
                                    setShow={setDialogOpenContributors}
                                    setSelectedUsers={setContributorsToPayload}
                                    selectedUsers={contributors}
                                    multiple={true}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='moderators'
                                    className='form-label fw-bold'
                                >
                                    {t('Moderators')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    data-bs-toggle='modal'
                                    data-bs-target='#search_users_modal'
                                    placeholder={t('Click to edit')}
                                    id='moderators'
                                    aria-describedby='Moderators'
                                    readOnly={true}
                                    name='moderators'
                                    onClick={handleClickSearchModerators}
                                    value={Object.values(moderators).join(', ')}
                                />
                                <SelectUsersDialog
                                    show={dialogOpenModerators}
                                    setShow={setDialogOpenModerators}
                                    setSelectedUsers={setModeratorsToPayload}
                                    selectedUsers={moderators}
                                    multiple={true}
                                />
                            </div>
                        </div>
                        <div className='row pt-2 pb-2 with-divider'>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='modified_on'
                                    className='form-label fw-bold'
                                >
                                    {t('Modified On')}
                                </label>
                                <input
                                    type='date'
                                    className='form-control'
                                    id='modified_on'
                                    aria-describedby='Modified on'
                                    readOnly={true}
                                    name='modifiedOn'
                                    value={releaseDetail !== undefined ? releaseDetail.modifiedOn : ''}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <label
                                    htmlFor='modified_by'
                                    className='form-label fw-bold'
                                >
                                    {t('Modified By')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder={t('Will be set automatically')}
                                    id='modified_by'
                                    aria-describedby='Modified By'
                                    readOnly={true}
                                    name='modifiedBy'
                                    value={
                                        releaseDetail !== undefined
                                            ? releaseDetail._embedded['sw360:modifiedBy']?.fullName
                                            : ''
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ReleaseSummary
