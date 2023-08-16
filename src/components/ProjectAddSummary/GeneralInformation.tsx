// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { BiInfoCircle } from 'react-icons/bi'
import { GiCancel } from 'react-icons/gi'
import { Dispatch, SetStateAction, useState } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import ProjectPayload from '@/object-types/CreateProjectPayload'
import { Session } from '@/object-types/Session'

interface Param {
    token: string
    projectPayload: ProjectPayload
    setProjectPayload: Dispatch<SetStateAction<ProjectPayload>>
}

const ShowInfoOnHover = ({ text }: { text: string }) => {
    return (
        <>
            <OverlayTrigger overlay={<Tooltip>{text}</Tooltip>}>
                <span className='d-inline-block'>
                    <BiInfoCircle />
                </span>
            </OverlayTrigger>
        </>
    );
};

export default function GeneralInformation({ token, projectPayload, setProjectPayload }: Param) {

    const t = useTranslations(COMMON_NAMESPACE)

    const [showVendorsModal, setShowVendorsModal] = useState<boolean>(false)

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setProjectPayload({
            ...projectPayload,
            [event.target.name]: event.target.value,
        })
    }

    return (
        <>
            {/* <VendorDialog show={showVendorsModal} setShow={setShowVendorsModal}/> */}
            <div className='row mb-4'>
                <h6 className="header pb-2 px-2">
                    {t('General Information')}
                </h6>
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.name' className='form-label fw-medium'>
                            {t('Name')} <span style={{color:'red'}}>*</span>
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
                        <label htmlFor='addProjects.version' className='form-label fw-medium'>
                            {t('Version')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.version'
                            placeholder={t('Enter Version')}
                            name='version'
                            required
                            value={projectPayload.version}
                            onChange={updateInputField}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.visibility' className='form-label fw-medium'>
                            {t('Visibility')} <span style={{color:'red'}}>*</span>
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.visibility'
                            defaultValue='Group and Moderators'
                            aria-describedby='addProjects.visibility.HelpBlock'
                            name='visibility'
                            value={projectPayload.visibility}
                            onChange={updateInputField}
                        >
                            <option value='PRIVATE'>{t('Private')}</option>
                            <option value='ME_AND_MODERATORS'>{t('Me and Moderators')}</option>
                            <option value='BUISNESSUNIT_AND_MODERATORS'>{t('Group and Moderators')}</option>
                            <option value='EVERYONE'>{t('Everyone')}</option>
                        </select>
                        <div className='form-text' id='addProjects.visibility.HelpBlock'>
                            <ShowInfoOnHover text={t('VISIBILITY_INFO')} />
                            {t('Learn more about project visibilities')}.
                        </div>
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.createdBy' className='form-label fw-medium'>
                            {t('Created by')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.createdBy'
                            placeholder={t('Will be set automatically')}
                            readOnly={true}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.projectType' className='form-label fw-medium'>
                            {t('Project Type')} <span style={{color:'red'}}>*</span>
                        </label>
                        <select
                            className='form-select'
                            defaultValue='Product'
                            id='addProjects.projectType'
                            aria-describedby='addProjects.projectType.HelpBlock'
                            name='projectType'
                            value={projectPayload.projectType}
                            onChange={updateInputField}
                        >
                            <option value='CUSTOMER'>{t('Customer Project')}</option>
                            <option value='INTERNAL'>{t('Internal Project')}</option>
                            <option value='PRODUCT'>{t('Product')}</option>
                            <option value='SERVICE'>{t('Service')}</option>
                            <option value='INNER_SOURCE'>{t('Inner Source')}</option>
                            <option value='CLOUD_BACKEND'>{t('Cloud Backend')}</option>
                        </select>
                        <div className='form-text' id='addProjects.projectType.HelpBlock'>
                            <ShowInfoOnHover text={t('PROJECT_TYPE_INFO')} /> {t('Learn more about project types')}.
                        </div>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.tag' className='form-label fw-medium'>
                            {t('Tag')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.tag'
                            placeholder={t('Enter one word tag')}
                            name='tag'
                            value={projectPayload.tag}
                            onChange={updateInputField}
                        />
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.description' className='form-label fw-medium'>
                            {t('Description')}
                        </label>
                        <textarea
                            className='form-control'
                            id='addProjects.description'
                            placeholder={t('Enter Description')}
                            style={{ height: '100px' }}
                            name='description'
                            value={projectPayload.description}
                            onChange={updateInputField}
                        ></textarea>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.domain' className='form-label fw-medium'>
                            {t('Domain')}
                        </label>
                        <select
                            className='form-select'
                            id='addProjects.domain'
                            defaultValue=''
                            aria-label={t('Enter Domain')}
                            name='domain'
                            value={projectPayload.domain}
                            onChange={updateInputField}
                        >
                            <option value=''>-- {t('Select Domain')} --</option>
                            <option value='Application Software'>{t('Application Software')}</option>
                            <option value='Documentation'>{t('Documentation')}</option>
                            <option value='Embedded Software'>{t('Embedded Software')}</option>
                            <option value='Hardware'>{t('Hardware')}</option>
                            <option value='Test and Diagnostics'>{t('Test and Diagnostics')}</option>
                        </select>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.vendor' className='form-label fw-medium'>
                            {t('Vendor')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.vendor'
                            placeholder={t('Click to set vendor')}
                            readOnly={true}
                            // onClick={() => setShowVendorsModal(true)}
                        />
                        <div className='form-text'>
                            <GiCancel />
                        </div>
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.modifiedOn' className='form-label fw-medium'>
                            {t('Modified On')}
                        </label>
                        <input type='date'
                               className='form-control'
                               id='addProjects.modifiedOn'
                               readOnly={true} />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.modifiedBy' className='form-label fw-medium'>
                            {t('Modified By')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.modifiedBy'
                            placeholder={t('Will be set automatically')}
                            readOnly={true}
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
                        />
                        <label className='form-check-label fw-medium ms-2' htmlFor='addProjects.useExternalIdList'>
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
