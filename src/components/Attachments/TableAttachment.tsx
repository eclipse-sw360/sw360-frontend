// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'

import { FaTrashAlt } from 'react-icons/fa'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import AttachmentDetail from '@/object-types/AttachmentDetail'

interface Props {
    setAttachmentData: React.Dispatch<React.SetStateAction<AttachmentDetail[]>>
    data: AttachmentDetail[]
}

export default function TableAttachment({ data, setAttachmentData }: Props) {
    const t = useTranslations(COMMON_NAMESPACE)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target
        const list: AttachmentDetail[] = [...data]
        list[index][name as keyof AttachmentDetail] = value
        setAttachmentData(list)
    }

    const handleClickDelete = (index: number) => {
        const list: AttachmentDetail[] = [...data]
        list.splice(index, 1)
        setAttachmentData(list)
    }

    return (
        <>
            <div className='row'>
                {data.map((item, j) => {
                    return (
                        <>
                            <div style={{ border: '1px solid #969696' }}>
                                <label style={{ width: '220px' }}>{item.filename}</label>
                                <select
                                    style={{ width: '100px' }}
                                    aria-label='component_type'
                                    id='component_type'
                                    defaultValue=''
                                    name='attachmentType'
                                    onChange={(e) => handleInputChange(e, j)}
                                    value={item.attachmentType}
                                >
                                    <option value='SOURCE'>{t('Source file')}</option>
                                    <option value='CLEARING_REPORT'>{t('Clearing report')}</option>
                                    <option value='COMPONENT_LICENSE_INFO_XML'>
                                        {t('Component license information (XML)')}
                                    </option>
                                    <option value='COMPONENT_LICENSE_INFO_COMBINED'>
                                        {t('Component license information (Combined)')}
                                    </option>
                                    <option value='DOCUMENT'>{t('Document')}</option>
                                    <option value='DESIGN'>{t('Design document')}</option>
                                    <option value='REQUIREMENT'>{t('Requirement document')}</option>
                                    <option value='SCAN_RESULT_REPORT'>{t('Scan result report')}</option>
                                    <option value='SCAN_RESULT_REPORT_XML'>{t('Scan result report (XML)')}</option>
                                    <option value='SOURCE_SELF'>{t('Source file (Self-made)')}</option>
                                    <option value='BINARY'>{t('Binaries')}</option>
                                    <option value='BINARY_SELF'>{t('Binaries (Self-made)')}</option>
                                    <option value='DECISION_REPORT'>{t('Decision report')}</option>
                                    <option value='LEGAL_EVALUATION'>{t('Legal evaluation report')}</option>
                                    <option value='LICENSE_AGREEMENT'>{t('License Agreement')}</option>
                                    <option value='SCREENSHOT'>{t('Screenshot of Website')}</option>
                                    <option value='OTHER'>{t('Other')}</option>
                                    <option value='README_OSS'>{t('ReadMe OSS')}</option>
                                    <option value='SECURITY_ASSESSMENT'>{t('Security Assessment')}</option>
                                    <option value='INITIAL_SCAN_REPORT'>{t('Initial Scan Report')}</option>
                                    <option value='SBOM'>{t('SBOM')}</option>
                                    <option value='INTERNAL_USE_SCAN'>{t('Initial Use Scan')}</option>
                                </select>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <input
                                    name='createdComment'
                                    style={{ width: '100px' }}
                                    value={item.createdComment}
                                    type='text'
                                    onChange={(e) => handleInputChange(e, j)}
                                    placeholder='Enter Comment'
                                />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <label style={{ width: '100px' }}>{item.createdTeam}</label>
                                <label style={{ width: '130px' }}>{item.createdBy}</label>
                                <label style={{ width: '100px' }}>{item.createdOn}</label>
                                <select
                                    style={{ width: '120px' }}
                                    aria-label='component_type'
                                    id='component_type'
                                    defaultValue=''
                                    name='checkStatus'
                                    value={item.checkStatus}
                                    onChange={(e) => handleInputChange(e, j)}
                                >
                                    <option value='NOTCHECKED'>{t('NOT_CHECKED')}</option>
                                    <option value='ACCEPTED'> {t('ACCEPTED')}</option>
                                    <option value='REJECTED'>{t('REJECTED')}</option>
                                </select>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <input
                                    style={{ width: '100px' }}
                                    type='text'
                                    value={item.checkedComment}
                                    name='checkedComment'
                                    onChange={(e) => handleInputChange(e, j)}
                                    placeholder='Enter Comment'
                                />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <label style={{ width: '100px' }}>{item.checkedTeam}</label>
                                <label style={{ width: '130px' }}>{item.checkedBy}</label>
                                <label style={{ width: '100px' }}>{item.checkedOn}</label>
                                <button
                                    type='button'
                                    onClick={() => handleClickDelete(j)}
                                    style={{ border: 'none' }}
                                    className={`fw-bold btn btn-light button-plain`}
                                >
                                    <FaTrashAlt className='bi bi-trash3-fill' />
                                </button>
                            </div>
                        </>
                    )
                })}
            </div>
        </>
    )
}
