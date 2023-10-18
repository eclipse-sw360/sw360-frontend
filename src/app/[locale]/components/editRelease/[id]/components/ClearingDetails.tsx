// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ReleasePayload } from '@/object-types'
import { useTranslations } from 'next-intl'

interface Props {
    releasePayload?: ReleasePayload
    setReleasePayload?: React.Dispatch<React.SetStateAction<ReleasePayload>>
}

const ClearingDetails = ({ releasePayload, setReleasePayload }: Props) => {
    const t = useTranslations('default')

    const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReleasePayload({
            ...releasePayload,
            clearingInformation: {
                ...releasePayload.clearingInformation,
                [e.target.name]: e.target.value,
            },
        })
    }

    const updateFieldChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReleasePayload({
            ...releasePayload,
            clearingInformation: {
                ...releasePayload.clearingInformation,
                [e.target.name]: e.target.checked,
            },
        })
    }

    return (
        <>
            <div className='col' style={{ padding: '0px 12px' }}>
                <div className='row mb-4'>
                    <div className='header mb-2'>
                        <p className='fw-bold mt-3'>{t('Clearing Details')}</p>
                    </div>
                    <div className='row'>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='binaries_original_from_community'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='binariesOriginalFromCommunity'
                                    checked={releasePayload.clearingInformation?.binariesOriginalFromCommunity ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='binaries_original_from_community'>
                                    {t('Binaries Original from Community')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='binaries_self_made'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='binariesSelfMade'
                                    checked={releasePayload.clearingInformation?.binariesSelfMade ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='binaries_self_made'>
                                    {t('Binaries Self-Made')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='component_license_information'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='componentLicenseInformation'
                                    checked={releasePayload.clearingInformation?.componentLicenseInformation ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='component_license_information'>
                                    {t('Component License Information')}
                                </label>
                            </div>
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='source_code_delivery'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='sourceCodeDelivery'
                                    checked={releasePayload.clearingInformation?.sourceCodeDelivery ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='source_code_delivery'>
                                    {t('Source Code Delivery')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='source_code_community'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='sourceCodeOriginalFromCommunity'
                                    checked={
                                        releasePayload.clearingInformation?.sourceCodeOriginalFromCommunity ?? false
                                    }
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='source_code_community'>
                                    {t('Source Code Original from Community')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='source_code_tool_made'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='sourceCodeToolMade'
                                    checked={releasePayload.clearingInformation?.sourceCodeToolMade ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='source_code_tool_made'>
                                    {t('Source Code Tool-Made')}
                                </label>
                            </div>
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='source_code_self_made'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='sourceCodeSelfMade'
                                    checked={releasePayload.clearingInformation?.sourceCodeSelfMade ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='source_code_self_made'>
                                    {t('Source Code Self-Made')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='screenshot_website'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='screenshotOfWebSite'
                                    checked={releasePayload.clearingInformation?.screenshotOfWebSite ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='screenshot_website'>
                                    {t('Screenshot of Website')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='finalized_license_scan_report'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='finalizedLicenseScanReport'
                                    checked={releasePayload.clearingInformation?.finalizedLicenseScanReport ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='finalized_license_scan_report'>
                                    {t('Finalized License Scan Report')}
                                </label>
                            </div>
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='license_scan_report_result'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='licenseScanReportResult'
                                    checked={releasePayload.clearingInformation?.licenseScanReportResult ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='license_scan_report_result'>
                                    {t('License Scan Report Result')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='legal_evaluation'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='legalEvaluation'
                                    checked={releasePayload.clearingInformation?.legalEvaluation ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='legal_evaluation'>
                                    {t('Legal Evaluation')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='license_agreement'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='licenseAgreement'
                                    checked={releasePayload.clearingInformation?.licenseAgreement ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='license_agreement'>
                                    {t('License Agreement')}
                                </label>
                            </div>
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='scanned' className='form-label fw-bold'>
                                {t('Scanned')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter scanned'
                                id='scanned'
                                aria-describedby='scanned'
                                name='scanned'
                                value={releasePayload.clearingInformation?.scanned ?? ''}
                                onChange={updateField}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='component_clearing_report'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='componentClearingReport'
                                    checked={releasePayload.clearingInformation?.componentClearingReport ?? false}
                                    onChange={updateFieldChecked}
                                />
                                <label className='form-label fw-bold' htmlFor='component_clearing_report'>
                                    {t('Component Clearing Report')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='clearing_standard' className='form-label fw-bold'>
                                {t('Clearing Standard')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter clearing standard'
                                id='clearing_standard'
                                aria-describedby='Tag'
                                name='clearingStandard'
                                value={releasePayload.clearingInformation?.clearingStandard ?? ''}
                                onChange={updateField}
                            />
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='external_url' className='form-label fw-bold'>
                                {t('External URL')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter URL'
                                id='external_url'
                                aria-describedby='external_url'
                                name='externalUrl'
                                value={releasePayload.clearingInformation?.externalUrl ?? ''}
                                onChange={updateField}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label htmlFor='comment' className='form-label fw-bold'>
                                {t('Comment')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter your comments'
                                id='comment'
                                aria-describedby='comment'
                                name='comment'
                                value={releasePayload.clearingInformation?.comment ?? ''}
                                onChange={updateField}
                            />
                        </div>
                    </div>
                    <hr className='my-2' />
                </div>
            </div>
        </>
    )
}

export default ClearingDetails
