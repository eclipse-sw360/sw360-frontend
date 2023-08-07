// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import styles from './AddComponents.module.css'
import React, { useCallback, useState } from 'react'
import { VendorDialog } from '@/components/sw360'
import { Session } from '@/object-types/Session'
import Vendor from '@/object-types/Vendor'
import 'react-toastify/dist/ReactToastify.css'
import ComponentPayload from '@/object-types/ComponentPayLoad'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
interface Props {
    session?: Session
    componentPayload?: ComponentPayload
    setComponentPayload?: React.Dispatch<React.SetStateAction<ComponentPayload>>
    vendor?: Vendor
    setVendor?: React.Dispatch<React.SetStateAction<Vendor>>
}

const GeneralInfoComponent = ({
    session,
    componentPayload,
    setComponentPayload,
    vendor,
    setVendor
}: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [dialogOpenVendor, setDialogOpenVendor] = useState(false)
    const handleClickSearchVendor = useCallback(() => setDialogOpenVendor(true), [])

    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setComponentPayload({
            ...componentPayload,
            [e.target.name]: e.target.value,
        })
    }

    const setCategoriesData = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const data: string[] = splitValueCategories(e.target.value)
        setComponentPayload({
            ...componentPayload,
            categories: data,
        })
    }

    const splitValueCategories = (valueCatergories: string) => {
        return valueCatergories.split(',')
    }

    const setVendorId = (vendorResponse: Vendor) => {
        const vendorData: Vendor = {
            id: vendorResponse.id,
            fullName: vendorResponse.fullName,
        }
        setVendor(vendorData)
        setComponentPayload({
            ...componentPayload,
            defaultVendorId: vendorResponse.id,
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
            <div className='col'>
                <div className='row mb-4'>
                    <div className={`${styles['header']} mb-2`}>
                        <p className='fw-bold mt-3'>{t('General Information')}</p>
                    </div>
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='name' className='form-label fw-bold'>
                                {t('Name')} <span className='text-red'>*</span>
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Enter Name')}
                                id='name'
                                name='name'
                                aria-describedby='name'
                                required
                                value={componentPayload.name}
                                onChange={updateField}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='createdBy' className='form-label fw-bold'>
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
                                value={componentPayload.createBy}
                                readOnly={true}
                            />
                            <div id='createdBy' className='form-text'>
                                <i className='bi bi-x-circle'></i>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='categories' className='form-label fw-bold'>
                                {t('Categories')} <span className='text-red'>*</span>
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='e.g.,Library,cloud,mobile,...'
                                id='categories'
                                aria-describedby='categories'
                                required
                                name='categories'
                                onChange={setCategoriesData}
                                value={componentPayload.categories}
                            />
                        </div>
                    </div>
                    <hr className='my-4' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='component_type' className='form-label fw-bold'>
                                {t('Component Type')} <span className='text-red'>*</span>
                            </label>
                            <select
                                className='form-select'
                                aria-label='component_type'
                                id='component_type'
                                required
                                defaultValue=''
                                name='componentType'
                                onChange={updateField}
                                value={componentPayload.componentType}
                            >
                                <option value=''></option>
                                <option value='OSS'>{t('OSS')}</option>
                                <option value='COTS'> {t('COTS')}</option>
                                <option value='INTERNAL'>{t('Internal')}</option>
                                <option value='INNER_SOURCE'>{t('Inner Source')}</option>
                                <option value='SERVICE'>{t('Service')}</option>
                                <option value='FREESOFTWARE'>{t('Freeware')}</option>
                                <option value='CODE_SNIPPET'>{t('Code Snippet')}</option>
                            </select>
                            <div id='learn_more_about_component_type' className='form-text'>
                                <i className='bi bi-info-circle'></i> learn_more_components
                            </div>
                        </div>

                        <div className='col-lg-4'>
                            <label htmlFor='default_vendor' className='form-label fw-bold'>
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
                                value={vendor.fullName}
                            />
                            <div id='default_vendor' className='form-text'>
                                <i className='bi bi-x-circle'></i>
                            </div>
                            <VendorDialog
                                show={dialogOpenVendor}
                                setShow={setDialogOpenVendor}
                                selectVendor={setVendorId}
                                session={session}
                            />
                            <span onClick={handleClearVendor}>x</span>
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='tag' className='form-label fw-bold'>
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
                                value={componentPayload.homepage}
                            />
                        </div>
                    </div>
                    <hr className='my-4' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='blog_url' className='form-label fw-bold'>
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
                                value={componentPayload.blog}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='wiki_url' className='form-label fw-bold'>
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
                                value={componentPayload.wiki}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='mailing_list_url' className='form-label fw-bold'>
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
                                value={componentPayload.mailinglist}
                            />
                        </div>
                    </div>
                    <hr className='my-4' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='description' className='form-label fw-bold'>
                                {t('Description')}
                            </label>
                            <textarea
                                className='form-control'
                                placeholder={t('Enter Description')}
                                id='description'
                                aria-describedby='Description'
                                style={{ height: '100px' }}
                                name='description'
                                onChange={updateField}
                                value={componentPayload.description}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='modified_on' className='form-label fw-bold'>
                                {t('Modified On')}
                            </label>
                            <input
                                type='date'
                                className='form-control'
                                id='modified_on'
                                aria-describedby='Modified on'
                                readOnly={true}
                                value={componentPayload.modifiedOn}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='modified_by' className='form-label fw-bold'>
                                {t('Modified By')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Will be set automatically')}
                                id='modified_by'
                                aria-describedby='Modified By'
                                readOnly={true}
                                value={componentPayload.modifiedBy}
                            />
                        </div>
                    </div>
                    <hr className='my-4' />
                </div>
            </div>
        </>
    )
}

export default React.memo(GeneralInfoComponent)
