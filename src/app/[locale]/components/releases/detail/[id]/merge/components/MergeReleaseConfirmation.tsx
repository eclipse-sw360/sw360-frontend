// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect } from 'react'
import { BsCheck2Circle, BsXCircle } from 'react-icons/bs'
import { Release, ReleaseDetail } from '@/object-types'

export default function MergeReleaseConfirmation({
    targetRelease,
    sourceRelease,
    finalReleasePayload,
}: {
    targetRelease: ReleaseDetail | null
    sourceRelease: ReleaseDetail | null
    finalReleasePayload: Release | null
}): ReactNode {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    return (
        <>
            {finalReleasePayload && targetRelease && sourceRelease && (
                <>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('General')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Name')}</div>
                            <div className='mt-2'>{finalReleasePayload.name}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Version')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.version}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Created on')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.createdOn}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Created by')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.createBy}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Programming Languages')}</div>
                            <div className='mt-2 col'>{(finalReleasePayload.languages ?? []).join(', ')}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Operating Systems')}</div>
                            <div className='d-flex row'>
                                <div className='mt-2 col'>{finalReleasePayload.operatingSystems?.join(', ')}</div>
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Software Platforms')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.softwarePlatforms?.join(', ')}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('CPE ID')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.cpeid}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Release date')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.releaseDate}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Main Licenses')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.mainLicenseIds?.join(', ')}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Source Code Download URL')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.sourceCodeDownloadurl}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Binary Download URL')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.binaryDownloadurl}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Release Mainline State')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.mainlineState}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Vendor')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.vendor?.fullName}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Repository')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.repository?.url}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Moderators')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.moderators?.join(', ')}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Contributors')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.contributors?.join(', ')}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Subscribers')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.subscribers?.join(', ')}</div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('External Ids')}
                        </h6>
                        <div className='border border-blue p-2'>
                            {finalReleasePayload.externalIds &&
                                Object.entries(finalReleasePayload.externalIds).map(([key, value], index, arr) => (
                                    <div
                                        key={key}
                                        className={`d-flex row mb-2 pb-2 ${
                                            index !== arr.length - 1 ? 'border-bottom border-blue' : ''
                                        }`}
                                    >
                                        <div className='fw-bold text-blue'>{key}</div>

                                        <div className='mt-2 col'>{value}</div>
                                    </div>
                                ))}
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Additional Data')}
                        </h6>
                        <div className='border border-blue p-2'>
                            {finalReleasePayload.additionalData &&
                                Object.entries(finalReleasePayload.additionalData).map(([key, value], index, arr) => (
                                    <div
                                        key={key}
                                        className={`d-flex row mb-2 pb-2 ${
                                            index !== arr.length - 1 ? 'border-bottom border-blue' : ''
                                        }`}
                                    >
                                        <div className='fw-bold text-blue'>{key}</div>

                                        <div className='mt-2 col'>{value}</div>
                                    </div>
                                ))}
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Linked Releases')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue mb-2'>{t('Linked Releases')}</div>
                            {finalReleasePayload.releaseIdToRelationship &&
                                Object.entries(finalReleasePayload.releaseIdToRelationship).map(([key]) => {
                                    const linkedRelease =
                                        targetRelease._embedded?.['sw360:releaseLinks']?.find(
                                            (release) => release.id === key,
                                        ) ||
                                        sourceRelease._embedded?.['sw360:releaseLinks']?.find(
                                            (release) => release.id === key,
                                        )

                                    return (
                                        <div key={key}>
                                            <div className='mt-2 col'>
                                                {linkedRelease
                                                    ? `${linkedRelease.name} (${linkedRelease.version})`
                                                    : key}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Clearing Details')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Binaries Original from Community')}</div>
                            <div className='mt-2'>
                                {finalReleasePayload.clearingInformation?.binariesOriginalFromCommunity === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Binaries Self-Made')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.binariesSelfMade === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Component License Information')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.componentLicenseInformation === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Source Code Delivery')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.sourceCodeDelivery === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Source Code Original from Community')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.sourceCodeOriginalFromCommunity === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Source Code Tool-Made')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.sourceCodeToolMade === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Source Code Self-Made')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.sourceCodeSelfMade === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Screenshot of Website')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.screenshotOfWebSite === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Finalized License Scan Report')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.finalizedLicenseScanReport === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('License Scan Report Result')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.licenseScanReportResult === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Legal Evaluation')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.legalEvaluation === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('License Agreement')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.licenseAgreement === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Component Clearing Report')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.componentClearingReport === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Scanned')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.clearingInformation?.scanned}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Clearing Standard')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.clearingInformation?.clearingStandard}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('External URL')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.clearingInformation?.externalUrl}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Comment')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.clearingInformation?.comment}</div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Request Information')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Request ID')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.clearingInformation?.requestID}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Additional request Info')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.additionalRequestInfo}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Evaluation Start')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.clearingInformation?.procStart}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Evaluation End')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.clearingInformation?.evaluated}</div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Supplemental Information')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('External Supplier ID')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload.clearingInformation?.externalSupplierID}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Count of Security Vulnerabilities')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.clearingInformation?.countOfSecurityVn}</div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('ECC Information')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('ECC Status')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.eccInformation?.eccStatus}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('ECC Comment')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.eccInformation?.eccComment}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('AL')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.eccInformation?.al}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('ECCN')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.eccInformation?.eccn}</div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Commercial Details Administration')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Usage Right Available')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload?.cotsDetails?.usageRightAvailable === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('COTS Responsible')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.cotsDetails?.cotsResponsible}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('COTS Clearing Deadline')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.cotsDetails?.clearingDeadline}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('COTS Clearing Report URL')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.cotsDetails?.licenseClearingReportURL}</div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('COTS OSS Information')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Used License')}</div>
                            <div className='mt-2 col'>{finalReleasePayload?.cotsDetails?.usedLicense}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('OSS Information URL')}</div>
                            <div className='mt-2 col'>{finalReleasePayload.cotsDetails?.ossInformationURL}</div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Contains OSS')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload?.cotsDetails?.containsOSS === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('OSS Contract Signed')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload?.cotsDetails?.ossContractSigned === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Source Code Available')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload?.cotsDetails?.sourceCodeAvailable === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Attachments')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Attachments')}</div>
                            <div className='mt-2 col'>
                                {finalReleasePayload?.attachments?.map((attachment, index) => (
                                    <div
                                        key={index}
                                        className='mb-2'
                                    >
                                        {attachment.filename} ({attachment.attachmentType})
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
