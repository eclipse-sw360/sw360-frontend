// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Package } from "@/object-types"
import { useTranslations } from "next-intl"
import { Dispatch, SetStateAction } from "react"
import { ShowInfoOnHover } from 'next-sw360'
import { packageManagers } from "./PackageManagers"
import { IoIosClose } from "react-icons/io"

export default function CreateOrEditPackage({ packagePayload, setPackagePayload, handleSubmit, creatingPackage }: 
    { packagePayload: Package, setPackagePayload: Dispatch<SetStateAction<Package>>, handleSubmit: () => void, creatingPackage: boolean }) {
    const t = useTranslations('default')

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setPackagePayload((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <>
            <form
                id='add_or_edit_package_form_submit'
                method='post'
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit()
                }}
            >
                <button
                    type='submit'
                    className='mb-3 col-auto btn btn-primary'
                    disabled={creatingPackage}
                >
                    {t('Create Package')}
                </button>

                <div className='row header mb-2 pb-2 px-2 ms-1'>
                    <h6>{t('Summary')}</h6>
                </div>

                <div className="ms-2">
                <div className='row mb-3 with-divider pb-2 ms-1'>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.name' className='form-label fw-medium'>
                                {t('Name')} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='createOrEditPackage.name'
                                name='name'
                                placeholder={t('Enter Name')}
                                value={packagePayload.name ?? ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.version' className='form-label fw-medium'>
                                {t('Version')} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='createOrEditPackage.version'
                                name='version'
                                placeholder={t('Enter Version')}
                                value={packagePayload.version ?? ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.packageType' className='form-label fw-medium'>
                                {t('Package Type')} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <select
                                className='form-select'
                                id='createOrEditPackage.packageType'
                                aria-label={t('Package Type')}
                                name='packageType'
                                value={packagePayload.packageType ?? ''}
                                onChange={handleChange}
                                required
                            >
                                <option value=''>-- {t('Select Package Type')} --</option>
                                <option value='APPLICATION'>{t('Application')}</option>
                                <option value='CONTAINER'>{t('Container')}</option>
                                <option value='DEVICE'>{t('Device')}</option>
                                <option value='FILE'>{t('File')}</option>
                                <option value='FIRMWARE'>{t('Firmware')}</option>
                                <option value='FRAMEWORK'>{t('Framework')}</option>
                                <option value='LIBRARY'>{t('Library')}</option>
                                <option value='OPERATING_SYSTEM'>{t('Operating System')}</option>
                            </select>
                            <div className='form-text' id='createOrEditPackage.packageType.HelpBlock'>
                                <ShowInfoOnHover text={t('PACKAGE_TYPE_HELP_BLOCK')} />
                                {' '}{t('Learn more about package types')}.
                            </div>
                        </div>
                    </div>
                    <div className='row mb-3 with-divider pb-3 ms-1'>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.purl' className='form-label fw-medium'>
                                {`PURL (${t('Package URL')})`} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type='url'
                                className='form-control'
                                id='createOrEditPackage.purl'
                                name='purl'
                                placeholder={t('Enter PURL')}
                                value={packagePayload.purl ?? ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.packageManager' className='form-label fw-medium'>
                                {t('Package Manager')} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <select
                                className='form-select'
                                id='createOrEditPackage.packageManager'
                                aria-label={t('Package Manager')}
                                name='packageManager'
                                value={packagePayload.packageManager}
                                onChange={handleChange}
                                disabled
                            >
                                <option value=''>-- {t('Will be set automatically via PURL')} --</option>
                                {
                                    packageManagers.map(p => <option key={p} value={p.toUpperCase()}>{p}</option>)
                                }
                            </select>
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.vcs' className='form-label fw-medium'>
                                {`VCS (${t('Version Control System')})`}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='createOrEditPackage.vcs'
                                name='vcs'
                                placeholder={t('Enter VCS URL')}
                                value={packagePayload.vcs ?? ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className='row mb-3 with-divider pb-3 ms-1'>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.licenseIds' className='form-label fw-medium'>
                                {t('Main licenses')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='createOrEditPackage.licenseIds'
                                placeholder={t('Click to set Licenses')}
                                value={packagePayload.licenseIds?.join(", ") ?? ''}
                                readOnly
                            />
                        </div>
                        <div className="col-lg-4">
                            <label htmlFor='createOrEditPackage.release' className='form-label fw-medium'>
                                {t('Release')}
                            </label>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder={t('Click to link a Release')} 
                                    id='createOrEditPackage.release'
                                />
                                <span className="input-group-text"><IoIosClose /></span>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.homepageUrl' className='form-label fw-medium'>
                                {t('Homepage URL')}
                            </label>
                            <input
                                type='url'
                                className='form-control'
                                id='createOrEditPackage.homepageUrl'
                                name='homepageUrl'
                                placeholder={t('Enter Homepage URL')}
                                value={packagePayload.homepageUrl ?? ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className='row mb-3 with-divider pb-3 ms-1'>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.createdOn' className='form-label fw-medium'>
                                {t('Created On')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='createOrEditPackage.createdOn'
                                value={packagePayload.createdOn ?? ''}
                                readOnly
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.createdBy' className='form-label fw-medium'>
                                {t('Created by')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='createOrEditPackage.createdBy'
                                value={packagePayload.createdBy ?? ''}
                                readOnly
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='createOrEditPackage.modifiedBy' className='form-label fw-medium'>
                                {t('Modified By')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='createOrEditPackage.modifiedBy'
                                value={packagePayload.modifiedBy ?? ''}
                                placeholder={t('Will be set automatically')}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className='form-group'>
                        <label className='form-label fw-medium' htmlFor='createOrEditPackage.description'>
                            {t('Description')}
                        </label>
                        <textarea
                            className='form-control'
                            id='createOrEditPackage.description'
                            name='description'
                            rows={5}
                            placeholder={t('Enter Description')}
                            onChange={handleChange}
                            value={packagePayload.description ?? ''}
                        ></textarea>
                    </div>
                </div>
            </form>
        </>
    )
}