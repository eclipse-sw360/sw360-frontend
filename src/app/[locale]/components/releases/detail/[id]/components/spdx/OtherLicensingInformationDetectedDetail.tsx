// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { OtherLicensingInformationDetected, SPDXDocument } from '@/object-types'

interface Props {
    spdxDocument?: SPDXDocument
    indexOtherLicense?: number
    setIndexOtherLicense?: React.Dispatch<React.SetStateAction<number>>
    otherLicensingInformationDetecteds?: OtherLicensingInformationDetected[]
    isModeFull?: boolean
    toggleOther?: boolean
    setToggleOther?: React.Dispatch<React.SetStateAction<boolean>>
}

const OtherLicensingInformationDetectedDetail = ({
    spdxDocument,
    indexOtherLicense,
    setIndexOtherLicense,
    otherLicensingInformationDetecteds,
    isModeFull,
    toggleOther,
    setToggleOther,
}: Props) => {
    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index: string = e.target.value
        setIndexOtherLicense(parseInt(index))
    }

    return (
        <table className='table summary-table'>
            <thead
                title='Click to expand or collapse'
                onClick={() => {
                    setToggleOther(!toggleOther)
                }}
            >
                <tr>
                    <th colSpan={2}>10. Other Licensing Information Detected</th>
                </tr>
            </thead>
            <tbody hidden={toggleOther}>
                <tr>
                    <td className='spdx-label-index'>Index</td>
                    <td style={{ height: '50px' }}>
                        <select
                            id='otherLicensingSelect'
                            className='spdx-col-2'
                            onChange={displayIndex}
                            style={{ width: '100%' }}
                            disabled={spdxDocument?.otherLicensingInformationDetecteds.length == 0}
                        >
                            {spdxDocument?.otherLicensingInformationDetecteds
                                .toSorted((e1, e2) => e1.index - e2.index)
                                .map((item) => (
                                    <option
                                        key={item.index}
                                        value={item.index}
                                        selected={item.index === indexOtherLicense}
                                    >
                                        {item.index + 1}
                                    </option>
                                ))}
                        </select>
                    </td>
                </tr>
                {otherLicensingInformationDetecteds[indexOtherLicense] && (
                    <>
                        <tr data-index={otherLicensingInformationDetecteds[indexOtherLicense].index}>
                            <td>10.1 License identifier</td>
                            <td>
                                <div className='spdx-col-2'>
                                    {otherLicensingInformationDetecteds[indexOtherLicense].licenseId}
                                </div>
                            </td>
                        </tr>
                        <tr data-index={otherLicensingInformationDetecteds[indexOtherLicense].index}>
                            <td>10.2 Extracted text</td>
                            <td>
                                <p
                                    className='spdx-col-2 '
                                    id={`extractedText-${otherLicensingInformationDetecteds[indexOtherLicense].index}`}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                >
                                    {otherLicensingInformationDetecteds[indexOtherLicense]?.extractedText
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
                        <tr data-index={otherLicensingInformationDetecteds[indexOtherLicense].index}>
                            <td>10.3 License name</td>
                            <td>
                                <div className='spdx-col-2'>
                                    {otherLicensingInformationDetecteds[indexOtherLicense].licenseName}
                                </div>
                            </td>
                        </tr>
                        {isModeFull && (
                            <tr
                                className='spdx-full'
                                data-index={otherLicensingInformationDetecteds[indexOtherLicense].index}
                            >
                                <td>10.4 License cross reference</td>
                                <td>
                                    <p
                                        className='spdx-col-2 '
                                        id={`licenseCrossRefs-${otherLicensingInformationDetecteds[indexOtherLicense].index}`}
                                    >
                                        {otherLicensingInformationDetecteds[indexOtherLicense].licenseCrossRefs
                                            .sort()
                                            .map((licenseCrossRefsData) => {
                                                return (
                                                    <>
                                                        {licenseCrossRefsData}
                                                        <br></br>
                                                    </>
                                                )
                                            })}
                                    </p>
                                </td>
                            </tr>
                        )}
                        <tr data-index={otherLicensingInformationDetecteds[indexOtherLicense].index}>
                            <td>10.5 License comment</td>
                            <td>
                                <p
                                    className='spdx-col-2 '
                                    id={`otherLicenseComment-${otherLicensingInformationDetecteds[indexOtherLicense].index}`}
                                >
                                    {otherLicensingInformationDetecteds[indexOtherLicense]?.licenseComment
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
            </tbody>
        </table>
    )
}

export default OtherLicensingInformationDetectedDetail
