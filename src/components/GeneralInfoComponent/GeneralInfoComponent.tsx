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
import { ShowInfoOnHover, VendorDialog } from 'next-sw360'
import React, { useCallback, useState } from 'react'
import SuggestionBox from '@/components/sw360/SuggestionBox/SuggestionBox'
import { useConfigValue } from '@/contexts'
import { ComponentPayload, UIConfigKeys, Vendor } from '@/object-types'

interface Props {
    componentPayload: ComponentPayload
    setComponentPayload: React.Dispatch<React.SetStateAction<ComponentPayload>>
    vendor: Vendor
    setVendor: React.Dispatch<React.SetStateAction<Vendor>>
}

const GeneralInfoComponent = ({ componentPayload, setComponentPayload, vendor, setVendor }: Props) => {
    const t = useTranslations('default')
    const [dialogOpenVendor, setDialogOpenVendor] = useState(false)
    const handleClickSearchVendor = useCallback(() => setDialogOpenVendor(true), [])

    // Configs from backend
    const categoriesSuggestions = useConfigValue(UIConfigKeys.UI_COMPONENT_CATEGORIES) as string[] | null

    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setComponentPayload({
            ...componentPayload,
            [e.target.name]: e.target.value,
        })
    }

    const setCategoriesData = (input: string) => {
        const data: string[] = splitValueCategories(input)
        setComponentPayload({
            ...componentPayload,
            categories: data,
        })
    }

    const splitValueCategories = (valueCategories: string) => {
        return valueCategories.split(',').map((v) => v.trim())
    }

    const setVendorId = (vendorResponse: Vendor) => {
        setVendor(vendorResponse)
        setComponentPayload({
            ...componentPayload,
            defaultVendorId: vendorResponse._links?.self.href.split('/').at(-1),
        })
    }

    const handleClearVendor = () => {
        const vendorData: Vendor = {
            id: '',
            fullName: '',
        }
        setVendor(vendorData)
        setComponentPayload({
            ...componentPayload,
            defaultVendorId: '',
        })
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
                    <div className='section-header mb-2'>
                        <span className='fw-bold'>{t('General Information')}</span>
                    </div>
                    <div className='row with-divider pt-2 pb-2'>
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
                                required
                                value={componentPayload.name ?? ''}
                                onChange={updateField}
                            />
                        </div>
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
                                data-bs-toggle='modal'
                                data-bs-target='#search_vendors_modal'
                                placeholder={t('Will be set auto')}
                                id='createdBy'
                                aria-describedby='Created By'
                                value={componentPayload.createBy ?? ''}
                                readOnly={true}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label
                                htmlFor='categories'
                                className='form-label fw-bold'
                            >
                                {t('Categories')}{' '}
                                <span
                                    className='text-red'
                                    style={{
                                        color: '#F7941E',
                                    }}
                                >
                                    *
                                </span>
                            </label>
                            <SuggestionBox
                                initialValue={componentPayload.categories?.join(', ')}
                                possibleValues={categoriesSuggestions === null ? [] : categoriesSuggestions}
                                onValueChange={setCategoriesData}
                                inputProps={{
                                    id: 'categories',
                                    name: 'categories',
                                    required: true,
                                    placeHolder: 'e.g.,Library,cloud,mobile,...',
                                }}
                                isMultiValue={true}
                            />
                        </div>
                    </div>
                    <div className='row with-divider pt-2 pb-2'>
                        <div className='col-lg-4'>
                            <label
                                htmlFor='component_type'
                                className='form-label fw-bold'
                            >
                                {t('Component Type')}{' '}
                                <span
                                    className='text-red'
                                    style={{
                                        color: '#F7941E',
                                    }}
                                >
                                    *
                                </span>
                            </label>
                            <select
                                className='form-select'
                                aria-label='component_type'
                                id='component_type'
                                required
                                name='componentType'
                                onChange={updateField}
                                value={componentPayload.componentType ?? ''}
                            >
                                <option value=''></option>
                                <option value='OSS'>{t('OSS')}</option>
                                <option value='COTS'> {t('COTS')}</option>
                                <option value='INTERNAL'>{t('Internal')}</option>
                                <option value='INNER_SOURCE'>{t('Inner Source')}</option>
                                <option value='SERVICE'>{t('Service')}</option>
                                <option value='FREESOFTWARE'>{t('Freeware')}</option>
                                <option value='CODE_SNIPPET'>{t('Code Snippet')}</option>
                                <option value='COTS_TRUSTED_SUPPLIER'>{t('COTS Trusted Supplier')}</option>
                            </select>
                            <div
                                id='learn_more_about_component_type'
                                className='form-text'
                            >
                                <ShowInfoOnHover text={t('TYPE_COMPONENT')} />
                                {t('Learn more about component types')}.
                            </div>
                        </div>

                        <div className='col-lg-4'>
                            <label
                                htmlFor='default_vendor'
                                className='form-label fw-bold'
                            >
                                {t('Default vendor')}
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
                            <span onClick={handleClearVendor}>x</span>
                        </div>
                        <div className='col-lg-4'>
                            <label
                                htmlFor='tag'
                                className='form-label fw-bold'
                            >
                                {t('Homepage Url')}
                            </label>
                            <input
                                type='URL'
                                className='form-control'
                                placeholder={t('Will be set automatically')}
                                id='tag'
                                aria-describedby='Tag'
                                name='homepage'
                                onChange={updateField}
                                value={componentPayload.homepage ?? ''}
                            />
                        </div>
                    </div>
                    <div className='row with-divider pt-2 pb-2'>
                        <div className='col-lg-4'>
                            <label
                                htmlFor='blog_url'
                                className='form-label fw-bold'
                            >
                                {t('Blog URL')}
                            </label>
                            <input
                                type='URL'
                                className='form-control'
                                placeholder={t('Enter Blog URL')}
                                id='blog_url'
                                aria-describedby='blog_url'
                                name='blog'
                                onChange={updateField}
                                value={componentPayload.blog ?? ''}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label
                                htmlFor='wiki_url'
                                className='form-label fw-bold'
                            >
                                {t('Wiki URL')}
                            </label>
                            <input
                                type='URL'
                                className='form-control'
                                placeholder={t('Enter Wiki URL')}
                                id='wiki_url'
                                aria-describedby='wiki_url'
                                name='wiki'
                                onChange={updateField}
                                value={componentPayload.wiki ?? ''}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label
                                htmlFor='mailing_list_url'
                                className='form-label fw-bold'
                            >
                                {t('Mailing List URL')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Enter Mailing List URL')}
                                id='mailing_list_url'
                                aria-describedby='mailing_list_url'
                                name='mailinglist'
                                onChange={updateField}
                                value={componentPayload.mailinglist ?? ''}
                            />
                        </div>
                    </div>
                    <div className='row with-divider pt-2 pb-2'>
                        <div className='col-lg-4'>
                            <label
                                htmlFor='description'
                                className='form-label fw-bold'
                            >
                                {t('Description')}
                            </label>
                            <textarea
                                className='form-control'
                                placeholder={t('Enter Description')}
                                id='description'
                                aria-describedby='Description'
                                style={{
                                    height: '100px',
                                }}
                                name='description'
                                onChange={updateField}
                                value={componentPayload.description ?? ''}
                            />
                        </div>
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
                                value={componentPayload.modifiedOn ?? ''}
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
                                value={componentPayload.modifiedBy ?? ''}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default React.memo(GeneralInfoComponent)
