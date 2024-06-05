// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { ExternalReference, PackageInformation } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { useState } from 'react'
import styles from '../../detail.module.css'

interface Props {
    packageInformation?: PackageInformation
    externalRefsData?: ExternalReference
    setExternalRefsData?: React.Dispatch<React.SetStateAction<ExternalReference>>
    isModeFull?: boolean
}

const PackageInformationDetail = ({ packageInformation, externalRefsData, setExternalRefsData, isModeFull }: Props) => {
    const [toggle, setToggle] = useState(false)

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index: string = e.target.value
        setExternalRefsData(packageInformation.externalRefs[parseInt(index)])
    }

    return (
        <table className={`table label-value-table ${styles['summary-table']}`}>
            <thead
                title='Click to expand or collapse'
                onClick={() => {
                    setToggle(!toggle)
                }}
            >
                <tr>
                    <th colSpan={2}>7. Package Information</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr data-index={packageInformation?.index}>
                    <td>7.1 Package name</td>
                    <td>{packageInformation?.name}</td>
                </tr>
                <tr data-index={packageInformation?.index}>
                    <td>7.2 Package SPDX identifier</td>
                    <td>{packageInformation?.SPDXID}</td>
                </tr>
                <tr data-index={packageInformation?.index}>
                    <td>7.3 Package version</td>
                    <td>{packageInformation?.versionInfo}</td>
                </tr>
                <tr data-index={packageInformation?.index}>
                    <td>7.4 Package file name</td>
                    <td>{packageInformation?.packageFileName}</td>
                </tr>
                {isModeFull && (
                    <>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.5 Package supplier</td>
                            <td>{packageInformation?.supplier}</td>
                        </tr>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.6 Package originator</td>
                            <td>{packageInformation?.originator}</td>
                        </tr>
                    </>
                )}

                <tr className='spdx-full' data-index={packageInformation?.index}>
                    <td>7.7 Package download location</td>
                    <td>{packageInformation?.downloadLocation}</td>
                </tr>
                <tr className='spdx-full' data-index={packageInformation?.index}>
                    <td>7.8 Files analyzed</td>
                    <td className='spdx-col-3 spdx-uppercase'>{packageInformation?.filesAnalyzed.toString()}</td>
                </tr>
                {isModeFull && (
                    <>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.9 Package verification code</td>
                            <td>
                                <div className='spdx-col-2 spdx-flex-col'>
                                    <div className='spdx-flex-row'>
                                        <div className='spdx-col-1 spdx-key'>Value</div>
                                        <div className='spdx-col-3'>
                                            {packageInformation?.packageVerificationCode.value}
                                        </div>
                                    </div>
                                    <div className='spdx-flex-row'>
                                        <div className='spdx-col-1 spdx-key'>Excluded files</div>
                                        <p className='spdx-col-3 ' id='excludedFiles'>
                                            {packageInformation?.packageVerificationCode?.excludedFiles
                                                ?.sort()
                                                .filter((data) => !CommonUtils.isNullEmptyOrUndefinedString(data))
                                                .map((item) => {
                                                    return (
                                                        <>
                                                            {item}
                                                            <br></br>
                                                        </>
                                                    )
                                                })}
                                        </p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.10 Package checksum</td>
                            <td>
                                {packageInformation?.checksums.map((item) => {
                                    return (
                                        <div
                                            key={item.index}
                                            className='spdx-flex-row checksum'
                                            data-index={item.index}
                                        >
                                            <div className='spdx-col-1 spdx-key'>{item.algorithm}</div>
                                            <div className='spdx-col-3'>{item.checksumValue}</div>
                                        </div>
                                    )
                                })}
                            </td>
                        </tr>
                    </>
                )}

                <tr data-index={packageInformation?.index} className='spdx-full'>
                    <td>7.11 Package home page</td>
                    <td>{packageInformation?.homepage}</td>
                </tr>

                {isModeFull && (
                    <tr className='spdx-full' data-index={packageInformation?.index}>
                        <td>7.12 Source information</td>
                        <td>
                            {packageInformation?.sourceInfo
                                .trim()
                                .split('\n')
                                .map((item) => {
                                    return (
                                        <>
                                            {item}
                                            <br></br>
                                        </>
                                    )
                                })}
                        </td>
                    </tr>
                )}

                <tr data-index={packageInformation?.index} className='spdx-full'>
                    <td>7.13 Concluded license</td>
                    <td>{packageInformation?.licenseConcluded}</td>
                </tr>

                {isModeFull && (
                    <tr className='spdx-full' data-index={packageInformation?.index}>
                        <td>7.14 All licenses information from files</td>
                        <td>
                            <p className='spdx-col-2 ' id='licenseInfoFromFile'>
                                {packageInformation?.licenseInfoFromFiles
                                    .sort()
                                    .filter((license) => !CommonUtils.isNullEmptyOrUndefinedString(license))
                                    .map((item) => {
                                        return (
                                            <>
                                                {item}
                                                <br></br>
                                            </>
                                        )
                                    })}
                            </p>
                        </td>
                    </tr>
                )}

                <tr data-index={packageInformation?.index} className='spdx-full'>
                    <td>7.15 Declared license</td>
                    <td>{packageInformation?.licenseDeclared}</td>
                </tr>
                <tr data-index={packageInformation?.index} className='spdx-full'>
                    <td>7.16 Comments on license</td>
                    <td>
                        <p className='spdx-col-2 ' id='licenseComments'>
                            {packageInformation?.licenseComments
                                .trim()
                                .split('\n')
                                .map((item) => {
                                    return (
                                        <>
                                            {item}
                                            <br></br>
                                        </>
                                    )
                                })}
                        </p>
                    </td>
                </tr>
                <tr data-index={packageInformation?.index} className='spdx-full'>
                    <td>7.17 Copyright text</td>
                    <td>
                        <p className='spdx-col-2 ' id='copyrightText'>
                            {packageInformation?.copyrightText
                                .trim()
                                .split('\n')
                                .map((item) => {
                                    return (
                                        <>
                                            {item}
                                            <br></br>
                                        </>
                                    )
                                })}
                        </p>
                    </td>
                </tr>

                {isModeFull && (
                    <>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.18 Package summary description</td>
                            <td>
                                <p className='spdx-col-2 ' id='summary'>
                                    {packageInformation?.summary
                                        .trim()
                                        .split('\n')
                                        .map((item) => {
                                            return (
                                                <>
                                                    {item}
                                                    <br></br>
                                                </>
                                            )
                                        })}
                                </p>
                            </td>
                        </tr>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.19 Package detailed description</td>
                            <td>
                                <p className='spdx-col-2 ' id='description'>
                                    {packageInformation?.description
                                        .trim()
                                        .split('\n')
                                        .map((item) => {
                                            return (
                                                <>
                                                    {item}
                                                    <br></br>
                                                </>
                                            )
                                        })}
                                </p>
                            </td>
                        </tr>
                    </>
                )}

                <tr data-index={packageInformation?.index}>
                    <td>7.20 Package comment</td>
                    <td>
                        <p className='spdx-col-2 ' id='packageComment'>
                            {packageInformation?.packageComment
                                .trim()
                                .split('\n')
                                .map((item) => {
                                    return (
                                        <>
                                            {item}
                                            <br></br>
                                        </>
                                    )
                                })}
                        </p>
                    </td>
                </tr>
                {isModeFull && (
                    <>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.21 External references </td>
                            <td>
                                <div className='spdx-col-2 section' data-size='4'>
                                    <div className='spdx-flex-row'>
                                        <div className='spdx-col-1 spdx-label-index'>Index</div>
                                        <select
                                            id='externalReferenceSelect${package.index}'
                                            className='spdx-col-3'
                                            onChange={displayIndex}
                                            disabled={packageInformation?.externalRefs.length == 0}
                                        >
                                            {packageInformation?.externalRefs
                                                .toSorted((e1, e2) => e1.index - e2.index)
                                                .map((item) => (
                                                    <option key={item.index} value={item.index}>
                                                        {item.index + 1}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    {externalRefsData && (
                                        <>
                                            <div className='spdx-flex-row' data-index={externalRefsData.index}>
                                                <div className='spdx-col-1 spdx-key'>Category</div>
                                                <div className='spdx-col-3 spdx-uppercase'>
                                                    {externalRefsData.referenceCategory}
                                                </div>
                                            </div>
                                            <div className='spdx-flex-row' data-index={externalRefsData.index}>
                                                <div className='spdx-col-1 spdx-key'>Type</div>
                                                <div className='spdx-col-3'>{externalRefsData.referenceType}</div>
                                            </div>
                                            <div className='spdx-flex-row' data-index={externalRefsData.index}>
                                                <div className='spdx-col-1 spdx-key'>Locator</div>
                                                <div className='spdx-col-3'>{externalRefsData.referenceLocator}</div>
                                            </div>
                                            <div className='spdx-flex-row' data-index={externalRefsData.index}>
                                                <div className='spdx-col-1 spdx-key'>7.22 Comment</div>
                                                <p
                                                    className='spdx-col-3'
                                                    id='externalRefComment-${externalRefsData.index}'
                                                >
                                                    {externalRefsData?.comment
                                                        .trim()
                                                        .split('\n')
                                                        .map((item) => {
                                                            return (
                                                                <>
                                                                    {item}
                                                                    <br></br>
                                                                </>
                                                            )
                                                        })}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>

                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.23 Package attribution text</td>
                            <td>
                                <p className='spdx-col-2 ' id='attributionText'>
                                    {packageInformation?.attributionText
                                        .sort()
                                        .filter((license) => !CommonUtils.isNullEmptyOrUndefinedString(license))
                                        .map((item) => {
                                            return (
                                                <>
                                                    {item} <br></br>
                                                </>
                                            )
                                        })}
                                </p>
                            </td>
                        </tr>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.24 Primary Package Purpose </td>
                            <td>
                                <div className='spdx-col-2 ' id='primaryPackagePurpose'>
                                    {packageInformation?.primaryPackagePurpose
                                        .trim()
                                        .split('\n')
                                        .map((item) => {
                                            return (
                                                <>
                                                    {item}
                                                    <br></br>
                                                </>
                                            )
                                        })}
                                </div>
                            </td>
                        </tr>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.25 Release Date</td>
                            <td>
                                <p className='spdx-col-2 ' id='release-date-${loop.count}'>
                                    {packageInformation?.releaseDate}
                                </p>
                            </td>
                        </tr>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.26 Built Date</td>
                            <td>
                                <p className='spdx-col-2 ' id='built-date-${loop.count}'>
                                    {packageInformation?.builtDate}
                                </p>
                            </td>
                        </tr>
                        <tr className='spdx-full' data-index={packageInformation?.index}>
                            <td>7.27 Valid Until Date</td>
                            <td>
                                <p className='spdx-col-2 ' id='validUntil-date-${loop.count}'>
                                    {packageInformation?.validUntilDate}
                                </p>
                            </td>
                        </tr>
                    </>
                )}
            </tbody>
        </table>
    )
}

export default PackageInformationDetail
