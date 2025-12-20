// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ShowInfoOnHover, VendorDialog } from 'next-sw360'
import { Dispatch, type JSX, SetStateAction, useCallback, useState } from 'react'
import { GiCancel } from 'react-icons/gi'
import SuggestionBox from '@/components/sw360/SuggestionBox/SuggestionBox'
import { useConfigValue } from '@/contexts'
import { ProjectPayload, UIConfigKeys, Vendor } from '@/object-types'

interface Param {
    vendor: Vendor
    setVendor: Dispatch<SetStateAction<Vendor>>
    projectPayload: ProjectPayload
    setProjectPayload: Dispatch<SetStateAction<ProjectPayload>>
}

export default function GeneralInformation({
    vendor,
    setVendor,
    projectPayload,
    setProjectPayload,
}: Param): JSX.Element {
    const t = useTranslations('default')
    const [showVendorsModal, setShowVendorsModal] = useState<boolean>(false)
    const handleClickSearchVendor = useCallback(() => setShowVendorsModal(true), [])

    // Configs from backend
    const projectDomains = useConfigValue(UIConfigKeys.UI_DOMAINS) as string[] | null
    const projectTags = useConfigValue(UIConfigKeys.UI_PROJECT_TAG) as string[] | null
    const isSvmEnabled =
        useConfigValue(UIConfigKeys.UI_ENABLE_SECURITY_VULNERABILITY_MONITORING) === null
            ? true
            : (useConfigValue(UIConfigKeys.UI_ENABLE_SECURITY_VULNERABILITY_MONITORING) as boolean)

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setProjectPayload({
            ...projectPayload,
            [event.target.name]: event.target.value,
        })
    }

    const onSuggestChangeHandler = (key: string) => (newValue: string | string[]) => {
        setProjectPayload({
            ...projectPayload,
            [key]: newValue,
        })
    }

    const setVendorData = (vendorResponse: Vendor) => {
        setVendor(vendorResponse)
        setProjectPayload({
            ...projectPayload,
            vendorId: vendorResponse._links?.self.href.split('/').at(-1),
        })
    }

    const handleClearVendorData = () => {
        const vendorData: Vendor = {
            id: '',
            fullName: '',
        }
        setVendor(vendorData)
        setProjectPayload({
            ...projectPayload,
            vendorId: '',
        })
    }

    return (
        <>
            <div className='row mb-4'>
                <h6 className='header pb-2 px-2'>{t('General Information')}</h6>
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.name'
                            className='form-label fw-medium'
                        >
                            {t('Name')}{' '}
                            <span
                                style={{
                                    color: 'red',
                                }}
                            >
                                *
                            </span>
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.name'
                            name='name'
                            required
                            placeholder={t('Enter Name')}
                            value={projectPayload.name}
                            onChange={updateInputField}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.version'
                            className='form-label fw-medium'
                        >
                            {t('Version')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.version'
                            placeholder={t('Enter Version')}
                            name='version'
                            value={projectPayload.version}
                            onChange={updateInputField}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.visibility'
                            className='form-label fw-medium'
                        >
                            {t('Visibility')}{' '}
                            <span
                                style={{
                                    color: 'red',
                                }}
                            >
                                *
                            </span>
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.visibility'
                            aria-describedby='addProjects.visibility.HelpBlock'
                            name='visibility'
                            value={projectPayload.visibility ?? 'EVERYONE'}
                            onChange={updateInputField}
                            required
                        >
                            <option value='PRIVATE'>{t('Private')}</option>
                            <option value='ME_AND_MODERATORS'>{t('Me and Moderators')}</option>
                            <option value='BUISNESSUNIT_AND_MODERATORS'>{t('Group and Moderators')}</option>
                            <option value='EVERYONE'>{t('Everyone')}</option>
                        </select>
                        <div
                            className='form-text'
                            id='addProjects.visibility.HelpBlock'
                        >
                            <ShowInfoOnHover text={t('VISIBILITY_INFO')} />
                            {t('Learn more about project visibilities')}.
                        </div>
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.createdBy'
                            className='form-label fw-medium'
                        >
                            {t('Created by')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.createdBy'
                            placeholder={t('Will be set automatically')}
                            readOnly={true}
                            value={projectPayload.createdBy}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.projectType'
                            className='form-label fw-medium'
                        >
                            {t('Project Type')}{' '}
                            <span
                                style={{
                                    color: 'red',
                                }}
                            >
                                *
                            </span>
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.projectType'
                            aria-describedby='addProjects.projectType.HelpBlock'
                            name='projectType'
                            value={projectPayload.projectType ?? 'PRODUCT'}
                            onChange={updateInputField}
                            required
                        >
                            <option value='CUSTOMER'>{t('Customer Project')}</option>
                            <option value='INTERNAL'>{t('Internal Project')}</option>
                            <option value='PRODUCT'>{t('Product')}</option>
                            <option value='SERVICE'>{t('Service')}</option>
                            <option value='INNER_SOURCE'>{t('Inner Source')}</option>
                            <option value='CLOUD_BACKEND'>{t('Cloud Backend')}</option>
                        </select>
                        <div
                            className='form-text'
                            id='addProjects.projectType.HelpBlock'
                        >
                            <ShowInfoOnHover text={t('PROJECT_TYPE_INFO')} /> {t('Learn more about project types')}.
                        </div>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.tag'
                            className='form-label fw-medium'
                        >
                            {t('Tag')}
                        </label>
                        <SuggestionBox
                            initialValue={projectPayload.tag}
                            possibleValues={projectTags === null ? [] : projectTags}
                            onValueChange={onSuggestChangeHandler('tag')}
                            inputProps={{
                                id: 'addProjects.tag',
                                name: 'tag',
                                placeHolder: t('Enter one word tag'),
                                aria_describedby: 'addProjects.tag',
                            }}
                            isMultiValue={false}
                        />
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.description'
                            className='form-label fw-medium'
                        >
                            {t('Description')}
                        </label>
                        <textarea
                            className='form-control'
                            id='addProjects.description'
                            placeholder={t('Enter Description')}
                            style={{
                                height: '100px',
                            }}
                            name='description'
                            value={projectPayload.description}
                            onChange={updateInputField}
                        ></textarea>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.domain'
                            className='form-label fw-medium'
                        >
                            {t('Domain')}
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.domain'
                            aria-label={t('Enter Domain')}
                            name='domain'
                            value={projectPayload.domain ?? ''}
                            onChange={updateInputField}
                        >
                            <option value=''>-- {t('Select Domain')} --</option>
                            {projectDomains &&
                                projectDomains.map((domain) => (
                                    <option
                                        key={domain}
                                        value={domain}
                                    >
                                        {domain}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.vendor'
                            className='form-label fw-medium'
                        >
                            {t('Vendor')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.vendor'
                            placeholder={t('Click to set vendor')}
                            readOnly={true}
                            name='vendorId'
                            value={vendor.fullName ?? ''}
                            onClick={handleClickSearchVendor}
                        />
                        <VendorDialog
                            show={showVendorsModal}
                            setShow={setShowVendorsModal}
                            setVendor={setVendorData}
                            vendor={vendor}
                        />
                        <div className='form-text'>
                            <GiCancel onClick={handleClearVendorData} />
                        </div>
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.modifiedOn'
                            className='form-label fw-medium'
                        >
                            {t('Modified On')}
                        </label>
                        <input
                            type='date'
                            className='form-control'
                            id='addProjects.modifiedOn'
                            readOnly={true}
                            value={projectPayload.modifiedOn ?? ''}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label
                            htmlFor='addProjects.modifiedBy'
                            className='form-label fw-medium'
                        >
                            {t('Modified By')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.modifiedBy'
                            placeholder={t('Will be set automatically')}
                            readOnly={true}
                            value={projectPayload.modifiedBy ?? ''}
                        />
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            value=''
                            id='addProjects.enableSecurityVulnerabilityMonitoring'
                            disabled={true}
                            aria-describedby='addProjects.enableSecurityVulnerabilityMonitoring.HelpBlock'
                        />
                        <label
                            className='form-check-label fw-bold'
                            htmlFor='addProjects.enableSecurityVulnerabilityMonitoring'
                        >
                            {t('Enable Security Vulnerability Monitoring')}
                        </label>
                        <div
                            className='form-text fw-bold'
                            id='addProjects.enableSecurityVulnerabilityMonitoring.HelpBlock'
                        >
                            {t('You need a security responsible to enable monitoring')}
                        </div>
                    </div>
                    <div className='col-lg-4'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            value=''
                            id='addProjects.useExternalIdList'
                            disabled={!isSvmEnabled}
                        />
                        <label
                            className='form-check-label fw-medium ms-2'
                            htmlFor='addProjects.useExternalIdList'
                        >
                            {t('Do not create monitoring list, but use list from external id')}
                        </label>
                    </div>
                    <div className='col-lg-4'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            value=''
                            id='addProjects.enableDisplayingVulnerabilities'
                        />
                        <label
                            className='form-check-label fw-medium ms-2'
                            htmlFor='addProjects.enableDisplayingVulnerabilities'
                        >
                            {t('Enable Displaying Vulnerabilities')}
                        </label>
                    </div>
                </div>
            </div>
        </>
    )
}
