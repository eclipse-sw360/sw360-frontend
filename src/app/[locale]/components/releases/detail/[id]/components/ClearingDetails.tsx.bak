// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode, useState } from 'react'

import fossologyIcon from '@/assets/images/fossology.svg'
import { Attachment, ReleaseDetail } from '@/object-types'
import { FossologyClearing } from 'next-sw360'
import AssessmentSummaryInfo from './AssessmentSummaryInfo'
import ClearingInformationStatus from './ClearingInformationStatus'
import RequestInformation from './RequestInformation'
import SPDXAttachments from './SPDXAttachments'
import SupplementalInformation from './SupplementalInformation'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'

interface Props {
    release: ReleaseDetail
    releaseId: string
    embeddedAttachments: Array<Attachment>
}

const ClearingDetails = ({ release, releaseId, embeddedAttachments }: Props) : ReactNode => {
    const t = useTranslations('default')
    const [toggle, setToggle] = useState(false)
    const [show, setShow] = useState(false)

    return (
        <div className='col'>
            <SPDXAttachments releaseId={releaseId} />
            <AssessmentSummaryInfo releaseId={releaseId} embeddedAttachments={embeddedAttachments} />
            <table className='table summary-table'>
                <thead
                    title='Click to expand or collapse'
                    onClick={() => {
                        setToggle(!toggle)
                    }}
                >
                    <tr>
                        <th colSpan={2}>{`${t('Clearing Details')}: ${release.name} ${release.version}`}</th>
                    </tr>
                </thead>
                <tbody hidden={toggle}>
                    <tr>
                        <td>{t('Clearing State')}:</td>
                        <td>
                            {
                                t(release.clearingState as never)
                            }
                            <Image
                                src={fossologyIcon as StaticImport}
                                width={15}
                                height={15}
                                style={{ marginLeft: '5px' }}
                                alt='Fossology'
                                onClick={() => setShow(true)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Binaries Original from Community')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation
                                        ? release.clearingInformation.binariesOriginalFromCommunity
                                        : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Binaries Self-Made')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation ? release.clearingInformation.binariesSelfMade : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Component License Information')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation
                                        ? release.clearingInformation.componentLicenseInformation
                                        : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Source Code Delivery')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation ? release.clearingInformation.sourceCodeDelivery : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Source Code Original from Community')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation
                                        ? release.clearingInformation.sourceCodeOriginalFromCommunity
                                        : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Source Code Tool-Made')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation ? release.clearingInformation.sourceCodeToolMade : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Source Code Self-Made')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation ? release.clearingInformation.sourceCodeSelfMade : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Screenshot of Website')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation
                                        ? release.clearingInformation.screenshotOfWebSite
                                        : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Finalized License Scan Report')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation
                                        ? release.clearingInformation.finalizedLicenseScanReport
                                        : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('License Scan Report Result')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation
                                        ? release.clearingInformation.licenseScanReportResult
                                        : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Legal Evaluation')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation ? release.clearingInformation.legalEvaluation : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('License Agreement')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation
                                        ? release.clearingInformation.licenseAgreement
                                        : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Scanned')}:</td>
                        <td>{release.clearingInformation && release.clearingInformation.scanned}</td>
                    </tr>
                    <tr>
                        <td>{t('Component Clearing Report')}:</td>
                        <td>
                            <ClearingInformationStatus
                                status={
                                    release.clearingInformation
                                        ? release.clearingInformation.componentClearingReport
                                        : false
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Clearing Standard')}:</td>
                        <td>{release.clearingInformation && release.clearingInformation.clearingStandard}</td>
                    </tr>
                    <tr>
                        <td>{t('External URL')}:</td>
                        <td>
                            {(release.clearingInformation && release.clearingInformation.externalUrl !== undefined) && (
                                <Link href={release.clearingInformation.externalUrl}>
                                    {release.clearingInformation.externalUrl}
                                </Link>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Comments')}:</td>
                        <td>{release.clearingInformation && release.clearingInformation.comment}</td>
                    </tr>
                </tbody>
            </table>
            <RequestInformation clearingInformation={release.clearingInformation} />
            <SupplementalInformation clearingInformation={release.clearingInformation} />
            <FossologyClearing show={show} setShow={setShow} releaseId={releaseId} />
        </div>
    )
}

export default ClearingDetails
